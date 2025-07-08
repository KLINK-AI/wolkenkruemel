import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, Crown, AlertTriangle } from "lucide-react";
import SuggestedUsers from "./SuggestedUsers";
import TrendingTopics from "./TrendingTopics";
import PremiumInfoModal from "./PremiumInfoModal";
import { usePermissions, useUserStatus } from "@/hooks/usePermissions";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";

interface CommunityRightSidebarProps {
  currentUserId: number;
}

export default function CommunityRightSidebar({ currentUserId }: CommunityRightSidebarProps) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Use real authenticated user instead of mock
  const realUser = currentUser ? {
    id: currentUser.id,
    username: currentUser.username,
    email: currentUser.email,
    password: "",
    displayName: currentUser.displayName || null,
    firstName: null,
    lastName: null,
    bio: currentUser.bio || null,
    avatarUrl: currentUser.avatarUrl || null,
    location: currentUser.location || null,
    isEmailVerified: true,
    emailVerificationToken: null,
    role: currentUser.role || "user",
    status: "active",
    subscriptionTier: currentUser.subscriptionTier || "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    activitiesCreated: currentUser.activitiesCreated || 0,
    postsCreated: currentUser.postsCreated || 0,
    likesReceived: currentUser.likesReceived || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } : null;
  
  const permissions = usePermissions(realUser);
  const userStatus = useUserStatus(realUser);

  return (
    <div className="space-y-6">
      {/* Create Activity Card */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('activity.create')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {permissions.activityLimitMessage}
          </p>
          
          {permissions.canCreateActivity ? (
            <Link href="/activities/create">
              <Button className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('activity.create')}
              </Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="sm" 
                disabled
                variant="outline"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {permissions.hasUnlimitedActivities ? "Aktivitätslimit erreicht" : "Keine Berechtigung"}
              </Button>
              {!permissions.hasUnlimitedActivities && (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    // Demo upgrade - immediately activate premium
                    fetch('/api/demo-upgrade', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: realUser?.id })
                    }).then(() => {
                      window.location.reload();
                    });
                  }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Premium freischalten (Demo)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Unlock Card - Only show for free users */}
      {realUser?.subscriptionTier === "free" && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Crown className="w-5 h-5" />
              {t('premium.unlock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-600 dark:text-amber-200 mb-4">
              {t('premium.unlockDescription')}
            </p>
            <Button 
              variant="outline" 
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30" 
              size="sm"
              onClick={() => {
                // Demo upgrade - immediately activate premium
                fetch('/api/demo-upgrade', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: realUser?.id })
                }).then(() => {
                  window.location.reload();
                });
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium freischalten (Demo)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Status Card - Only show for premium users */}
      {realUser?.subscriptionTier === "premium" && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
              <Crown className="w-5 h-5" />
              Premium Aktiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 dark:text-green-200 mb-4">
              Sie haben Zugang zu allen Premium-Features und unbegrenzten Aktivitäten!
            </p>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Crown className="w-4 h-4" />
              <span>Premium-Mitglied</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Topics */}
      <TrendingTopics />

      {/* Suggested Users */}
      <SuggestedUsers currentUserId={currentUserId} />

      {/* Premium Info Modal */}
      <PremiumInfoModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
}