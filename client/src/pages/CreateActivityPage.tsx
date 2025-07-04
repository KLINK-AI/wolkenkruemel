import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, X } from "lucide-react";

const createActivitySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be under 500 characters"),
  content: z.string().min(1, "Content is required").min(100, "Content must be at least 100 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(300, "Duration must be under 5 hours"),
  authorId: z.number(),
  isOfficial: z.boolean().default(false),
  isApproved: z.boolean().default(false),
});

type CreateActivityForm = z.infer<typeof createActivitySchema>;

export default function CreateActivityPage() {
  const [, setLocation] = useLocation();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateActivityForm>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      difficulty: "beginner",
      duration: 15,
      authorId: 1, // Mock user ID
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
        title: "Activity Created",
        description: "Your training activity has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setLocation("/community");
    },
    onError: (error) => {
      toast({
        title: "Error",
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

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => setLocation("/community")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
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
            <CardTitle className="text-2xl">Create New Training Activity</CardTitle>
            <CardDescription>
              Share your dog training knowledge with the community. Your activity will be reviewed before being published.
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
                      <FormLabel>Activity Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Basic Sit Command Training" {...field} />
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
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief overview of what this activity teaches..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This will be shown in activity previews and search results.
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
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
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
                        <FormLabel>Duration (minutes)</FormLabel>
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
                  <FormLabel>Tags</FormLabel>
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
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tags help users find your activity. Press Enter or click + to add.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed instructions for your training activity..."
                          rows={10}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include step-by-step instructions, tips, and any important notes.
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
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
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
