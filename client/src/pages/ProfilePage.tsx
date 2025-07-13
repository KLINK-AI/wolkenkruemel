import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
// HEIC conversion utility using backend API
const convertHeicToJpeg = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('heicFile', file);

  const response = await fetch('/api/convert-heic', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'HEIC conversion failed');
  }

  const result = await response.json();
  return result.dataUrl;
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, MapPin, Calendar, Edit3, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserStats } from "@/components/ui/user-stats";
import { Link } from "wouter";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    email: "",
    avatarUrl: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Update form data when user loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || currentUser.username || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        email: currentUser.email || "",
        avatarUrl: currentUser.avatarUrl || ""
      });
      setImagePreview(currentUser.avatarUrl || null);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Das Bild darf maximal 5MB groß sein.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Check if it's a HEIC file and convert it
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();
        
        let processedFile = file;
        
        // HEIC files often have no MIME type or unknown type
        if (fileType === 'image/heic' || 
            fileType === 'image/heif' || 
            fileName.endsWith('.heic') || 
            fileName.endsWith('.heif') ||
            (fileName.includes('.heic') || fileName.includes('.heif')) ||
            (fileType === '' && (fileName.endsWith('.heic') || fileName.endsWith('.heif')))) {
          
          toast({
            title: "HEIC-Datei wird konvertiert",
            description: "Ihre iPhone-Foto wird automatisch zu JPG konvertiert...",
          });

          try {
            console.log('Starting HEIC conversion...', {
              fileName,
              fileType,
              fileSize: file.size
            });
            
            // Convert HEIC to JPEG using backend API
            const convertedDataUrl = await convertHeicToJpeg(file);

            console.log('HEIC conversion successful, data URL length:', convertedDataUrl.length);

            // Use the converted data URL directly
            setImagePreview(convertedDataUrl);
            setFormData(prev => ({
              ...prev,
              avatarUrl: convertedDataUrl
            }));

            toast({
              title: "Konvertierung erfolgreich",
              description: "Ihre HEIC-Datei wurde erfolgreich zu JPG konvertiert!",
            });
          } catch (conversionError) {
            console.error("HEIC conversion failed:", conversionError);
            console.error("Error details:", {
              message: conversionError.message,
              stack: conversionError.stack,
              name: conversionError.name
            });
            toast({
              title: "HEIC-Konvertierung fehlgeschlagen",
              description: `Fehler: ${conversionError.message || 'Unbekannter Fehler'}. Bitte ändern Sie die iPhone-Kamera-Einstellungen zu 'Kompatibler' (Einstellungen > Kamera > Formate).`,
              variant: "destructive",
            });
            return;
          }
        }

        // Read the processed file (either original or converted)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          setFormData(prev => ({
            ...prev,
            avatarUrl: result
          }));
        };
        reader.onerror = () => {
          toast({
            title: "Datei-Lesefehler",
            description: "Die Datei konnte nicht gelesen werden. Bitte versuchen Sie es erneut.",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(processedFile);

      } catch (error) {
        console.error("Image upload error:", error);
        toast({
          title: "Upload-Fehler",
          description: "Beim Hochladen der Datei ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      avatarUrl: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                    <p className="text-lg text-muted-foreground">
                      @{currentUser.username}
                    </p>
                    {(currentUser.firstName || currentUser.lastName) && (
                      <p className="text-sm text-muted-foreground">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                    )}
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
                {/* Profile Image Upload */}
                <div>
                  <Label>Profilbild</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={imagePreview || currentUser.avatarUrl} alt="Profile" />
                        <AvatarFallback>
                          {(currentUser.displayName || currentUser.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Bild wählen
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Ihr Vorname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Ihr Nachname"
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
                <Link href="/premium">
                  <Button>
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Statistics - Corrected Version */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle>Deine Statistiken</CardTitle>
            </CardHeader>
            <CardContent>
              <UserStats userId={currentUser.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}