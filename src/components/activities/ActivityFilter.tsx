import { useState } from 'react';
import { ActivityFilter as FilterType, ActivityType, ExperienceLevel, Duration, Location, EngagementType } from '../../types';
import { Filter, ChevronDown, X } from 'lucide-react';

interface ActivityFilterProps {
  onFilterChange: (filter: FilterType) => void;
  className?: string;
}

const ActivityFilter = ({ onFilterChange, className = '' }: ActivityFilterProps) => {
  const [filter, setFilter] = useState<FilterType>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'training', label: 'Training' },
    { value: 'exercise', label: 'Übung' },
    { value: 'game', label: 'Spiel' },
  ];
  
  const experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'puppy', label: 'Welpe' },
    { value: 'beginner', label: 'Anfänger' },
    { value: 'advanced', label: 'Fortgeschritten' },
    { value: 'professional', label: 'Profi' },
  ];
  
  const durations: { value: Duration; label: string }[] = [
    { value: 5, label: '5 Minuten' },
    { value: 10, label: '10 Minuten' },
    { value: 15, label: '15 Minuten' },
    { value: 30, label: '30 Minuten' },
  ];
  
  const locations: { value: Location; label: string }[] = [
    { value: 'indoor', label: 'Drinnen' },
    { value: 'outdoor', label: 'Draußen' },
  ];
  
  const engagementTypes: { value: EngagementType; label: string }[] = [
    { value: 'physical', label: 'Körperlich' },
    { value: 'cognitive', label: 'Kognitiv' },
  ];
  
  const handleTypeChange = (type: ActivityType) => {
    setFilter({ ...filter, type });
  };
  
  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    setFilter({ ...filter, experienceLevel: level });
  };
  
  const handleDurationChange = (duration: Duration) => {
    setFilter({ ...filter, duration });
  };
  
  const handleLocationChange = (location: Location) => {
    setFilter({ ...filter, location });
  };
  
  const handleEngagementTypeChange = (type: EngagementType) => {
    const currentTypes = filter.engagementType || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilter({ ...filter, engagementType: updatedTypes });
  };
  
  const handleMaterialsChange = (requiresMaterials: boolean) => {
    setFilter({ ...filter, requiresMaterials });
  };
  
  const handleApplyFilters = () => {
    onFilterChange(filter);
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };
  
  const handleResetFilters = () => {
    setFilter({});
    onFilterChange({});
  };
  
  const isFilterActive = Object.keys(filter).length > 0;
  
  const toggleExpandedState = () => {
    setIsExpanded(!isExpanded);
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.type) count++;
    if (filter.experienceLevel) count++;
    if (filter.duration) count++;
    if (filter.location) count++;
    if (filter.engagementType && filter.engagementType.length > 0) count++;
    if (filter.requiresMaterials !== undefined) count++;
    return count;
  };
  
  return (
    <div className={`card border dark:border-neutral-700 ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer md:cursor-default" 
        onClick={toggleExpandedState}
      >
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold mb-0 truncate">Filter</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <button className="md:hidden">
          {isExpanded ? (
            <ChevronDown className="transform rotate-180 transition-transform" />
          ) : (
            <ChevronDown className="transition-transform" />
          )}
        </button>
      </div>
      
      <div className={`p-4 pt-0 border-t dark:border-neutral-700 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="space-y-4">
          {/* Aktivitätstyp */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Aktivitätstyp</label>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                    filter.type === type.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Erfahrungsgrad */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Erfahrungsgrad</label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => handleExperienceLevelChange(level.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                    filter.experienceLevel === level.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dauer */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Dauer</label>
            <div className="flex flex-wrap gap-2">
              {durations.map(duration => (
                <button
                  key={duration.value}
                  onClick={() => handleDurationChange(duration.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                    filter.duration === duration.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ort */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Ort</label>
            <div className="flex flex-wrap gap-2">
              {locations.map(location => (
                <button
                  key={location.value}
                  onClick={() => handleLocationChange(location.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                    filter.location === location.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Art der Auslastung */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Art der Auslastung</label>
            <div className="space-y-2">
              {engagementTypes.map(type => (
                <div key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`engagement-${type.value}`}
                    checked={filter.engagementType?.includes(type.value) || false}
                    onChange={() => handleEngagementTypeChange(type.value)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <label htmlFor={`engagement-${type.value}`} className="ml-2 text-sm truncate">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Materialeinsatz */}
          <div>
            <label className="block text-sm font-medium mb-2 truncate">Materialeinsatz</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleMaterialsChange(true)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                  filter.requiresMaterials === true
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                }`}
              >
                Ja
              </button>
              <button
                onClick={() => handleMaterialsChange(false)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors truncate ${
                  filter.requiresMaterials === false
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200'
                }`}
              >
                Nein
              </button>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-6">
          <button
            onClick={handleApplyFilters}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 w-full sm:w-auto order-2 sm:order-1"
          >
            Filter anwenden
          </button>
          
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="btn-outline flex items-center justify-center gap-2 py-2.5 px-4 w-full sm:w-auto order-1 sm:order-2 bg-white dark:bg-neutral-800"
            >
              <X size={16} />
              <span className="text-center">Filter zurücksetzen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;