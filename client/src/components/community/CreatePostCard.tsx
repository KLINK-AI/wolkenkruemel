import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { Camera, Link, Activity, Crown, AlertTriangle } from "lucide-react";

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(1000, "Content must be under 1000 characters"),
  type: z.enum(["post", "question", "success_story"]),
  authorId: z.number(),
  linkedActivityId: z.number().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CreatePostCard() {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const permissions = usePermissions(currentUser);

  if (!currentUser) {
    return null;
  }

  // If user can't create posts, show permission message
  if (!permissions.canCreatePosts) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName || currentUser.username} />
              <AvatarFallback>
                {(currentUser.displayName || currentUser.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm p-3 bg-muted rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>Du musst deine E-Mail bestätigen, um Posts zu erstellen.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      type: "post",
      authorId: currentUser.id,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('posts.shared'),
        description: t('posts.sharedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      setShowTypeSelector(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  const handleContentFocus = () => {
    setShowTypeSelector(true);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName || currentUser.username} />
                <AvatarFallback>
                  {(currentUser.displayName || currentUser.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t('posts.placeholder')}
                          rows={3}
                          className="resize-none"
                          onFocus={handleContentFocus}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {showTypeSelector && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="What type of post is this?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="post">{t('post.types.general')}</SelectItem>
                          <SelectItem value="question">{t('post.types.question')}</SelectItem>
                          <SelectItem value="success_story">{t('post.types.success')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                      <Camera className="w-5 h-5 mr-2" />
                      Photo/Video
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                      <Link className="w-5 h-5 mr-2" />
                      Link Activity
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        form.reset();
                        setShowTypeSelector(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? "Sharing..." : "Share"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
