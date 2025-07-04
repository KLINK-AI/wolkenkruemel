import { Link } from 'react-router-dom';
import { Dog } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Dog className="w-24 h-24 text-primary-500 mb-6" />
      
      <h1 className="text-4xl font-bold mb-4">404 - Seite nicht gefunden</h1>
      
      <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
        Hoppla! Die Seite, die Sie suchen, existiert nicht.
      </p>
      
      <div className="flex gap-4">
        <Link
          to="/"
          className="btn-primary py-2.5 px-6"
        >
          Zur Startseite
        </Link>
        
        <Link
          to="/activities"
          className="btn-outline py-2.5 px-6"
        >
          Aktivitäten entdecken
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;