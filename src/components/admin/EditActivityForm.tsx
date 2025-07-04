import React, { useState, useEffect } from 'react';
import { Activity } from '../../types';
import ImageUpload from './ImageUpload';
import { useForm } from 'react-hook-form';
import { updateActivity, getActivityById } from '../../services/firebaseService'; // Import getActivityById

interface EditActivityFormProps {
  activityId: string;
  onActivityUpdated?: () => void; // Optional callback
}

const EditActivityForm: React.FC<EditActivityFormProps> = ({ activityId, onActivityUpdated }) => {
  // State for activity data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for image URL
  const [imageUrl, setImageUrl] = useState<string>('');
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useForm hook for form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Activity>>();

  // Fetch activity data on component mount
  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedActivity = await getActivityById(activityId);
        if (fetchedActivity) {
          // Set fetched data to form
          reset(fetchedActivity);
          // Set initial image URL
          setImageUrl(fetchedActivity.imageUrl || '');
        } else {
          setError('Aktivität nicht gefunden.');
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
        console.error('Error fetching activity:', err);
      }
    };

    fetchActivity();
  }, [activityId]);

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const onSubmit = async (data: Partial<Activity>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Manually process textarea fields split by newline for array types
      const processedData = {
        ...data,
        tips: typeof data.tips === 'string' ? data.tips.split('\n').map(tip => tip.trim()).filter(tip => tip) : data.tips,
        troubleshooting: typeof data.troubleshooting === 'string' ? data.troubleshooting.split('\n').map(item => item.trim()).filter(item => item) : data.troubleshooting,
        variations: typeof data.variations === 'string' ? data.variations.split('\n').map(variation => variation.trim()).filter(variation => variation) : data.variations,
        materials: typeof data.materials === 'string' ? data.materials.split('\n').map(material => material.trim()).filter(material => material) : data.materials,
        // Ensure array fields from select[multiple] are arrays
        experienceLevel: Array.isArray(data.experienceLevel) ? data.experienceLevel : (data.experienceLevel ? [data.experienceLevel] : []),
        location: Array.isArray(data.location) ? data.location : (data.location ? [data.location] : []),
        engagementType: Array.isArray(data.engagementType) ? data.engagementType : (data.engagementType ? [data.engagementType] : []),
      };

      // Combine processed data and updated image URL for the update
      const updatedActivityData: Partial<Activity> = { ...processedData, imageUrl: imageUrl };
      console.log(updatedActivityData);
      await updateActivity(activityId, updatedActivityData);
      if (onActivityUpdated) {
        onActivityUpdated();
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating activity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Lade Aktivität...</div>;
  }

  if (error) {
    return <div>Fehler beim Laden der Aktivität: {error}</div>;
  }

  // If isLoading is false and no error but form data is not set, activity wasn't found.
  // We can check errors from useForm or rely on the initial fetch error.
  // A better check might be if the reset call actually populated the form state,
  // but relying on the initial fetch result is simpler here.
  // If the fetch returned null, setError would be set. So if no error and not loading, activity was found.
  // If reset didn't work, the form would be empty, but not necessarily an error state we track here.
  if (!activityId) { // Basic check, though should be caught by the fetch logic
    return <div>Aktivität nicht gefunden.</div>;
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ImageUpload
        onImageUploaded={handleImageUploaded}
        currentImage={imageUrl}
      />


        <div>
            <label htmlFor="title" className="label">Titel</label>
            <input
              type="text"
              id="title"
              className="input"
              {...register('title', { required: 'Titel wird benötigt' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="label">Beschreibung</label>
            <textarea
              id="description"
              rows={4}
              className="input"
              {...register('description', { required: 'Beschreibung wird benötigt' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="type" className="label">Typ</label>
            <select
              id="type"
              className="input"
              {...register('type', { required: 'Typ wird benötigt' })}
            >
              <option value="training">Training</option>
              <option value="exercise">Übung</option>
              <option value="game">Spiel</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="experienceLevel" className="label">Erfahrungslevel</label>
            <select
              id="experienceLevel"
              className="input"
              multiple
              {...register('experienceLevel', { required: 'Erfahrungslevel wird benötigt' })}
            >
              <option value="puppy">Welpe</option>
              <option value="beginner">Anfänger</option>
              <option value="advanced">Fortgeschritten</option>
              <option value="professional">Profi</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="duration" className="label">Dauer (Minuten)</label>
            <select
              id="duration"
              className="input"
              {...register('duration', { required: 'Dauer wird benötigt' })}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="label">Ort</label>
            <select
              id="location"
              className="input"
              multiple
              {...register('location', { required: 'Ort wird benötigt' })}
            >
              <option value="indoor">Drinnen</option>
              <option value="outdoor">Draußen</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="engagementType" className="label">Art der Auslastung</label>
            <select
              id="engagementType"
              className="input"
              multiple
              {...register('engagementType', { required: 'Art der Auslastung wird benötigt' })}
            >
              <option value="physical">Körperlich</option>
              <option value="cognitive">Kognitiv</option>
            </select>
          </div>
          
          {/* These fields will be processed in onSubmit to split into arrays */}
          <div>
            <label htmlFor="tips" className="label">Tipps (einer pro Zeile)</label>
            <textarea id="tips" rows={4} className="input" {...register('tips', { required: 'Mindestens ein Tipp wird benötigt' })} />
          </div>
          
          <div>
            <label htmlFor="troubleshooting" className="label">Fehlerbehebung (einer pro Zeile)</label>
            <textarea id="troubleshooting" rows={4} className="input" {...register('troubleshooting', { required: 'Mindestens eine Fehlerbehebung wird benötigt' })} />
          </div>
          
          <div>
            <label htmlFor="variations" className="label">Variationen (eine pro Zeile)</label>
            <textarea id="variations" rows={4} className="input" {...register('variations', { required: 'Mindestens eine Variation wird benötigt' })} />
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="requiresMaterials"
                className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                {...register('requiresMaterials')}
              />
              <label htmlFor="requiresMaterials" className="ml-2 text-sm font-medium">
                Materialien benötigt
              </label>
            </div>
            <textarea id="materials" rows={4} className="input" placeholder="Benötigte Materialien (eines pro Zeile)" {...register('materials')} />
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="premiumOnly"
                className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                {...register('premiumOnly')}
              />
              <label htmlFor="premiumOnly" className="ml-2 text-sm font-medium">
                Nur für Premium-Mitglieder
              </label>
            </div>
          </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
  );
};

export default EditActivityForm;