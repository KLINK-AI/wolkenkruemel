import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Check, 
  Lock, 
  Users, 
  MessageCircle, 
  Activity,
  Calendar,
  Star
} from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Community",
    price: 0,
    interval: "forever",
    features: [
      "Access to community feed",
      "Basic Q&A participation",
      "View official activities",
      "Create 1 activity per month",
      "Basic profile features"
    ]
  },
  {
    id: "premium",
    name: "Pro Trainer",
    price: 9.99,
    interval: "month",
    popular: true,
    features: [
      "Everything in Community",
      "Unlimited activity creation",
      "Priority community support",
      "Access to premium activities",
      "Advanced analytics",
      "Custom profile branding",
      "Event hosting privileges"
    ]
  },
  {
    id: "professional",
    name: "Expert",
    price: 29.99,
    interval: "month",
    features: [
      "Everything in Pro Trainer",
      "Verified trainer badge",
      "Direct messaging with users",
      "Advanced moderation tools",
      "API access for integrations",
      "Priority feature requests",
      "Revenue sharing program"
    ]
  }
];

interface SubscriptionGateProps {
  currentTier?: string;
  requiredTier: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const CheckoutForm = ({ tier }: { tier: SubscriptionTier }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/community?subscription=success",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe} 
        className="w-full bg-primary hover:bg-primary/90"
      >
        Subscribe to {tier.name}
      </Button>
    </form>
  );
};

const SubscriptionModal = ({ 
  tier, 
  onClose, 
  clientSecret 
}: { 
  tier: SubscriptionTier; 
  onClose: () => void; 
  clientSecret: string;
}) => {
  if (!clientSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Setting up your subscription...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-primary" />
            <span>Subscribe to {tier.name}</span>
          </CardTitle>
          <CardDescription>
            ${tier.price}/{tier.interval}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm tier={tier} />
          </Elements>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function SubscriptionGate({ 
  currentTier = "free", 
  requiredTier, 
  children, 
  fallback 
}: SubscriptionGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Mock user for now - in real app this would come from auth context
  const { data: user } = useQuery({
    queryKey: ["/api/users/current"],
    queryFn: async () => {
      // Return mock user data - replace with actual API call
      return { 
        id: 1, 
        subscriptionTier: currentTier,
        activitiesCreated: 0 
      };
    },
  });

  const tierOrder = ["free", "premium", "professional"];
  const userTierIndex = tierOrder.indexOf(currentTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  // User has access if their tier is equal or higher than required
  const hasAccess = userTierIndex >= requiredTierIndex;

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier.id === "free") return;
    
    setSelectedTier(tier);
    
    try {
      const response = await apiRequest("POST", "/api/get-or-create-subscription", {
        priceId: `price_${tier.id}`, // This would be the actual Stripe price ID
        tier: tier.id
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral">Premium Feature</h3>
              <p className="text-sm text-gray-600">
                This feature requires a {requiredTier} subscription or higher.
              </p>
            </div>
            <Button 
              onClick={() => {
                // Demo upgrade - immediately activate premium
                fetch('/api/demo-upgrade', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user?.id })
                }).then(() => {
                  window.location.reload();
                }).catch(error => {
                  console.error('Demo upgrade failed:', error);
                });
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium freischalten (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Choose Your Plan</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpgrade(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionTiers.map((tier) => (
                  <Card 
                    key={tier.id} 
                    className={`relative ${
                      tier.popular ? 'border-primary shadow-lg' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary">
                        {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        {tier.price > 0 && (
                          <span className="text-sm font-normal text-gray-500">
                            /{tier.interval}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        onClick={() => handleUpgrade(tier)}
                        disabled={currentTier === tier.id}
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-secondary hover:bg-secondary/90'
                        }`}
                      >
                        {currentTier === tier.id 
                          ? 'Current Plan' 
                          : tier.price === 0 
                            ? 'Current Plan' 
                            : 'Upgrade'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTier && clientSecret && (
        <SubscriptionModal
          tier={selectedTier}
          clientSecret={clientSecret}
          onClose={() => {
            setSelectedTier(null);
            setClientSecret("");
            setShowUpgrade(false);
          }}
        />
      )}
    </div>
  );
}
