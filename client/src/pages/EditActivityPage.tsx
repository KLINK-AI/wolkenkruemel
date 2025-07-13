import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
import { useLanguage } from "@/components/LanguageProvider";
import { Link } from "wouter";
import { ArrowLeft, Upload, X, Trash2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Activity } from "@shared/schema";

const editActivitySchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(100, "Titel darf maximal 100 Zeichen lang sein"),
  description: z.string().min(1, "Beschreibung ist erforderlich").max(1000, "Beschreibung darf maximal 1000 Zeichen lang sein"),
  content: z.string().min(1, "Inhalt ist erforderlich"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(1, "Dauer muss mindestens 1 Minute betragen").max(1440, "Dauer darf maximal 1440 Minuten betragen"),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

type EditActivityFormData = z.infer<typeof editActivitySchema>;

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const activityId = parseInt(id || "0", 10);

  const { data: activity, isLoading: isLoadingActivity, error } = useQuery<Activity>({
    queryKey: ["/api/activities", activityId],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!activityId,
  });

  // Debug logging (removed for production)

  const form = useForm<EditActivityFormData>({
    resolver: zodResolver(editActivitySchema),
    values: activity ? {
      title: activity.title,
      description: activity.description,
      content: activity.content,
      difficulty: activity.difficulty as "beginner" | "intermediate" | "advanced",
      duration: activity.duration || 30,
      tags: activity.tags || [],
      images: activity.images || [],
    } : undefined,
  });

  // Load existing images and tags when activity is loaded
  useEffect(() => {
    if (activity) {
      if (activity.images) {
        setSelectedImages(activity.images);
      }
      if (activity.tags) {
        setCurrentTags(activity.tags);
      }
    }
  }, [activity]);

  const deleteActivityMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Aktivität gelöscht",
        description: "Die Aktivität wurde erfolgreich gelöscht.",
      });
      setLocation("/activities");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Aktivität konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (data: EditActivityFormData) => {
      const finalData = {
        ...data,
        images: selectedImages.length > 0 ? selectedImages : data.images,
        tags: currentTags,
      };
      
      await apiRequest("PATCH", `/api/activities/${activityId}`, finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${activityId}`] });
      toast({
        title: "Aktivität aktualisiert",
        description: "Ihre Aktivität wurde erfolgreich aktualisiert.",
      });
      setLocation(`/activities/${activityId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Aktivität konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Datei ist zu groß. Maximale Größe: 5MB",
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
          const newImages = [...selectedImages, convertedDataUrl];
          setSelectedImages(newImages);
          form.setValue("images", newImages);

          toast({
            title: "Konvertierung erfolgreich",
            description: "Ihre HEIC-Datei wurde erfolgreich zu JPG konvertiert!",
          });
          
          return; // Exit here after successful HEIC conversion
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
        if (result) {
          const newImages = [...selectedImages, result];
          setSelectedImages(newImages);
          form.setValue("images", newImages);
        }
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
    
    // Reset input to allow same file upload again
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    form.setValue("images", newImages);
  };

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: EditActivityFormData) => {
    updateActivityMutation.mutate(data);
  };

  if (isLoadingActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt Aktivität...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground dark:text-gray-400">Aktivität nicht gefunden</p>
          <Link href="/activities">
            <Button variant="outline" className="mt-4">
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is the author or admin (user ID 3 is admin)
  const isAuthor = currentUser && activity.author && activity.author.id === currentUser.id;
  const isAdmin = currentUser && currentUser.id === 3;

  if (!isAuthor && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground dark:text-gray-400">Sie können nur Ihre eigenen Aktivitäten bearbeiten</p>
          <Link href="/activities">
            <Button variant="outline" className="mt-4">
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href={`/activities/${activityId}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Aktivität
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Aktivität bearbeiten
            </h1>
            <p className="text-muted-foreground">
              Passen Sie Ihre Aktivität nach Ihren Wünschen an
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aktivität bearbeiten</CardTitle>
              <CardDescription>
                Ändern Sie die Details Ihrer Aktivität
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titel</FormLabel>
                        <FormControl>
                          <Input placeholder="Geben Sie einen Titel ein..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kurze Beschreibung</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschreiben Sie Ihre Aktivität kurz..." 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ausführlicher Inhalt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Beschreiben Sie detailliert, wie die Aktivität durchgeführt wird..." 
                            rows={8}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schwierigkeit</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie die Schwierigkeit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Anfänger</SelectItem>
                              <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                              <SelectItem value="advanced">Experte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dauer (Minuten)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="1440"
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags verwalten
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newTag || ""}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Neuen Tag hinzufügen..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          variant="outline"
                          disabled={!newTag.trim() || currentTags.includes(newTag.trim())}
                        >
                          Tag hinzufügen
                        </Button>
                      </div>
                      
                      {/* Current Tags */}
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-600 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {currentTags.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          Keine Tags vorhanden. Fügen Sie Tags hinzu, um Ihre Aktivität besser auffindbar zu machen.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormLabel>Fotos</FormLabel>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Foto hinzufügen
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative inline-block">
                            <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-center p-2">
                              <img
                                src={image}
                                alt={`Aktivität Foto ${index + 1}`}
                                className="max-w-full max-h-full object-contain rounded-lg"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={updateActivityMutation.isPending}
                      className="flex-1"
                    >
                      {updateActivityMutation.isPending ? "Wird aktualisiert..." : "Aktivität aktualisieren"}
                    </Button>
                    <Link href={`/activities/${activityId}`}>
                      <Button variant="outline" type="button">
                        Abbrechen
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aktivität löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie "{activity?.title}" löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteActivityMutation.mutate()}>
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}