import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-100 dark:bg-neutral-800 pt-10 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="https://klink-ai.com/Wolkenkruemel_Logo.jpg" 
                alt="Wolkenkrümel Logo" 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                Wolkenkrümel
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Personalisierte Trainings- und Beschäftigungseinheiten für Ihren Hund, basierend auf Ihren individuellen Bedürfnissen.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
              Schnellzugriff
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/activities" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300">
                  Aktivitäten
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300">
                  Favoriten
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300">
                  Mein Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              {/* Add onClick handler to scroll to top before navigating */}
              <li>
                <Link to="/terms#top" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300" onClick={() => window.scrollTo(0, 0)}>
                  Nutzungsbedingungen
                </Link>
              </li>
              {/* Add onClick handler to scroll to top before navigating */}
              <li>
                <Link to="/privacy#top" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300" onClick={() => window.scrollTo(0, 0)}>
                  Datenschutzerklärung
                </Link>
              </li>
              {/* Add onClick handler to scroll to top before navigating */}
              <li>
                <Link to="/imprint#top" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300" onClick={() => window.scrollTo(0, 0)}>
                  Impressum
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
              Kontakt
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@tiergestuetztepaedagogik.de" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300">
                  info@tiergestuetztepaedagogik.de
                </a>
              </li>
              <li>
                <a href="tel:+491732913535" className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-300">
                  +49 173 2913535
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-center text-neutral-600 dark:text-neutral-400 text-sm">
            © {currentYear} Wolkenkrümel. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;