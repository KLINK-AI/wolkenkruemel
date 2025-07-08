import { CommunitySidebar } from "@/components/community/community-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/ui/user-stats";

export default function CommunityNetworkPage() {
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
              <h1 className="text-3xl font-bold mb-2">Mein Netzwerk</h1>
              <p className="text-muted-foreground">
                Vernetze dich mit anderen Hundebesitzern und Trainern
              </p>
            </div>

            {/* User Stats - only for authenticated users */}
            {currentUser && (
              <Card>
                <CardContent>
                  <UserStats userId={currentUser.id} />
                </CardContent>
              </Card>
            )}

            {/* Network Content */}
            <Card>
              <CardHeader>
                <CardTitle>Dein Netzwerk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">Das Netzwerk-Feature wird bald verfügbar sein!</p>
                  <p className="text-sm mt-2">
                    Hier kannst du anderen Hundebesitzern folgen, ihre Aktivitäten verfolgen und dich vernetzen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}