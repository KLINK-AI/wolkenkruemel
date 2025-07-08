import { CommunitySidebar } from "@/components/community/community-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/ui/user-stats";

export default function CommunityQAPage() {
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
              <h1 className="text-3xl font-bold mb-2">Q&A Forum</h1>
              <p className="text-muted-foreground">
                Stelle Fragen und bekomme Antworten von der Community
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

            {/* Q&A Content */}
            <Card>
              <CardHeader>
                <CardTitle>Fragen & Antworten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">Das Q&A-Forum wird bald verfügbar sein!</p>
                  <p className="text-sm mt-2">
                    Hier kannst du Fragen zum Hundetraining stellen und anderen bei ihren Fragen helfen.
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