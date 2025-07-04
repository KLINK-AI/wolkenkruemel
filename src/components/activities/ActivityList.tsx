import { useState, useEffect } from 'react';
import ActivityCard from './ActivityCard';
import { Activity } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFavorites } from '../../services/firebaseService';

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList = ({ activities }: ActivityListProps) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const userFavorites = await getUserFavorites(user.uid);
          setFavorites(userFavorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavorites([]);
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  const handleFavoriteToggle = (activityId: string, isFavorite: boolean) => {
    if (isFavorite) {
      setFavorites(prev => [...prev, activityId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== activityId));
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse h-80">
            <div className="bg-neutral-200 dark:bg-neutral-700 h-48 rounded-t-xl"></div>
            <div className="p-4">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl mb-2">Keine Aktivitäten gefunden</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bitte versuchen Sie es mit anderen Filtereinstellungen.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isFavorite={favorites.includes(activity.id)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default ActivityList;