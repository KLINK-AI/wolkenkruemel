import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RegisterCredentials } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterCredentials & { confirmPassword: string }>();
  const { register: registerUser, error } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(error);
  
  const password = watch('password', '');
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  
  const onSubmit = async (data: RegisterCredentials & { confirmPassword: string }) => {
    try {
      setAuthError(null);
      const { confirmPassword, ...credentials } = data;
      await registerUser(credentials);
      navigate('/verify-email');
    } catch (error) {
      setAuthError(error.message || 'Failed to register. Please try again.');
    }
  };
  
  return (
    <div className="card p-6 md:p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Konto erstellen</h2>
      
      {authError && (
        <div className="mb-4 p-3 bg-error-100 border border-error-300 text-error-700 rounded-lg">
          {authError}
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
            className={`input ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="ihre-email@beispiel.de"
            {...register('email', { 
              required: 'E-Mail wird benötigt',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ungültige E-Mail-Adresse'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="label">Passwort</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Mindestens 6 Zeichen"
              {...register('password', { 
                required: 'Passwort wird benötigt',
                minLength: {
                  value: 6,
                  message: 'Passwort muss mindestens 6 Zeichen lang sein'
                }
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="label">Passwort wiederholen</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Passwort wiederholen"
              {...register('confirmPassword', { 
                required: 'Bitte bestätigen Sie Ihr Passwort',
                validate: value => value === password || 'Passwörter stimmen nicht überein'
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
              onClick={toggleConfirmPasswordVisibility}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreedToTerms"
                type="checkbox"
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                {...register('agreedToTerms', { 
                  required: 'Sie müssen den Nutzungsbedingungen zustimmen'
                })}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreedToTerms" className="font-medium text-neutral-700 dark:text-neutral-300">
                Ich stimme den <Link to="/terms" className="text-primary-600 hover:underline" target="_blank">Nutzungsbedingungen</Link> und der <Link to="/privacy" className="text-primary-600 hover:underline" target="_blank">Datenschutzerklärung</Link> zu
              </label>
              {errors.agreedToTerms && (
                <p className="mt-1 text-sm text-error-600">{errors.agreedToTerms.message}</p>
              )}
            </div>
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
                Ich möchte den Newsletter erhalten und über neue Funktionen informiert werden
              </label>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Registrierung läuft...</span>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Registrieren</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-neutral-600 dark:text-neutral-400">
          Bereits registriert?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;