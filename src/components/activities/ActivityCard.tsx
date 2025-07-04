import { Heart } from 'lucide-react';
import { Activity } from '../../types';
import { Link } from 'react-router-dom';
import { addToFavorites, removeFromFavorites } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface ActivityCardProps {
  activity: Activity;
  isFavorite: boolean;
  onFavoriteToggle: (activityId: string, isFavorite: boolean) => void;
}

const ActivityCard = ({ activity, isFavorite, onFavoriteToggle }: ActivityCardProps) => {
  const { user } = useAuth();
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || isToggling) return;
    
    setIsToggling(true);
    setError(null);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, activity.id);
      } else {
        await addToFavorites(user.uid, activity.id);
      }
      onFavoriteToggle(activity.id, !isFavorite);
    } catch (error: any) {
      setError(error.message);
      console.error('Error toggling favorite:', error);
      // Don't update the UI state if there's an error
      return;
    } finally {
      setIsToggling(false);
    }
  };
  
  // Placeholder image if none provided
  const imageUrl = activity.imageUrl || 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  return (
    <Link to={`/activities/${activity.id}`} className="block h-full transition-transform hover:scale-[1.02]">
      <article className="card h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={imageUrl} 
            alt={activity.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          
          {/* Premium Badge */}
          {activity.premiumOnly && (
            <div className="absolute top-2 left-2 bg-accent-400 text-white text-xs px-2 py-1 rounded font-medium">
              Premium
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={isToggling}
            className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors ${
              isToggling ? 'opacity-50' : ''
            }`}
            aria-label={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart 
              size={20} 
              className={isFavorite ? 'fill-error-500 text-error-500' : 'text-neutral-700'} 
            />
          </button>
          
          {/* Error message */}
          {error && (
            <div className="absolute bottom-2 right-2 left-2 bg-error-100 text-error-700 text-sm px-3 py-1 rounded">
              {error}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-3">
              {activity.description}
            </p>
          </div>
          
          {/* Meta information */}
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded dark:bg-primary-900/30 dark:text-primary-300">
              {activity.type === 'training' ? 'Training' : activity.type === 'exercise' ? 'Übung' : 'Spiel'}
            </span>
            
            <span className="inline-block bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded dark:bg-secondary-900/30 dark:text-secondary-300">
              {activity.duration} Min
            </span>
            
            {activity.location.includes('indoor') && (
              <span className="inline-block bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded dark:bg-neutral-700 dark:text-neutral-300">
                Drinnen
              </span>
            )}
            
            {activity.location.includes('outdoor') && (
              <span className="inline-block bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded dark:bg-neutral-700 dark:text-neutral-300">
                Draußen
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ActivityCard;