import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { LazyImage } from './lazy-image';
import { Clock, Users, Star } from 'lucide-react';
import { Link } from 'wouter';
import type { Activity } from '@shared/schema';

interface OptimizedActivityCardProps {
  activity: Activity;
  showFavoriteButton?: boolean;
  onFavoriteClick?: (activityId: number) => void;
  isFavorited?: boolean;
}

export const OptimizedActivityCard = memo(function OptimizedActivityCard({
  activity,
  showFavoriteButton = false,
  onFavoriteClick,
  isFavorited = false
}: OptimizedActivityCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <Link href={`/activities/${activity.id}`}>
        <div className="aspect-video overflow-hidden">
          {activity.images && activity.images.length > 0 ? (
            <LazyImage
              src={activity.images[0]}
              alt={activity.title}
              className="w-full h-full group-hover:scale-105 transition-transform duration-200"
              aspectRatio="video"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Kein Bild</span>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <Link href={`/activities/${activity.id}`}>
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {activity.title}
            </CardTitle>
          </Link>
          {showFavoriteButton && onFavoriteClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteClick(activity.id);
              }}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label={isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
            >
              <Star 
                className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
              />
            </button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {activity.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          <Badge className={getDifficultyColor(activity.difficulty)}>
            {getDifficultyText(activity.difficulty)}
          </Badge>
          {activity.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {activity.tags && activity.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{activity.tags.length - 2}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{activity.duration || 30} Min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{activity.authorId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedActivityCard.displayName = 'OptimizedActivityCard';