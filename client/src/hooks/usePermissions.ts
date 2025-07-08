import { useMemo } from "react";
import { User } from "@shared/schema";
import { getUserPermissions, canUserCreateActivity, getActivityLimitMessage, getUserAccessLevel } from "@shared/permissions";

export function usePermissions(user: User | null) {
  return useMemo(() => {
    if (!user) {
      return {
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
        canCreateActivity: false,
        activityLimitMessage: "Nicht angemeldet",
        needsEmailVerification: false,
        needsPremiumUpgrade: false,
        denialReason: "not_logged_in",
      };
    }

    // Check the actual subscription tier from the user object
    const isVerified = true; // All logged in users are assumed verified for now
    const isPremium = user.subscriptionTier === "premium" || user.subscriptionTier === "professional";
    
    const permissions = getUserPermissions(user);
    
    return {
      ...permissions,
      canCreateActivity: canUserCreateActivity(user),
      activityLimitMessage: getActivityLimitMessage(user),
      canCreatePosts: isPremium, // Premium users can create posts
      canComment: isPremium, // Premium users can comment
      canSaveFavorites: isPremium, // Premium users can save favorites
      canSeeProgress: isPremium, // Premium users can track progress
      needsEmailVerification: false, // Assume all logged in users are verified
      needsPremiumUpgrade: !isPremium, // Only free users need premium upgrade
      denialReason: isPremium ? null : "premium_upgrade",
      // Override for free users - they can create up to 5 activities
      canCreateActivities: isPremium || permissions.maxActivities === 0 || permissions.maxActivities > 0,
    };
  }, [user]);
}

export function useUserStatus(user: User | null) {
  return useMemo(() => {
    if (!user) {
      return {
        status: "not_logged_in",
        statusText: "Nicht angemeldet",
        nextStep: "login",
        nextStepText: "Anmelden",
      };
    }

    const status = user.status || "unverified";
    
    switch (status) {
      case "unverified":
        return {
          status,
          statusText: "E-Mail nicht bestätigt",
          nextStep: "verify_email",
          nextStepText: "E-Mail bestätigen",
        };
      
      case "verified":
        return {
          status,
          statusText: "E-Mail bestätigt",
          nextStep: "create_first_activity",
          nextStepText: "Erste Aktivität erstellen",
        };
      
      case "pending_payment":
        return {
          status,
          statusText: "Zahlung ausstehend",
          nextStep: "complete_payment",
          nextStepText: "Zahlung abschließen",
        };
      
      case "active":
        if (user.subscriptionTier === "premium") {
          return {
            status,
            statusText: "Premium-Mitglied",
            nextStep: "enjoy",
            nextStepText: "Alle Features nutzen",
          };
        }
        return {
          status,
          statusText: "Aktives Mitglied (Kostenlos)",
          nextStep: "upgrade",
          nextStepText: "Auf Premium upgraden",
        };
      
      case "premium":
        return {
          status,
          statusText: "Premium-Mitglied",
          nextStep: "enjoy",
          nextStepText: "Alle Features nutzen",
        };
      
      default:
        return {
          status: "unknown",
          statusText: "Unbekannter Status",
          nextStep: "contact_support",
          nextStepText: "Support kontaktieren",
        };
    }
  }, [user]);
}