import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Star, Plus, Search, Filter, Heart } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useState, useMemo } from "react";

interface Activity {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  likes: number;
  completions: number;
  tags?: string[];
  createdAt?: string;
  author: {
    displayName: string;
    username: string;
  };
}

export default function ActivitiesPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Check if user is authenticated
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  };
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user-progress", userId],
    queryFn: async () => {
      const response = await fetch(`/api/user-progress/${userId}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Get all available tags from activities
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    activities.forEach(activity => {
      activity.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [activities]);

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter((activity) => {
      // Text search
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Difficulty filter
      const matchesDifficulty = difficultyFilter === "all" || activity.difficulty === difficultyFilter;
      
      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => activity.tags?.includes(tag));
      
      // Favorites filter
      const isFavorite = userProgress.some((progress: any) => 
        progress.activityId === activity.id && progress.favorite
      );
      const matchesFavorites = !showFavoritesOnly || isFavorite;
      

      
      return matchesSearch && matchesDifficulty && matchesTags && matchesFavorites;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
        case "likes":
          return b.likes - a.likes;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "difficulty":
          const difficultyOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activities, searchTerm, difficultyFilter, sortBy, showFavoritesOnly, selectedTags, userProgress]);

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
    <div className="min-h-screen bg-background">{/* Navigation is now handled by Layout component */}

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

        {/* Filter and Search Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Aktivitäten durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Difficulty Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Schwierigkeit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Schwierigkeiten</SelectItem>
                      <SelectItem value="beginner">Anfänger</SelectItem>
                      <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                      <SelectItem value="advanced">Experte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sortieren nach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Neueste</SelectItem>
                    <SelectItem value="oldest">Älteste</SelectItem>
                    <SelectItem value="likes">Beliebteste</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="difficulty">Schwierigkeit</SelectItem>
                  </SelectContent>
                </Select>

                {/* Favorites Toggle */}
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="flex items-center space-x-2"
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  <span>Nur Favoriten</span>
                </Button>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedActivities.length} von {activities.length} Aktivitäten
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedActivities.map((activity) => (
            <div key={activity.id}>
              {currentUser ? (
                <Link href={`/activities/${activity.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
                </Link>
              ) : (
                <Card className="hover:shadow-lg transition-shadow">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          alert('Bitte melden Sie sich an, um Aktivitäten anzusehen. Nur registrierte Benutzer können auf die vollständigen Aktivitätsinhalte zugreifen.');
                        }}
                      >
                        Anmelden erforderlich
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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