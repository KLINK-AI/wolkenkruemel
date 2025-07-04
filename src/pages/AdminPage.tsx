import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createActivity, getAllActivities, deleteActivity } from '../services/firebaseService';
import { Activity } from '../types';
import ImageUpload from '../components/admin/ImageUpload';
import StorageTest from '../components/admin/StorageTest';
import { useForm } from 'react-hook-form';
import EditActivityForm from '../components/admin/EditActivityForm';

type ActivityFormData = Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

const AdminPage = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // New state for listing and editing activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null); // State to track which activity is being deleted
  const [deleteError, setDeleteError] = useState<string | null>(null); // State to track delete errors
  const [reloadingActivities, setReloadingActivities] = useState(false); // State to track reloading after action

  // Effect to fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const fetchedActivities = await getAllActivities();
        setActivities(fetchedActivities);
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setIsLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []); // Empty dependency array means this effect runs once on mount

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityFormData>();
  
  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  
  const onSubmit = async (data: ActivityFormData) => {
    if (!user) return;

    const fetchActivities = async () => {
      setReloadingActivities(true);
      await getAllActivities().then(setActivities).catch(setFetchError).finally(() => setReloadingActivities(false));
    };



    setDeleteError(null); // Clear delete errors when submitting create form
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const activityData: ActivityFormData = {
        ...data,
        imageUrl,
        experienceLevel: Array.isArray(data.experienceLevel) ? data.experienceLevel : [data.experienceLevel],
        location: Array.isArray(data.location) ? data.location : [data.location],
        engagementType: Array.isArray(data.engagementType) ? data.engagementType : [data.engagementType],
        tips: data.tips.split('\n').filter(tip => tip.trim()),
        troubleshooting: data.troubleshooting.split('\n').filter(item => item.trim()),
        variations: data.variations.split('\n').filter(variation => variation.trim()),
        materials: data.materials?.split('\n').filter(material => material.trim()) || [],
      };

      
      await createActivity(activityData);
      setSuccess(true);
      reset();
      fetchActivities(); // Reload activities after creating
      setImageUrl('');
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleDeleteActivity = async (activityId: string) => {
 if (!user) {
      setError('Sie müssen angemeldet sein, um Aktivitäten zu löschen.');
      return;
    }

    setDeletingActivityId(activityId);
    setDeleteError(null); // Clear previous delete errors
    
    try {
      await deleteActivity(activityId);      // Refetch activities to update the list
      // Refetch activities to update the list
      const fetchedActivities = await getAllActivities();
      setActivities(fetchedActivities); // Update state with the new list
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeletingActivityId(null);
    }
  };

  // Function to refetch activities - used after create/update/delete
  const fetchActivities = async () => {
    setReloadingActivities(true);
    await getAllActivities().then(setActivities).catch(setFetchError).finally(() => setReloadingActivities(false));
  };
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin-Bereich</h1>
      <StorageTest />
      
      <div className="card border dark:border-neutral-700 p-6 mb-8">
        {/* Conditional Rendering: Show Create Form or Edit Form */}
        {editingActivityId ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Aktivität bearbeiten</h2>
              <button
                onClick={() => setEditingActivityId(null)}
                className="btn-outline"
              >
                Zurück zum Erstellen
              </button>
            </div>
            <EditActivityForm
              activityId={editingActivityId}
              onActivityUpdated={() => {
                setEditingActivityId(null); // Go back to create form after update
                // Refetch activities to update the list
                fetchActivities();
              }}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Neue Aktivität erstellen</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-error-100 border border-error-300 text-error-700 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-success-100 border border-success-300 text-success-700 rounded-lg">
                Aktivität wurde erfolgreich erstellt!
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImage={imageUrl}
                className="mb-6"
              />
              
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
              
              <div>
                <label htmlFor="tips" className="label">Tipps (einer pro Zeile)</label>
                <textarea
                  id="tips"
                  rows={4}
                  className="input"
                  {...register('tips', { required: 'Mindestens ein Tipp wird benötigt' })}
                />
              </div>
              
              <div>
                <label htmlFor="troubleshooting" className="label">Fehlerbehebung (einer pro Zeile)</label>
                <textarea
                  id="troubleshooting"
                  rows={4}
                  className="input"
                  {...register('troubleshooting', { required: 'Mindestens eine Fehlerbehebung wird benötigt' })}
                />
              </div>
              
              <div>
                <label htmlFor="variations" className="label">Variationen (eine pro Zeile)</label>
                <textarea
                  id="variations"
                  rows={4}
                  className="input"
                  {...register('variations', { required: 'Mindestens eine Variation wird benötigt' })}
                />
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
                
                <textarea
                  id="materials"
                  rows={4}
                  className="input"
                  placeholder="Benötigte Materialien (eines pro Zeile)"
                  {...register('materials')}
                />
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
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5"
              >
                {isSubmitting ? 'Wird erstellt...' : 'Aktivität erstellen'}
              </button>
            </form>
          </div>
        )}
        
      </div>

      <div className="card border dark:border-neutral-700 p-6">
        <h2 className="text-2xl font-semibold mb-6">Bestehende Aktivitäten</h2>

        {/* Conditional rendering for status and activity list */}
        {deletingActivityId && deleteError && (
          <p className="text-error-600">Fehler beim Löschen: {deleteError}</p>
        )}

        {fetchError && !deletingActivityId && ( // Display fetch error only if not currently deleting
          <p className="text-error-600">Fehler beim Laden der Aktivitäten: {fetchError}</p>
        )}

        {(isLoadingActivities || reloadingActivities) && !fetchError && !deletingActivityId && ( // Display loading only if no fetch error and not deleting
          <p>Aktivitäten werden geladen...</p>
        )}

        {!isLoadingActivities && !fetchError && activities.length === 0 && ( // Display no activities found only if not loading and no fetch error
          <p>Keine Aktivitäten gefunden.</p>
        )}

        {!isLoadingActivities && !fetchError && activities.length > 0 && ( // Render list only if not loading, no fetch error, and activities exist
          <>
            {/* General messages (optional, can be placed outside this block if preferred) */}
            {error && <p className="text-error-600 mb-4">{error}</p>}
            {success && (
              <p className="text-success-600 mb-4">Aktivität erfolgreich gespeichert!</p>
            )}

            <ul className="space-y-4">
              {activities.map(activity => (
                <li key={activity.id} className="flex justify-between items-center border-b pb-2 dark:border-neutral-700">
                  <span>{activity.title}</span>
                  <div className="flex space-x-2 items-center">
                    <button
                      onClick={() => setEditingActivityId(activity.id)}
                      className="btn-outline btn-sm"
                      disabled={!!deletingActivityId}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="btn-outline btn-sm text-error-600 dark:text-error-400"
                      disabled={!!deletingActivityId} // Disable if any activity is being deleted
                    >
                      {deletingActivityId === activity.id ? 'Löschen...' : 'Löschen'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;