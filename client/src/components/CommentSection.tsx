import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Comment } from '@shared/schema';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api';

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { currentUser: user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['/api/posts', postId, 'comments'],
    queryFn: () => fetchApi(`/api/posts/${postId}/comments`),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await postApi(`/api/posts/${postId}/comments`, {
        content: newComment,
        authorId: user.id,
      });

      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    } catch (error) {
      console.error('Comment submission failed:', error);
    }
  };

  const canComment = user && user.subscriptionTier !== 'free';

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          Kommentare ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form */}
        {user ? (
          canComment ? (
            <form onSubmit={handleSubmit} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Schreibe einen Kommentar..."
                className="min-h-[100px] mb-3"
              />
              <Button type="submit" disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Kommentar posten
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-6">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Premium-Mitgliedschaft erforderlich, um Kommentare zu schreiben.
              </p>
              <Button size="sm" className="mt-2" asChild>
                <a href="/premium">Premium werden</a>
              </Button>
            </div>
          )
        ) : (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Bitte logge dich ein, um Kommentare zu schreiben.
            </p>
            <Button size="sm" className="mt-2" asChild>
              <a href="/login">Anmelden</a>
            </Button>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment: Comment & { 
              author: any; 
              replies?: (Comment & { author: any })[];
            }) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={postId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Kommentare vorhanden.</p>
            <p className="text-sm">Sei der Erste, der einen Kommentar schreibt!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}