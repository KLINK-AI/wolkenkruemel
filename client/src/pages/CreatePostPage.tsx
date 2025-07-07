import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Image, FileText, HelpCircle, Trophy } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { postApi } from "@/lib/api";

const createPostSchema = z.object({
  content: z.string().min(10, "Beitrag muss mindestens 10 Zeichen haben"),
  type: z.enum(["post", "question", "success_story"], {
    required_error: "Bitte wähle einen Beitragstyp"
  }),
  imageUrl: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export default function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      type: "post",
      imageUrl: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      if (!currentUser) throw new Error("Nicht angemeldet");
      
      const postData = {
        ...data,
        authorId: currentUser.id,
        imageUrl: data.imageUrl || undefined,
      };
      
      return postApi("/api/posts", postData);
    },
    onSuccess: () => {
      toast({
        title: "Beitrag erstellt!",
        description: "Dein Beitrag wurde erfolgreich veröffentlicht.",
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setLocation("/community");
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Beitrag konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreatePostFormData) => {
    createPostMutation.mutate(data);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Anmeldung erforderlich</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Du musst angemeldet sein, um Beiträge zu erstellen.
              </p>
              <div className="flex gap-2">
                <Link href="/login">
                  <Button>Anmelden</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Registrieren</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const postTypes = [
    {
      value: "post",
      label: "Allgemeiner Beitrag",
      description: "Teile deine Gedanken und Erfahrungen",
      icon: FileText,
    },
    {
      value: "question",
      label: "Frage",
      description: "Stelle eine Frage an die Community",
      icon: HelpCircle,
    },
    {
      value: "success_story",
      label: "Erfolgsgeschichte",
      description: "Teile einen Trainingserfolg",
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/community">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Community
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Neuen Beitrag erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Post Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Art des Beitrags</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {postTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => field.onChange(type.value)}
                                  className={`p-4 border rounded-lg text-left transition-colors ${
                                    field.value === type.value
                                      ? "border-primary bg-primary/5"
                                      : "border-muted hover:border-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5" />
                                    <div>
                                      <p className="font-medium text-sm">{type.label}</p>
                                      <p className="text-xs text-muted-foreground">{type.description}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inhalt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              form.watch("type") === "question"
                                ? "Beschreibe deine Frage ausführlich..."
                                : form.watch("type") === "success_story"
                                ? "Erzähle von deinem Trainingserfolg..."
                                : "Teile deine Gedanken mit der Community..."
                            }
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Optional Image */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bild (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <Link href="/community">
                      <Button variant="outline" type="button">
                        Abbrechen
                      </Button>
                    </Link>
                    <Button type="submit" disabled={createPostMutation.isPending}>
                      {createPostMutation.isPending ? "Wird veröffentlicht..." : "Beitrag veröffentlichen"}
                    </Button>
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