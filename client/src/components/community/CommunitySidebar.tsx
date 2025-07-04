import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, MessageCircle } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

interface CommunitySidebarProps {
  user: {
    id: number;
    name: string;
    avatar: string;
    activitiesCompleted: number;
    postsCreated: number;
    likesReceived: number;
  };
}

export default function CommunitySidebar({ user }: CommunitySidebarProps) {
  const { t } = useLanguage();
  
  const navigationItems = [
    { icon: Home, label: t('community.feed'), active: true },
    { icon: Users, label: t('community.network'), active: false },
    { icon: MessageCircle, label: t('community.forum'), active: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('community.title')}</CardTitle>
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
