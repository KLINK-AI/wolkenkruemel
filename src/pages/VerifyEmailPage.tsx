import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';

const VerifyEmailPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        await refreshUser();
        if (user.isEmailVerified) {
          navigate('/activities');
        }
      }
    };
    
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [user, refreshUser, navigate]);
  
  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert('Verifizierungs-E-Mail wurde erneut gesendet. Bitte überprüfen Sie Ihren E-Mail-Eingang.');
      } catch (error) {
        console.error('Error sending verification email:', error);
        alert('Fehler beim Senden der Verifizierungs-E-Mail. Bitte versuchen Sie es später erneut.');
      }
    }
  };
  
  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="card p-8 border dark:border-neutral-700">
          <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Nicht angemeldet</h1>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Sie müssen angemeldet sein, um auf diese Seite zuzugreifen.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Zum Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="card p-8 border dark:border-neutral-700">
        <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary-600 dark:text-primary-300" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">E-Mail-Bestätigung erforderlich</h1>
        
        <p className="mb-4 text-neutral-600 dark:text-neutral-400">
          Wir haben eine Bestätigungs-E-Mail an <strong>{user.email}</strong> gesendet.
        </p>
        
        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          Bitte klicken Sie auf den Link in der E-Mail, um Ihre E-Mail-Adresse zu bestätigen und auf alle Funktionen der App zuzugreifen.
        </p>
        
        <div className="mb-6">
          <button
            onClick={handleResendVerification}
            className="btn-outline inline-flex items-center gap-2"
          >
            <RefreshCw size={18} />
            <span>Bestätigungs-E-Mail erneut senden</span>
          </button>
        </div>
        
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          <p>Sie haben die E-Mail bereits bestätigt?</p>
          <button 
            onClick={() => refreshUser()}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Klicken Sie hier zum Aktualisieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;