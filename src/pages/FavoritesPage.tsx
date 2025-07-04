import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites, getActivitiesByIds } from '../services/firebaseService';
import ActivityList from '../components/activities/ActivityList';
import { Activity } from '../types';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteActivities, setFavoriteActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const userFavorites = await getUserFavorites(user.uid);
          console.log("User Favorites IDs:", userFavorites);
          setFavorites(userFavorites);
          
          // Fetch favorite activities based on IDs
          console.log("Fetching activities for IDs:", userFavorites);
          const activities = await getActivitiesByIds(userFavorites);
          console.log("Activities from DB:", activities);

          
          setFavoriteActivities(activities);
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadFavorites();
  }, [user]); // Added dependency array

  useEffect(() => {
    console.log("Favorite Activities State Updated:", favoriteActivities);
  }, [user]);
  
  const handleFavoriteToggle = (activityId: string, isFavorite: boolean) => {
    // Remove the activity from the list if it's being un-favorited
    if (!isFavorite) {
      setFavoriteActivities(prev => prev.filter(activity => activity.id !== activityId));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-primary-500 text-2xl">Favoriten werden geladen...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meine Favoriten</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Hier finden Sie Ihre gespeicherten Aktivitäten
        </p>
      </div>
      
      {favoriteActivities.length > 0 ? (
        <ActivityList 
          activities={favoriteActivities} 
        />
      ) : (
        <div className="text-center py-12">
          <div className="bg-neutral-100 dark:bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-neutral-400" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-3">Keine Favoriten gefunden</h2>
          
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
            Sie haben noch keine Aktivitäten zu Ihren Favoriten hinzugefügt. Speichern Sie Aktivitäten, um sie hier anzuzeigen.
          </p>
          
          <Link to="/activities" className="btn-primary">
            Aktivitäten entdecken
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;