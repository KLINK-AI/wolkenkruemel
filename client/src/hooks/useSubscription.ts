import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export type SubscriptionTier = 'free' | 'premium' | 'professional';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  features: string[];
  limits: {
    activitiesPerMonth: number;
    postsPerDay: number;
    commentsPerDay: number;
    followersLimit: number;
  };
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    activitiesPerMonth: number;
    postsPerDay: number;
    commentsPerDay: number;
    followersLimit: number;
  };
  stripePriceId?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Community',
    price: 0,
    interval: 'month',
    features: [
      'Access to community feed',
      'Basic Q&A participation',
      'View official activities',
      'Basic profile features'
    ],
    limits: {
      activitiesPerMonth: 1,
      postsPerDay: 5,
      commentsPerDay: 20,
      followersLimit: 50,
    }
  },
  {
    id: 'premium',
    name: 'Pro Trainer',
    price: 9.99,
    interval: 'month',
    features: [
      'Everything in Community',
      'Unlimited activity creation',
      'Priority community support',
      'Access to premium activities',
      'Advanced analytics',
      'Custom profile branding',
      'Event hosting privileges'
    ],
    limits: {
      activitiesPerMonth: -1, // unlimited
      postsPerDay: 50,
      commentsPerDay: 200,
      followersLimit: 1000,
    },
    stripePriceId: process.env.VITE_STRIPE_PREMIUM_PRICE_ID
  },
  {
    id: 'professional',
    name: 'Expert',
    price: 29.99,
    interval: 'month',
    features: [
      'Everything in Pro Trainer',
      'Verified trainer badge',
      'Direct messaging with users',
      'Advanced moderation tools',
      'API access for integrations',
      'Priority feature requests',
      'Revenue sharing program'
    ],
    limits: {
      activitiesPerMonth: -1, // unlimited
      postsPerDay: -1, // unlimited
      commentsPerDay: -1, // unlimited
      followersLimit: -1, // unlimited
    },
    stripePriceId: process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID
  }
];

export function useSubscription(userId?: number) {
  return useQuery({
    queryKey: ["/api/users", userId, "subscription"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!userId) throw new Error("User ID required");
      
      const response = await fetch(`/api/users/${userId}/subscription`);
      if (!response.ok) throw new Error("Failed to fetch subscription status");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubscriptionPlans() {
  return {
    data: subscriptionPlans,
    isLoading: false,
    error: null,
  };
}

export function useCreateSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      priceId 
    }: { 
      userId: number; 
      priceId: string;
    }): Promise<{ clientSecret: string; subscriptionId: string }> => {
      const response = await apiRequest("POST", "/api/get-or-create-subscription", {
        userId,
        priceId,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.userId, "subscription"] 
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCancelSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      await apiRequest("POST", `/api/users/${userId}/subscription/cancel`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.userId, "subscription"] 
      });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be cancelled at the end of the current period.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUsageStats(userId?: number) {
  return useQuery({
    queryKey: ["/api/users", userId, "usage"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      const response = await fetch(`/api/users/${userId}/usage`);
      if (!response.ok) throw new Error("Failed to fetch usage stats");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to check if user has access to a feature
export function useFeatureAccess(feature: string, userId?: number) {
  const { data: subscription } = useSubscription(userId);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!subscription) {
      setHasAccess(false);
      return;
    }

    // Define feature access rules
    const featureAccess: Record<string, SubscriptionTier[]> = {
      'unlimited_activities': ['premium', 'professional'],
      'custom_branding': ['premium', 'professional'],
      'advanced_analytics': ['premium', 'professional'],
      'event_hosting': ['premium', 'professional'],
      'verified_badge': ['professional'],
      'direct_messaging': ['professional'],
      'moderation_tools': ['professional'],
      'api_access': ['professional'],
      'revenue_sharing': ['professional'],
    };

    const allowedTiers = featureAccess[feature] || [];
    setHasAccess(allowedTiers.includes(subscription.tier));
  }, [subscription, feature]);

  return hasAccess;
}

// Hook to check if user has reached usage limits
export function useUsageLimit(limitType: string, userId?: number) {
  const { data: subscription } = useSubscription(userId);
  const { data: usage } = useUsageStats(userId);
  const [isLimited, setIsLimited] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!subscription || !usage) {
      setIsLimited(false);
      setRemaining(0);
      return;
    }

    const limits = subscription.limits;
    const currentUsage = usage[limitType] || 0;

    let limit: number;
    switch (limitType) {
      case 'activitiesPerMonth':
        limit = limits.activitiesPerMonth;
        break;
      case 'postsPerDay':
        limit = limits.postsPerDay;
        break;
      case 'commentsPerDay':
        limit = limits.commentsPerDay;
        break;
      case 'followersLimit':
        limit = limits.followersLimit;
        break;
      default:
        limit = -1; // unlimited
    }

    if (limit === -1) {
      // Unlimited
      setIsLimited(false);
      setRemaining(-1);
    } else {
      setIsLimited(currentUsage >= limit);
      setRemaining(Math.max(0, limit - currentUsage));
    }
  }, [subscription, usage, limitType]);

  return { isLimited, remaining };
}

// Hook for subscription-based routing/access control
export function useSubscriptionGate(requiredTier: SubscriptionTier, userId?: number) {
  const { data: subscription, isLoading } = useSubscription(userId);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!subscription) {
      setHasAccess(false);
      return;
    }

    const tierHierarchy: Record<SubscriptionTier, number> = {
      'free': 0,
      'premium': 1,
      'professional': 2,
    };

    const userTierLevel = tierHierarchy[subscription.tier];
    const requiredTierLevel = tierHierarchy[requiredTier];

    setHasAccess(userTierLevel >= requiredTierLevel);
  }, [subscription, requiredTier]);

  return { hasAccess, isLoading, subscription };
}

// Utility functions
export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === tier);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function isFeatureAvailable(feature: string, tier: SubscriptionTier): boolean {
  const plan = getSubscriptionPlan(tier);
  return plan?.features.some(f => f.toLowerCase().includes(feature.toLowerCase())) || false;
}

// Hook for upgrade prompts
export function useUpgradePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptFeature, setPromptFeature] = useState<string>('');

  const triggerUpgradePrompt = (feature: string) => {
    setPromptFeature(feature);
    setShowPrompt(true);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    setPromptFeature('');
  };

  return {
    showPrompt,
    promptFeature,
    triggerUpgradePrompt,
    dismissPrompt,
  };
}
