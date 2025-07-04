import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/activities';
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      
      if (error.code === 'auth/missing-password') {
        errorMessage = 'Bitte geben Sie Ihr Passwort ein';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Ungültige E-Mail oder Passwort';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Falsches Passwort';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Ungültige E-Mail-Adresse';
      }
      
      setAuthError(errorMessage);
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className="card p-6 md:p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Anmelden</h2>
      
      {authError && (
        <div className="mb-4 p-3 bg-error-100 border border-error-300 text-error-700 rounded-lg">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="label">Passwort</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Ihr Passwort"
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
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Wird angemeldet...</span>
          ) : (
            <>
              <LogIn size={18} />
              <span>Anmelden</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-neutral-600 dark:text-neutral-400">
          Noch kein Konto?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;