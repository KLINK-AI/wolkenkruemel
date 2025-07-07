import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Users, MessageCircleQuestion, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function CommunitySidebar() {
  const [location] = useLocation();
  const { currentUser } = useAuth();

  const navigationItems = [
    {
      icon: Home,
      label: "Feed",
      href: "/community",
      active: location === "/community"
    },
    {
      icon: Users,
      label: "Mein Netzwerk",
      href: "/community/network",
      active: location === "/community/network"
    },
    {
      icon: MessageCircleQuestion,
      label: "Q&A",
      href: "/community/qa",
      active: location === "/community/qa"
    }
  ];

  return (
    <div className="w-64 space-y-4">
      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Community</h3>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Schnelle Aktionen</h3>
          <div className="space-y-2">
            <Link href="/community/create-post">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Beitrag erstellen
              </Button>
            </Link>
            <Link href="/activities/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Aktivität erstellen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4" />
            <h3 className="font-semibold">Beliebte Themen</h3>
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              #Welpentraining
            </Badge>
            <Badge variant="secondary" className="text-xs">
              #Agility
            </Badge>
            <Badge variant="secondary" className="text-xs">
              #Hundespiele
            </Badge>
            <Badge variant="secondary" className="text-xs">
              #Leinenführigkeit
            </Badge>
            <Badge variant="secondary" className="text-xs">
              #Rückruf
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* User Status */}
      {currentUser && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary-foreground font-semibold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium">{currentUser.username}</p>
              <Badge 
                variant={currentUser.subscriptionTier === 'premium' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {currentUser.subscriptionTier === 'premium' ? 'Premium' : 'Kostenlos'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}