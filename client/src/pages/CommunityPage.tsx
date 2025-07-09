import { CommunitySidebar } from "@/components/community/community-sidebar";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/ui/user-stats";
import { Link } from "wouter";
import { Plus, Users, LogIn } from "lucide-react";

export default function CommunityPage() {
  const { currentUser } = useAuth();

  // Redirect non-authenticated users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Die Community-Seite ist nur für angemeldete Benutzer zugänglich. 
              Bitte melden Sie sich an oder registrieren Sie sich, um Zugang zu erhalten.
            </p>
            <div className="flex gap-2">
              <Link href="/login">
                <Button className="flex-1">
                  <LogIn className="w-4 h-4 mr-2" />
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="flex-1">
                  Registrieren
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar with Stats - Hidden on mobile, collapsible on tablet */}
          <div className="w-full lg:w-64 space-y-4">
            <div className="lg:block">
              <CommunitySidebar />
              
              {/* User Stats - moved to left sidebar */}
              {currentUser && (
                <Card className="mt-4">
                  <CardContent>
                    <UserStats userId={currentUser.id} compact />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-6 min-w-0">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Community Feed</h1>
              <p className="text-muted-foreground">
                Entdecke was andere Hundebesitzer in der Community teilen
              </p>
            </div>

            {/* Quick Actions - center aligned for posts only */}
            {currentUser && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    <Link href="/community/create-post">
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Beitrag erstellen
                      </Button>
                    </Link>
                  </div>
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