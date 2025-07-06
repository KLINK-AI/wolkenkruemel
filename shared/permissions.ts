import { User } from "./schema";

export type UserStatus = "unverified" | "verified" | "pending_payment" | "active" | "premium";
export type SubscriptionTier = "free" | "premium" | "pro";

export interface UserPermissions {
  canCreateActivities: boolean;
  canCreatePosts: boolean;
  canComment: boolean;
  canLike: boolean;
  canShare: boolean;
  canSaveFavorites: boolean;
  maxActivities: number;
  hasUnlimitedActivities: boolean;
  canAccessCommunity: boolean;
  canSeeProgress: boolean;
}

export function getUserPermissions(user: User): UserPermissions {
  const status = user.status as UserStatus;
  const tier = user.subscriptionTier as SubscriptionTier;
  
  // Base permissions for unverified users
  const basePermissions: UserPermissions = {
    canCreateActivities: false,
    canCreatePosts: false,
    canComment: false,
    canLike: false,
    canShare: false,
    canSaveFavorites: false,
    maxActivities: 0,
    hasUnlimitedActivities: false,
    canAccessCommunity: false,
    canSeeProgress: false,
  };

  // Priority: if user has premium subscription, give premium permissions regardless of status
  if (tier === "premium" || tier === "professional") {
    return {
      canCreateActivities: true,
      canCreatePosts: true,
      canComment: true,
      canLike: true,
      canShare: true,
      canSaveFavorites: true,
      maxActivities: 0,
      hasUnlimitedActivities: true,
      canAccessCommunity: true,
      canSeeProgress: true,
    };
  }

  switch (status) {
    case "unverified":
      return basePermissions;
    
    case "verified":
      // Email verified but no payment yet - can view but not participate
      return {
        ...basePermissions,
        canAccessCommunity: true, // Can view community but not interact
      };
    
    case "pending_payment":
      // Has created first activity but payment not completed
      return {
        ...basePermissions,
        canAccessCommunity: true,
        canCreateActivities: true,
        maxActivities: 1,
      };
    
    case "active":
      // Payment completed, has basic access
      if (tier === "premium" || tier === "pro") {
        return {
          canCreateActivities: true,
          canCreatePosts: true,
          canComment: true,
          canLike: true,
          canShare: true,
          canSaveFavorites: true,
          maxActivities: 0,
          hasUnlimitedActivities: true,
          canAccessCommunity: true,
          canSeeProgress: true,
        };
      } else {
        // Free tier after payment
        return {
          canCreateActivities: true,
          canCreatePosts: true,
          canComment: true,
          canLike: true,
          canShare: false,
          canSaveFavorites: false,
          maxActivities: 5,
          hasUnlimitedActivities: false,
          canAccessCommunity: true,
          canSeeProgress: true,
        };
      }
    
    case "premium":
      // Premium subscription active
      return {
        canCreateActivities: true,
        canCreatePosts: true,
        canComment: true,
        canLike: true,
        canShare: true,
        canSaveFavorites: true,
        maxActivities: 0,
        hasUnlimitedActivities: true,
        canAccessCommunity: true,
        canSeeProgress: true,
      };
    
    default:
      return basePermissions;
  }
}

export function canUserCreateActivity(user: User): boolean {
  const permissions = getUserPermissions(user);
  
  if (!permissions.canCreateActivities) {
    return false;
  }
  
  if (permissions.hasUnlimitedActivities) {
    return true;
  }
  
  return (user.activitiesCreated || 0) < permissions.maxActivities;
}

export function getActivityLimitMessage(user: User): string {
  const permissions = getUserPermissions(user);
  
  if (permissions.hasUnlimitedActivities) {
    return "Unbegrenzte Aktivitäten";
  }
  
  const remaining = permissions.maxActivities - (user.activitiesCreated || 0);
  return `${remaining} von ${permissions.maxActivities} Aktivitäten verbleibend`;
}

export function canUserAccessFeature(user: User, feature: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(user);
  return permissions[feature] as boolean;
}

export function getUserAccessLevel(user: any): {
  canCreatePosts: boolean;
  canCreateComments: boolean;
  canSaveFavorites: boolean;
  canTrackProgress: boolean;
  needsEmailVerification: boolean;
  needsPremiumUpgrade: boolean;
  message: string;
} {
  const status = user.status || "unverified";
  const tier = user.subscriptionTier || "free";
  
  // For frontend users, we'll assume they have activities if they're verified
  // since the frontend user object doesn't include activitiesCreated
  const hasActivities = status === "verified" || status === "active" || status === "premium";
  
  // Not verified - needs email verification
  if (status === "unverified") {
    return {
      canCreatePosts: false,
      canCreateComments: false,
      canSaveFavorites: false,
      canTrackProgress: false,
      needsEmailVerification: true,
      needsPremiumUpgrade: false,
      message: "Du musst deine E-Mail bestätigen"
    };
  }
  
  // Verified with free tier - needs premium upgrade
  if ((status === "verified" || status === "active") && tier === "free") {
    return {
      canCreatePosts: false,
      canCreateComments: false,
      canSaveFavorites: false,
      canTrackProgress: false,
      needsEmailVerification: false,
      needsPremiumUpgrade: true,
      message: "Premium-Mitgliedschaft erforderlich"
    };
  }
  
  // Premium user - has all access
  if (tier === "premium" || tier === "pro" || status === "premium") {
    return {
      canCreatePosts: true,
      canCreateComments: true,
      canSaveFavorites: true,
      canTrackProgress: true,
      needsEmailVerification: false,
      needsPremiumUpgrade: false,
      message: "Alle Features verfügbar"
    };
  }
  
  // Default fallback - needs premium upgrade
  return {
    canCreatePosts: false,
    canCreateComments: false,
    canSaveFavorites: false,
    canTrackProgress: false,
    needsEmailVerification: false,
    needsPremiumUpgrade: true,
    message: "Premium-Mitgliedschaft erforderlich"
  };
}