import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserData } from '../services/firebaseService';
import { User } from '../types';
import { useForm } from 'react-hook-form';
import { LogOut, CreditCard, User as UserIcon, Lock, Shield } from 'lucide-react';

type ProfileFormData = {
  displayName?: string;
  email: string;
  agreedToNewsletter: boolean;
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      agreedToNewsletter: user?.agreedToNewsletter || false,
    },
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const updatedData: Partial<User> = {
        displayName: data.displayName || null,
        agreedToNewsletter: data.agreedToNewsletter,
      };
      
      await updateUserData(user.uid, updatedData);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Bitte melden Sie sich an, um Ihr Profil zu sehen.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mein Profil</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Verwalten Sie Ihre Kontoinformationen und Einstellungen
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card border dark:border-neutral-700 overflow-hidden">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 border-b dark:border-neutral-700">
              <h3 className="font-medium">
                {user.displayName || user.email.split('@')[0]}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {user.role === 'premium' ? 'Premium-Mitglied' : 'Kostenloser Account'}
              </p>
            </div>
            
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <UserIcon size={18} />
                <span>Persönliche Daten</span>
              </button>
              
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'subscription'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <CreditCard size={18} />
                <span>Abonnement</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <Shield size={18} />
                <span>Sicherheit</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left p-3 rounded-lg text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors mt-4"
              >
                <LogOut size={18} />
                <span>Abmelden</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <div className="card border dark:border-neutral-700">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Persönliche Daten</h2>
                
                {updateSuccess && (
                  <div className="mb-4 p-3 bg-success-100 border border-success-300 text-success-700 rounded-lg">
                    Ihre Profildaten wurden erfolgreich aktualisiert.
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="label">Name (optional)</label>
                    <input
                      id="displayName"
                      type="text"
                      className="input"
                      placeholder="Ihr Name"
                      {...register('displayName')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="label">E-Mail</label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      disabled
                      {...register('email')}
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      E-Mail-Adressen können nicht geändert werden
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreedToNewsletter"
                        type="checkbox"
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        {...register('agreedToNewsletter')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreedToNewsletter" className="font-medium text-neutral-700 dark:text-neutral-300">
                        Ich möchte den Newsletter erhalten
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-primary w-full py-2.5"
                  >
                    {isUpdating ? 'Wird aktualisiert...' : 'Profil aktualisieren'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Abonnement</h2>
                
                <div className="mb-6 p-4 border rounded-lg dark:border-neutral-700">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Aktueller Plan</h3>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${user.role === 'premium' ? 'bg-accent-100 text-accent-800' : 'bg-neutral-100 text-neutral-700'} dark:bg-neutral-700`}>
                      {user.role === 'premium' ? 'Premium' : 'Kostenlos'}
                    </span>
                  </div>
                  
                  {user.role === 'premium' ? (
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Sie haben Zugang zu allen Premium-Funktionen. Ihr Abonnement verlängert sich automatisch.
                    </p>
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Sie nutzen den kostenlosen Plan mit eingeschränkten Funktionen.
                    </p>
                  )}
                </div>
                
                {user.role !== 'premium' && (
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Upgrade auf Premium</h3>
                    <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                      Genießen Sie unbegrenzten Zugang zu allen Aktivitäten und Premium-Funktionen.
                    </p>
                    
                    <div className="mb-4 border-b pb-4 dark:border-neutral-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Premium-Monat</span>
                        <span className="font-bold">9,99 € / Monat</span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Voller Zugriff, monatliche Abrechnung
                      </p>
                      
                      <button className="btn-primary w-full mt-3">
                        Jetzt upgraden
                      </button>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Premium-Jahr</span>
                        <div>
                          <span className="font-bold">99,99 € / Jahr</span>
                          <span className="ml-2 text-sm bg-accent-100 text-accent-800 px-2 py-0.5 rounded-full">16% Rabatt</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Voller Zugriff, jährliche Abrechnung
                      </p>
                      
                      <button className="btn-primary w-full mt-3">
                        Jahresabo wählen
                      </button>
                    </div>
                  </div>
                )}
                
                {user.role === 'premium' && (
                  <div>
                    <button className="btn-outline">
                      Abonnement kündigen
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Sicherheit</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Passwort ändern</h3>
                  <button className="btn-outline flex items-center gap-1">
                    <Lock size={18} />
                    <span>Passwort ändern</span>
                  </button>
                </div>
                
                <div className="border-t pt-6 dark:border-neutral-700">
                  <h3 className="font-medium mb-3">Konto löschen</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                    Wenn Sie Ihr Konto löschen, werden alle Ihre Daten dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                  <button className="btn bg-error-100 hover:bg-error-200 text-error-700 border border-error-300">
                    Konto löschen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;