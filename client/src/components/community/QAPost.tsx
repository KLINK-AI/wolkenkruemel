import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { HelpCircle, ChevronUp, MessageSquare, Tag, AlertTriangle } from "lucide-react";

interface QAPostProps {
  post: {
    id: number;
    content: string;
    author: {
      id: number;
      displayName: string;
      avatarUrl: string;
    };
    likes: number;
    comments: number;
    tags?: string[];
    createdAt: string;
  };
}

export default function QAPost({ post }: QAPostProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [upvoted, setUpvoted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const permissions = usePermissions(currentUser);

  // Check if user has upvoted this post
  const { data: likeStatus } = useQuery({
    queryKey: ["/api/posts", post.id, "like", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return { isLiked: false };
      const response = await fetch(`/api/posts/${post.id}/like/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch like status");
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Update local state when like status is fetched
  useEffect(() => {
    if (likeStatus) {
      setUpvoted(likeStatus.isLiked);
    }
  }, [likeStatus]);

  const { data: comments } = useQuery({
    queryKey: ["/api/posts", post.id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (upvoted) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`, { userId: currentUser?.id });
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: currentUser?.id });
      }
    },
    onSuccess: () => {
      setUpvoted(!upvoted);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const answerMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", {
        content,
        postId: post.id,
        authorId: currentUser?.id,
      });
    },
    onSuccess: () => {
      setAnswerContent("");
      setShowAnswerForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Answer Posted",
        description: "Your answer has been shared with the community.",
      });
    },
  });

  const handleUpvote = () => {
    upvoteMutation.mutate();
  };

  const handleAnswer = () => {
    if (answerContent.trim()) {
      answerMutation.mutate(answerContent);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) {
      return t('time.now');
    } else if (hours < 24) {
      const hourText = hours === 1 
        ? t('time.hour') 
        : t('time.hours');
      
      // German: "vor X Stunden", English: "X hours ago"
      if (language === 'de') {
        return `vor ${hours} ${hourText}`;
      } else {
        return `${hours} ${hourText} ago`;
      }
    } else {
      const dayText = days === 1 
        ? t('time.day') 
        : t('time.days');
      
      // German: "vor X Tagen", English: "X days ago" 
      if (language === 'de') {
        return `vor ${days} ${dayText}`;
      } else {
        return `${days} ${dayText} ago`;
      }
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-blue-600">Q&A</span>
            <p className="text-xs text-muted-foreground">Community Question</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author?.avatarUrl} alt={post.author?.displayName || "User"} />
            <AvatarFallback>
              {(post.author?.displayName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{post.author?.displayName || t('common.unknownUser')}</h3>
            <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-foreground mb-4">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUpvote}
              className={`flex items-center space-x-2 ${
                upvoted ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500'
              }`}
            >
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm font-medium">{post.likes + (upvoted ? 1 : 0)}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">{comments?.length || 0} answers</span>
            </Button>
          </div>
          {permissions.canComment ? (
            <Button 
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="border border-primary text-primary hover:bg-primary hover:text-white"
              variant="outline"
            >
              Answer
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>E-Mail bestätigen für Antworten</span>
            </div>
          )}
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName || "User"} />
                <AvatarFallback>
                  {(currentUser?.displayName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Share your knowledge and help this person..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={4}
                className="flex-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAnswerForm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleAnswer}
                disabled={!answerContent.trim() || answerMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {answerMutation.isPending ? "Posting..." : "Post Answer"}
              </Button>
            </div>
          </div>
        )}

        {/* Answers */}
        {comments && comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-4">Answers</h4>
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img 
                    className="w-8 h-8 rounded-full" 
                    src={comment.author.avatarUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
                    alt="Commenter Avatar" 
                  />
                  <div className="flex-1">
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <p className="text-sm font-medium text-foreground">{comment.author.displayName || "Anonymous User"}</p>
                      <p className="text-sm text-foreground mt-1">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="text-xs text-muted-foreground hover:text-primary">Helpful</button>
                      <span className="text-xs text-muted-foreground/70">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
