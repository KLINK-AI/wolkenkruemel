import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { useLocation } from "wouter";
import { z } from "zod";
import type { Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

const createActivitySchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(100, "Titel muss unter 100 Zeichen sein"),
  description: z.string().min(1, "Beschreibung ist erforderlich").max(500, "Beschreibung muss unter 500 Zeichen sein"),
  content: z.string().min(1, "Inhalt ist erforderlich").min(100, "Inhalt muss mindestens 100 Zeichen lang sein"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(1, "Dauer muss mindestens 1 Minute betragen").max(300, "Dauer muss unter 5 Stunden liegen"),
  authorId: z.number(),
  images: z.array(z.string()).optional(),
  isOfficial: z.boolean().default(false),
  isApproved: z.boolean().default(false),
});

type CreateActivityForm = z.infer<typeof createActivitySchema>;

export default function CreateActivityPage() {
  const [, setLocation] = useLocation();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const permissions = usePermissions(currentUser);

  // Redirect if not authenticated
  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  // Fetch user's activities to check count
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const userActivityCount = activities.filter(a => a.authorId === currentUser.id).length;

  // Check if free user has reached limit
  if (currentUser.subscriptionTier === 'free' && userActivityCount >= 5) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Aktivitätslimit erreicht</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Du hast bereits 5 Aktivitäten erstellt. Upgrade auf Premium für unbegrenzte Aktivitäten!
            </p>
            <div className="flex gap-2">
              <Link href="/premium">
                <Button className="flex-1">
                  Premium freischalten
                </Button>
              </Link>
              <Link href="/activities">
                <Button variant="outline" className="flex-1">Zurück</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = useForm<CreateActivityForm>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      difficulty: "beginner",
      duration: 15,
      authorId: currentUser?.id || 1,
      images: [],
      isOfficial: false,
      isApproved: false,
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: CreateActivityForm & { tags: string[] }) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('createActivity.successTitle'),
        description: t('createActivity.successMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setLocation("/activities");
    },
    onError: (error) => {
      toast({
        title: t('createActivity.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateActivityForm) => {
    createActivityMutation.mutate({ ...data, tags });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('createActivity.errorTitle'),
        description: t('createActivity.imageError'),
        variant: "destructive",
      });
      return;
    }

    setIsImageUploading(true);

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
          const newImages = [...images, convertedDataUrl];
          setImages(newImages);
          form.setValue("images", newImages);

          toast({
            title: "Konvertierung erfolgreich",
            description: "Ihre HEIC-Datei wurde erfolgreich zu JPG konvertiert!",
          });
          
          setIsImageUploading(false);
          return; // Exit here after successful HEIC conversion
          
          setIsImageUploading(false);
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
          setIsImageUploading(false);
          return;
        }
      }

      // Read the processed file (either original or converted)
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newImages = [...images, result];
          setImages(newImages);
          form.setValue("images", newImages);
        }
        setIsImageUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Datei-Lesefehler",
          description: "Die Datei konnte nicht gelesen werden. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
        setIsImageUploading(false);
      };
      
      reader.readAsDataURL(processedFile);

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload-Fehler",
        description: "Beim Hochladen der Datei ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
      setIsImageUploading(false);
    }
    
    // Reset input to allow same file upload again
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => setLocation("/community")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('createActivity.backToCommunity')}
            </Button>
            <div className="flex items-center">
              <img 
                src="/Wolkenkruemel.png" 
                alt="Wolkenkrümel Logo" 
                className="h-8 w-auto mr-2"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('createActivity.title')}</CardTitle>
            <CardDescription>
              {t('createActivity.subtitle')}
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
                      <FormLabel>{t('createActivity.titleLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('createActivity.titlePlaceholder')} {...field} />
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
                      <FormLabel>{t('createActivity.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('createActivity.descriptionPlaceholder')}
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {t('createActivity.descriptionHelper')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload Section */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('createActivity.imageLabel')}</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Display existing images */}
                          {images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {images.map((image, index) => (
                                <div key={index} className="relative bg-gray-50 dark:bg-gray-800 rounded-lg border border-border p-4 flex items-center justify-center" style={{minHeight: "12rem"}}>
                                  <img
                                    src={image}
                                    alt={`Activity preview ${index + 1}`}
                                    className="max-w-full max-h-44 object-contain rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add new image */}
                          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                {images.length === 0 ? t('createActivity.imageUpload') : 'Weitere Bilder hinzufügen'}
                              </p>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {images.length === 0 ? t('createActivity.chooseImage') : 'Bild hinzufügen'}
                                  </span>
                                </Button>
                              </label>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t('createActivity.imageFormats')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('createActivity.difficultyLevel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('createActivity.selectDifficulty')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">{t('createActivity.beginner')}</SelectItem>
                            <SelectItem value="intermediate">{t('createActivity.intermediate')}</SelectItem>
                            <SelectItem value="advanced">{t('createActivity.advanced')}</SelectItem>
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
                        <FormLabel>{t('createActivity.duration')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="300" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>{t('createActivity.tags')}</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('createActivity.tagsPlaceholder')}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('createActivity.tagsHelp')}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('createActivity.content')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('createActivity.contentPlaceholder')}
                          rows={10}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {t('createActivity.contentHelp')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/community")}
                  >
                    {t('createActivity.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? t('createActivity.creating') : t('createActivity.createButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
