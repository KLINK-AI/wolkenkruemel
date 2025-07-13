import React, { useState } from 'react';
import { Comment } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit2, Reply, MoreHorizontal, Trash2, Check, X, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { fetchApi, postApi } from '@/lib/api';

interface CommentItemProps {
  comment: Comment & { 
    author: any; 
    replies?: (Comment & { author: any })[];
  };
  postId: number;
  onReply?: (parentId: number) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, onReply, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);

  const isOwner = user?.id === comment.authorId;
  const canEdit = isOwner;

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      
      if (!response.ok) throw new Error('Edit failed');
      
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Kommentar wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await postApi(`/api/posts/${postId}/comments`, {
        content: replyContent,
        authorId: user?.id,
        parentId: comment.id,
      });
      
      setIsReplying(false);
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
    } catch (error) {
      console.error('Reply failed:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await postApi(`/api/comments/${comment.id}/like`, {
        userId: user.id,
      });
      
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else if (diffHours > 0) {
      return `vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    } else {
      return 'vor wenigen Minuten';
    }
  };

  return (
    <div className={`${isReply ? 'ml-8 mt-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatarUrl || ''} />
              <AvatarFallback>
                {comment.author.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {comment.author.displayName || 'Unbekannter Benutzer'}
                  </span>
                  {comment.author.subscriptionTier === 'premium' && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </span>
                  {comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() && (
                    <span className="text-xs text-muted-foreground">(bearbeitet)</span>
                  )}
                </div>
                
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {isEditing ? (
                <div className="mt-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Kommentar bearbeiten..."
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" onClick={handleEdit}>
                      <Check className="h-4 w-4 mr-1" />
                      Speichern
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}>
                      <X className="h-4 w-4 mr-1" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    {user && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={`h-8 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                        onClick={handleLike}
                      >
                        <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                        {likeCount}
                      </Button>
                    )}
                    
                    {user && !isReply && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-2 text-xs"
                        onClick={() => setIsReplying(true)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Antworten
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {isReplying && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Antwort schreiben..."
                    className="min-h-[60px] mb-2"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleReply}>
                      Antworten
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}