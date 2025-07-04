import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Award, MapPin, Star, Activity, CheckCircle, Package, Share2 } from 'lucide-react';
import { Activity as ActivityType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addToFavorites, removeFromFavorites, getUserFavorites } from '../services/firebaseService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const ActivityDetailPage = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'tips' | 'variations'>('description');
  
  const [progress, setProgress] = useState({
    tried: false,
    mastered: false,
    favorite: false, // This refers to the progress 'favorite', not the overall favorite button
  });
  useEffect(() => {
    const loadActivity = async () => {
      try {
        if (!activityId) return;
        
        const activityDoc = await getDoc(doc(db, 'activities', activityId));
        if (activityDoc.exists()) {
          setActivity({ id: activityDoc.id, ...activityDoc.data() } as ActivityType);
        } else {
          setActivity(null);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        setActivity(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    const checkFavorite = async () => {
      if (user && activityId) {
        try {
          const favorites = await getUserFavorites(user.uid);
          setIsFavorite(favorites.includes(activityId));
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    const loadUserProgress = async () => {
      if (user && activityId) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Access the progress map and then the specific activity's progress
            const activityProgress = userData.progress?.[activityId] || {
              tried: false,
              mastered: false,
              favorite: false,
            };
            setProgress(activityProgress);
          } else {
            // User document doesn't exist, reset progress state
             setProgress({
              tried: false,
              mastered: false,
              favorite: false,
            });
          }
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    };

    loadActivity();
    checkFavorite();
    loadUserProgress();
  }, [activityId, user]);
  
  const handleFavoriteToggle = async () => {
    if (!user || isToggling || !activity) return;
    
    setIsToggling(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, activity.id);
      } else {
        await addToFavorites(user.uid, activity.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleProgressChange = async (type: 'tried' | 'mastered' | 'favorite', checked: boolean) => {
    if (!user || !activityId) return;

    const newProgress = {
      ...progress,
      [type]: checked,
    };
    setProgress(newProgress);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      // Use setDoc with merge: true to update only the progress field
      await setDoc(userDocRef, {
        progress: {
          [activityId]: newProgress,
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  };
  const handleShare = async () => {
    console.log("Share button clicked!");
    console.log("navigator.share is:", navigator.share);

    if (!activity) return;

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.title,
          text: activity.description.substring(0, 150) + '...', // Share first 150 chars of description
          url: window.location.href,
        });
        console.log('Activity shared successfully!');
        // You could add a more visible notification here if desired
      } catch (error) {
        console.error('Error sharing activity:', error);
        // Fallback: Copy URL to clipboard if sharing fails
        try {
          await navigator.clipboard.writeText(window.location.href);
          console.log('Link copied to clipboard!');
          alert('Link zur Aktivität wurde in die Zwischenablage kopiert!'); // Simple alert for feedback
        } catch (clipboardError) {
        // Handle share error or user cancelling share
        }
      }
    } // This closes the if (navigator.share) block
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-primary-500 text-2xl">Aktivität wird geladen...</div>
      </div>
    );
  }
  
  if (!activity) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Aktivität nicht gefunden</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Die gesuchte Aktivität konnte nicht gefunden werden.
        </p>
        <Link to="/activities" className="btn-primary">
          Zurück zu allen Aktivitäten
        </Link>
      </div>
    );
  }
  
  // Placeholder image if none provided
  const imageUrl = activity.imageUrl || 'https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  return (
    <div>
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/activities" className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          <ArrowLeft size={18} className="mr-1" />
          <span>Alle Aktivitäten</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img 
              src={imageUrl}
              alt={activity.title}
              className="w-full object-cover h-[300px] md:h-[400px]"
            />
            
            {/* Premium Badge */}
            {activity.premiumOnly && (
              <div className="absolute top-4 left-4 bg-accent-400 text-white px-3 py-1 rounded-lg font-medium">
                Premium
              </div>
            )}
          </div>
          
          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-3">{activity.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-lg dark:bg-primary-900/30 dark:text-primary-300">
                <Activity size={16} />
                {activity.type === 'training' ? 'Training' : activity.type === 'exercise' ? 'Übung' : 'Spiel'}
              </span>
              
              <span className="inline-flex items-center gap-1 bg-secondary-100 text-secondary-800 px-3 py-1 rounded-lg dark:bg-secondary-900/30 dark:text-secondary-300">
                <Clock size={16} />
                {activity.duration} Minuten
              </span>
              
              <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-lg dark:bg-neutral-700 dark:text-neutral-300">
                <Award size={16} />
                {activity.experienceLevel.includes('puppy') && 'Welpe'}
                {activity.experienceLevel.includes('beginner') && 'Anfänger'}
                {activity.experienceLevel.includes('advanced') && 'Fortgeschritten'}
                {activity.experienceLevel.includes('professional') && 'Profi'}
              </span>
              
              {activity.location.map(loc => (
                <span 
                  key={loc}
                  className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-lg dark:bg-neutral-700 dark:text-neutral-300"
                >
                  <MapPin size={16} />
                  {loc === 'indoor' ? 'Drinnen' : 'Draußen'}
                </span>
              ))}
              
              {activity.engagementType.map(type => (
                <span 
                  key={type}
                  className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-lg dark:bg-neutral-700 dark:text-neutral-300"
                >
                  <Star size={16} />
                  {type === 'physical' ? 'Körperlich' : 'Kognitiv'}
                </span>
              ))}
              
              {activity.requiresMaterials && (
                <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-lg dark:bg-neutral-700 dark:text-neutral-300">
                  <Package size={16} />
                  Materialien benötigt
                </span>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b dark:border-neutral-700">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'description'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400'
                }`}
              >
                Beschreibung
                {activeTab === 'description' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('tips')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'tips'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400'
                }`}
              >
                Tipps & Fehlerbehebung
                {activeTab === 'tips' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('variations')}
                className={`pb-3 font-medium transition-colors relative ${
                  activeTab === 'variations'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400'
                }`}
              >
                Variationen
                {activeTab === 'variations' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></span>
                )}
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="prose prose-primary max-w-none dark:prose-invert mb-8">
            {activeTab === 'description' && (
              <div>
                <p>{activity.description}</p>
                
                {activity.materials && activity.materials.length > 0 && (
                  <>
                    <h3>Benötigte Materialien</h3>
                    <ul>
                      {activity.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'tips' && (
              <div>
                <h3>Tipps für erfolgreiche Übungen</h3>
                <ul>
                  {activity.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                
                <h3>Häufige Probleme und Lösungen</h3>
                <ul>
                  {activity.troubleshooting.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'variations' && (
              <div>
                <h3>Variationen</h3>
                <p>Hier sind einige Möglichkeiten, die Übung zu variieren:</p>
                <ul>
                  {activity.variations.map((variation, index) => (
                    <li key={index}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          <div className="card border dark:border-neutral-700 sticky top-24">
            <div className="p-6">
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-0 sm:gap-3 mb-6">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isToggling}
                  className={`btn flex-1 flex items-center justify-center gap-2 w-full sm:w-auto ${
                    isFavorite
                      ? 'bg-error-50 text-error-700 border border-error-300 hover:bg-error-100'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200'
                  } dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200`}
                >
                  <Heart className={isFavorite ? 'fill-error-500 text-error-500' : ''} size={18} />
                  <span>{isFavorite ? 'Gespeichert' : 'Speichern'}</span>
                </button>

                <button 
                  onClick={handleShare}
                  className="btn bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200 flex items-center justify-center gap-2 w-full sm:w-auto dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                >
                  <Share2 size={18} />
                  <span>Teilen</span>
                </button>
              </div>
              
              {/* Achievement checklist */}
              <div className="border-t dark:border-neutral-700 pt-6 mb-6">
                <h3 className="font-semibold mb-3">Fortschritt verfolgen</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="tried"
                      checked={progress.tried}
                      onChange={(e) => handleProgressChange('tried', e.target.checked)}
                      disabled={!user} // Disable if not logged in
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <label htmlFor="tried" className="ml-2">Ich habe diese Aktivität ausprobiert</label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="mastered"
                      checked={progress.mastered}
                      onChange={(e) => handleProgressChange('mastered', e.target.checked)}
                      disabled={!user} // Disable if not logged in
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <label htmlFor="mastered" className="ml-2">Mein Hund beherrscht diese Übung</label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="favorite"
                      checked={progress.favorite}
                      onChange={(e) => handleProgressChange('favorite', e.target.checked)}
                      disabled={!user} // Disable if not logged in
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <label htmlFor="favorite" className="ml-2">Diese Aktivität ist ein Favorit unserer Routine</label>
                  </div>
                </div>
              </div>
              
              {/* Similar activities */}
              <div className="border-t dark:border-neutral-700 pt-6">
                <h3 className="font-semibold mb-3">Ähnliche Aktivitäten</h3>
                <div className="space-y-3">
                  {activity.similarActivities?.map(similarActivity => (
                    <Link 
                      key={similarActivity.id}
                      to={`/activities/${similarActivity.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
                        <img
                          src={similarActivity.imageUrl || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                          alt={similarActivity.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium line-clamp-1">{similarActivity.title}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {similarActivity.duration} Minuten
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityDetailPage;