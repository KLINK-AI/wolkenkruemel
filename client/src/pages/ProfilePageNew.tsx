import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/components/LanguageProvider";
import { User, Activity } from "@shared/schema";
import { User as UserIcon, Mail, Calendar, Heart, MessageCircle, Trophy } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name muss mindestens 2 Zeichen haben").optional(),
  bio: z.string().max(500, "Biografie darf maximal 500 Zeichen haben").optional(),
  avatarUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

// Get current user from localStorage for demo purposes
const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Listen for storage changes to update user data
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff8f3] dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Sie müssen sich anmelden, um Ihr Profil zu sehen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/login'}>
              Anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: currentUser.displayName || "",
      bio: currentUser.bio || "",
      avatarUrl: currentUser.avatarUrl || "",
    },
  });

  // Fetch user's activities
  const { data: userActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activities', 'by-author', currentUser.id],
    enabled: !!currentUser.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}`, data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      
      setIsEditing(false);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Profil konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Premium</Badge>;
      default:
        return <Badge variant="outline">Kostenlos</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#eff8f3] dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.displayName || currentUser.username} />
                <AvatarFallback className="text-2xl">
                  {getInitials(currentUser.displayName || currentUser.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentUser.displayName || currentUser.username}
                  </h1>
                  {getSubscriptionBadge(currentUser.subscriptionTier || 'free')}
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <UserIcon className="w-4 h-4" />
                  <span>@{currentUser.username}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                  {currentUser.isEmailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Verifiziert
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Mitglied seit {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('de-DE', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}</span>
                </div>
                
                {currentUser.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {currentUser.bio}
                  </p>
                )}
                
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="mb-4"
                >
                  Profil bearbeiten
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Aktivitäten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentUser.activitiesCreated || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erstellte Aktivitäten
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Beiträge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentUser.postsCreated || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veröffentlichte Beiträge
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentUser.likesReceived || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erhaltene Likes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Meine Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : userActivities && userActivities.length > 0 ? (
              <div className="space-y-4">
                {userActivities.slice(0, 3).map((activity: Activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{activity.difficulty}</Badge>
                        {activity.duration && (
                          <span className="text-sm text-gray-500">
                            {activity.duration} Min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Sie haben noch keine Aktivitäten erstellt.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Profil bearbeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anzeigename</FormLabel>
                        <FormControl>
                          <Input placeholder="Ihr Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografie</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Erzählen Sie etwas über sich..." 
                            className="resize-none"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Speichern..." : "Speichern"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}