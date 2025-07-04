import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dog, ArrowRight, Heart, ArrowDown, CheckCircle, Shield, Lock } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 -mt-8 bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/30 dark:to-neutral-900 rounded-b-3xl overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary-800 dark:text-primary-200">
                Maßgeschneidertes Training für glückliche Hunde
              </h1>
              <p className="text-lg mb-8 text-neutral-700 dark:text-neutral-300">
                Entdecken Sie personalisierte Trainings- und Beschäftigungseinheiten, die perfekt auf die Bedürfnisse Ihres Hundes abgestimmt sind - für mehr Freude im Alltag.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/activities" className="btn-primary py-3 px-6 text-lg flex items-center gap-2">
                    <span>Aktivitäten entdecken</span>
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn-primary py-3 px-6 text-lg flex items-center gap-2">
                    <span>Jetzt starten</span>
                    <ArrowRight size={20} />
                  </Link>
                )}
                <a href="#how-it-works" className="btn-outline py-3 px-6 text-lg flex items-center gap-2">
                  <span>Wie es funktioniert</span>
                  <ArrowDown size={20} />
                </a>
              </div>
            </div>
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://klink-ai.com/dogs-lavender.jpg" 
                  alt="Hund im Lavendelfeld" 
                  className="w-full object-cover aspect-4/3"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                    <Dog className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-700 dark:text-primary-300">100+ Aktivitäten</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">für jedes Hundelevel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-300/30 rounded-full blur-3xl"></div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Wie funktioniert es?</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              In nur wenigen Schritten zu maßgeschneiderten Trainingseinheiten für Ihren Hund
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card p-6 relative border dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="absolute -top-5 -left-5 bg-accent-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div className="mb-4 h-14 flex items-center justify-center">
                <Dog className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Hund beschreiben</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-center">
                Teilen Sie uns mit, welche Erfahrung Ihr Hund hat und welche Art von Aktivität Sie suchen.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card p-6 relative border dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="absolute -top-5 -left-5 bg-accent-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div className="mb-4 h-14 flex items-center justify-center">
                <Heart className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Aktivität auswählen</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-center">
                Wählen Sie aus personalisierten Vorschlägen die perfekte Beschäftigung für Ihren Vierbeiner.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card p-6 relative border dark:border-neutral-700 hover:shadow-md transition-shadow">
              <div className="absolute -top-5 -left-5 bg-accent-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div className="mb-4 h-14 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Spaß haben</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-center">
                Folgen Sie der detaillierten Anleitung und genießen Sie die gemeinsame Zeit mit Ihrem Hund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 dark:bg-neutral-800 py-16 rounded-2xl">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unsere Vorteile</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Warum Hundebesitzer Wolkenkrümel lieben
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertengeprüft</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Alle Übungen wurden von professionellen Hundetrainern entwickelt und getestet.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-600 dark:text-primary-300">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ohne Zeitdruck</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Üben Sie in Ihrem eigenen Tempo. Die Aktivitäten sind so gestaltet, dass sie jederzeit durchgeführt werden können.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-600 dark:text-primary-300">
                  <path d="M2 18C2 16 7 16 7 16C7 16 12 16 12 18C12 20 7 20 7 20C7 20 2 20 2 18Z"></path>
                  <path d="M12 18C12 16 17 16 17 16C17 16 22 16 22 18C22 20 17 20 17 20C17 20 12 20 12 18Z"></path>
                  <path d="M2 6C2 4 7 4 7 4C7 4 12 4 12 6C12 8 7 8 7 8C7 8 2 8 2 6Z"></path>
                  <path d="M12 6C12 4 17 4 17 4C17 4 22 4 22 6C22 8 17 8 17 8C17 8 12 8 12 6Z"></path>
                  <path d="M17 8V16"></path>
                  <path d="M7 8V16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalisierte Vorschläge</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Erhalten Sie Übungen, die perfekt zum Alter, Erfahrungslevel und den Vorlieben Ihres Hundes passen.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-600 dark:text-primary-300">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Detaillierte Anleitungen</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Schritt-für-Schritt-Anleitungen mit Tipps zur Fehlerbehebung und Variationsmöglichkeiten.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-600 dark:text-primary-300">
                  <circle cx="18" cy="15" r="3"></circle>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M10 15H6a4 4 0 0 0-4 4v2h9.5"></path>
                  <path d="M21.7 16.4c.2-.5.3-1 .3-1.4 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 .5.1.9.3 1.4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community-Support</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Tauschen Sie sich mit anderen Hundebesitzern aus und teilen Sie Ihre Erfahrungen.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm">
              <div className="bg-primary-100 dark:bg-primary-800/50 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                <Lock className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Datenschutz</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Ihre Daten sind bei uns sicher. Wir befolgen strenge DSGVO-Richtlinien zum Schutz Ihrer Privatsphäre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-primary-600 dark:bg-primary-800 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Bereit für ein besseres Training?</h2>
              <p className="text-primary-100 text-lg mb-8">
                Registrieren Sie sich jetzt und entdecken Sie hunderte von personalisierten Trainingseinheiten für Sie und Ihren Hund.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/activities" className="btn bg-white text-primary-700 hover:bg-primary-50 py-3 px-6 text-lg flex items-center gap-2">
                    <span>Aktivitäten entdecken</span>
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 py-3 px-6 text-lg flex items-center gap-2">
                    <span>Jetzt kostenlos starten</span>
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full opacity-50 transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-700 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;