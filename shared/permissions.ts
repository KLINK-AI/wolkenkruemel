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