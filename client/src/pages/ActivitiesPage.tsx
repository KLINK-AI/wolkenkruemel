import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, Plus } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

interface Activity {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  likes: number;
  completions: number;
  author: {
    displayName: string;
    username: string;
  };
}

export default function ActivitiesPage() {
  const { t } = useLanguage();
  
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <img
                    src="/Wolkenkruemel.png"
                    alt="Wolkenkrümel"
                    className="h-8 w-8"
                  />
                  <span className="text-xl font-bold text-foreground">Wolkenkrümel</span>
                </Link>
                <nav className="flex space-x-6">
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('nav.home')}
                  </Link>
                  <Link href="/activities" className="text-primary font-medium">
                    {t('nav.activities')}
                  </Link>
                  <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('nav.community')}
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <img
                  src="/wolkenkruemel.png"
                  alt="Wolkenkrümel"
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold text-foreground">Wolkenkrümel</span>
              </Link>
              <nav className="flex space-x-6">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
                <Link href="/activities" className="text-primary font-medium">
                  {t('nav.activities')}
                </Link>
                <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.community')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('activities.title')}</h1>
            <p className="text-muted-foreground">{t('activities.subtitle')}</p>
          </div>
          <Link href="/create-activity">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('activities.create')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{activity.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity.description}
                    </p>
                  </div>
                  <Badge variant={
                    activity.difficulty === 'beginner' ? 'default' :
                    activity.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                  }>
                    {t(`difficulty.${activity.difficulty}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration} {t('activities.minutes')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{activity.completions}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{activity.likes}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('activities.by')} {activity.author?.displayName || activity.author?.username || 'Unbekannter Autor'}
                  </span>
                  <Button variant="outline" size="sm">
                    {t('activities.view')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">{t('activities.noActivities')}</h3>
            <p className="text-muted-foreground mb-4">{t('activities.noActivitiesDesc')}</p>
            <Link href="/create-activity">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('activities.createFirst')}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}