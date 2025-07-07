import { CommunitySidebar } from "@/components/community/community-sidebar";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/ui/user-stats";
import { Link } from "wouter";

export default function CommunityPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <CommunitySidebar />
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Community Feed</h1>
              <p className="text-muted-foreground">
                Entdecke was andere Hundebesitzer in der Community teilen
              </p>
            </div>

            {/* User Stats - only for authenticated users */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Deine Statistiken</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStats userId={currentUser.id} />
                </CardContent>
              </Card>
            )}

            {/* Community Feed */}
            <CommunityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}