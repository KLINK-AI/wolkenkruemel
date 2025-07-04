import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, User, Mail, MapPin, Calendar, Edit3 } from "lucide-react";

// Mock current user - in real app this would come from auth context
const currentUser = {
  id: 1,
  username: "steve",
  email: "steve@example.com",
  displayName: "Steve",
  bio: "Hundeliebhaber und Trainer aus Berlin. Spezialisiert auf Agility-Training und Verhaltenskorrektur.",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  location: "Berlin, Deutschland",
  joinedDate: "2024-03-15",
  activitiesCreated: 8,
  postsCreated: 15,
  likesReceived: 127,
  subscriptionTier: "premium"
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName,
    bio: currentUser.bio,
    location: currentUser.location,
    email: currentUser.email
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("PATCH", `/api/users/${currentUser.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Profildaten wurden erfolgreich gespeichert.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser.id] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      {currentUser.displayName}
                    </h1>
                    <p className="text-muted-foreground">@{currentUser.username}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentUser.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Dabei seit {formatDate(currentUser.joinedDate)}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? "Abbrechen" : "Profil bearbeiten"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <Separator className="my-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {currentUser.activitiesCreated}
                </div>
                <div className="text-sm text-muted-foreground">Aktivitäten erstellt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {currentUser.postsCreated}
                </div>
                <div className="text-sm text-muted-foreground">Beiträge verfasst</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {currentUser.likesReceived}
                </div>
                <div className="text-sm text-muted-foreground">Likes erhalten</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentUser.subscriptionTier === "premium" ? "Premium" : "Basic"}
                </div>
                <div className="text-sm text-muted-foreground">Mitgliedschaft</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Persönliche Informationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Anzeigename</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Ihr Anzeigename"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="ihre@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Standort</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Stadt, Land"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Über mich</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Erzählen Sie etwas über sich und Ihre Erfahrung mit Hunden..."
                      rows={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? "Speichere..." : "Änderungen speichern"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Anzeigename</Label>
                    <p className="text-foreground">{currentUser.displayName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">E-Mail</Label>
                    <p className="text-foreground">{currentUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Standort</Label>
                    <p className="text-foreground">{currentUser.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Über mich</Label>
                    <p className="text-foreground">{currentUser.bio}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Konto-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Benutzername</Label>
                <p className="text-foreground">@{currentUser.username}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mitglied seit</Label>
                <p className="text-foreground">{formatDate(currentUser.joinedDate)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Aktueller Plan</Label>
                <p className="text-foreground">
                  {currentUser.subscriptionTier === "premium" ? "Premium Mitgliedschaft" : "Basis Mitgliedschaft"}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Passwort ändern
                </Button>
                <Button variant="outline" className="w-full">
                  Plan verwalten
                </Button>
                <Button variant="outline" className="w-full">
                  Benachrichtigungen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}