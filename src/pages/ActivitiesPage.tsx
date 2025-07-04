import { useState, useEffect } from 'react';
import ActivityFilter from '../components/activities/ActivityFilter';
import ActivityList from '../components/activities/ActivityList';
import { Activity, ActivityFilter as FilterType } from '../types';
import { Search } from 'lucide-react';
import { getDocs, query, orderBy, collection } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const ActivitiesPage = () => {
  const [filter, setFilter] = useState<FilterType>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities from Firestore
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(activitiesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedActivities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];
        
        setActivities(loadedActivities);
        setFilteredActivities(loadedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (activities.length === 0) return;

    let result = [...activities];

    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(activity => 
        activity.title.toLowerCase().includes(term) || 
        activity.description.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (filter.type) {
      result = result.filter(activity => activity.type === filter.type);
    }

    // Apply experience level filter
    if (filter.experienceLevel) {
      result = result.filter(activity => 
        activity.experienceLevel.includes(filter.experienceLevel)
      );
    }

    // Apply duration filter
    if (filter.duration) {
      result = result.filter(activity => activity.duration === filter.duration);
    }

    // Apply location filter
    if (filter.location) {
      result = result.filter(activity => 
        activity.location.includes(filter.location)
      );
    }

    // Apply engagement type filter
    if (filter.engagementType && filter.engagementType.length > 0) {
      result = result.filter(activity => 
        filter.engagementType.some(type => activity.engagementType.includes(type))
      );
    }

    // Apply materials filter
    if (filter.requiresMaterials !== undefined) {
      result = result.filter(activity => 
        activity.requiresMaterials === filter.requiresMaterials
      );
    }

    setFilteredActivities(result);
  }, [activities, filter, searchTerm]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-primary-500 text-2xl">Aktivitäten werden geladen...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hundeaktivitäten</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Entdecken Sie passende Trainings- und Beschäftigungseinheiten für Ihren Hund
        </p>
      </div>

      {/* Search and filter section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Aktivitäten suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter sidebar */}
        <div className="lg:col-span-1">
          <ActivityFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Activity content */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'Aktivität' : 'Aktivitäten'} gefunden
            </p>
          </div>

          <ActivityList activities={filteredActivities} />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;