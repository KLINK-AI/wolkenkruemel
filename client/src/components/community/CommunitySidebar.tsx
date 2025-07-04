import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, MessageCircle, Trophy, Calendar } from "lucide-react";

interface CommunitySidebarProps {
  user: {
    activitiesCompleted: number;
    postsCreated: number;
    likesReceived: number;
  };
}

export default function CommunitySidebar({ user }: CommunitySidebarProps) {
  const navigationItems = [
    { icon: Home, label: "Feed", active: true },
    { icon: Users, label: "My Network", active: false },
    { icon: MessageCircle, label: "Q&A Forum", active: false },
    { icon: Trophy, label: "Success Stories", active: false },
    { icon: Calendar, label: "Events", active: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${
                  item.active 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Activities Completed</span>
              <span className="text-sm font-medium text-primary">{user.activitiesCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Posts Created</span>
              <span className="text-sm font-medium text-secondary">{user.postsCreated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Likes Received</span>
              <span className="text-sm font-medium text-accent">{user.likesReceived}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
