import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, MapPin, Calendar, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    email: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Update form data when user loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || currentUser.username || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        email: currentUser.email || ""
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div className="flex justify-center items-center h-64">Not authenticated</div>;
  }

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
      // Update local storage
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent('userChanged'));
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
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName || currentUser.username} />
                  <AvatarFallback className="text-2xl">
                    {(currentUser.displayName || currentUser.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {currentUser.displayName || currentUser.username || "Unnamed User"}
                    </h1>
                    <p className="text-lg text-muted-foreground">@{currentUser.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? "Abbrechen" : "Bearbeiten"}
                  </Button>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground mb-4">
                  {currentUser.bio || "Noch keine Beschreibung hinzugefügt."}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {currentUser.email}
                  </div>
                  {currentUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {currentUser.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Seit {formatDate(currentUser.createdAt || new Date().toISOString())}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Profil bearbeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="location">Standort</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Stadt, Land"
                    />
                  </div>
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
                  <Label htmlFor="bio">Über mich</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Erzählen Sie etwas über sich und Ihre Hundeerfahrung..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfileMutation.isPending ? "Speichern..." : "Speichern"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Aktivitäten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {currentUser.activitiesCreated || 0}
              </div>
              <p className="text-sm text-muted-foreground">erstellt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Beiträge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {currentUser.postsCreated || 0}
              </div>
              <p className="text-sm text-muted-foreground">verfasst</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {currentUser.likesReceived || 0}
              </div>
              <p className="text-sm text-muted-foreground">erhalten</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {currentUser.subscriptionTier === "premium" ? "Premium" : 
                   currentUser.subscriptionTier === "professional" ? "Professional" : "Kostenlos"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.subscriptionTier === "premium" ? "Unbegrenzte Aktivitäten und Premium-Features" : 
                   currentUser.subscriptionTier === "professional" ? "Alle Features für Profis" : "Begrenzte Features"}
                </p>
              </div>
              {currentUser.subscriptionTier === "free" && (
                <Button>
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}