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

interface CommunityRightSidebarProps {
  currentUserId: number;
}

export default function CommunityRightSidebar({ currentUserId }: CommunityRightSidebarProps) {
  const { t } = useLanguage();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Mock user for demonstration - in real app this would come from useAuth
  const mockUser = {
    id: currentUserId,
    username: "testuser",
    email: "test@example.com",
    password: "",
    displayName: "Test User",
    firstName: null,
    lastName: null,
    bio: null,
    avatarUrl: null,
    location: null,
    isEmailVerified: true,
    emailVerificationToken: null,
    role: "user",
    status: "active",
    subscriptionTier: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    activitiesCreated: 5,
    postsCreated: 0,
    likesReceived: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const permissions = usePermissions(mockUser);
  const userStatus = useUserStatus(mockUser);

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
                  onClick={() => setIsPremiumModalOpen(true)}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Premium für mehr Aktivitäten
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Unlock Card */}
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
            onClick={() => setIsPremiumModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-2" />
            {t('premium.unlock')}
          </Button>
        </CardContent>
      </Card>

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