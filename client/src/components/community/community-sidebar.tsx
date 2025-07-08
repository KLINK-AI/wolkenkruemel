import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Users, MessageCircleQuestion, TrendingUp, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function CommunitySidebar() {
  const [location] = useLocation();
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="space-y-4">
      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3 lg:block">
            <h3 className="font-semibold">Community</h3>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
          <nav className={cn("space-y-1", "lg:block", isExpanded ? "block" : "hidden lg:block")}>
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

      {/* Activity Creation Button */}
      {currentUser && (
        <Card className={cn("lg:block", isExpanded ? "block" : "hidden lg:block")}>
          <CardContent className="p-4">
            <Link href="/activities/create">
              <Button className="w-full flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Aktivität erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Trending Topics */}
      <Card className={cn("lg:block", isExpanded ? "block" : "hidden lg:block")}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4" />
            <h3 className="font-semibold">Beliebte Themen</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-medium border-primary/50 text-primary">
              #Welpentraining
            </Badge>
            <Badge variant="outline" className="text-xs font-medium border-primary/50 text-primary">
              #Agility
            </Badge>
            <Badge variant="outline" className="text-xs font-medium border-primary/50 text-primary">
              #Hundespiele
            </Badge>
            <Badge variant="outline" className="text-xs font-medium border-primary/50 text-primary">
              #Leinenführigkeit
            </Badge>
            <Badge variant="outline" className="text-xs font-medium border-primary/50 text-primary">
              #Rückruf
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* User Status */}
      {currentUser && (
        <Card className={cn("lg:block", isExpanded ? "block" : "hidden lg:block")}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center mx-auto mb-2">
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.displayName || currentUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground font-semibold">
                    {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">{currentUser.displayName || currentUser.username}</p>
              {currentUser.subscriptionTier === 'premium' && (
                <Badge variant="default" className="text-xs mt-1 px-1.5 py-0.5">
                  Premium
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}