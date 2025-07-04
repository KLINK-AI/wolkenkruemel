import { useState, useEffect } from 'react';

export type Language = 'en' | 'de' | 'es' | 'fr' | 'it';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    de: 'Startseite',
    es: 'Inicio',
    fr: 'Accueil',
    it: 'Home'
  },
  'nav.activities': {
    en: 'Activities',
    de: 'Aktivitäten',
    es: 'Actividades',
    fr: 'Activités',
    it: 'Attività'
  },
  'nav.community': {
    en: 'Community',
    de: 'Gemeinschaft',
    es: 'Comunidad',
    fr: 'Communauté',
    it: 'Comunità'
  },
  'nav.profile': {
    en: 'My Profile',
    de: 'Mein Profil',
    es: 'Mi Perfil',
    fr: 'Mon Profil',
    it: 'Il Mio Profilo'
  },
  
  // Community
  'community.feed': {
    en: 'Feed',
    de: 'Feed',
    es: 'Feed',
    fr: 'Fil d\'actualité',
    it: 'Feed'
  },
  'community.network': {
    en: 'My Network',
    de: 'Mein Netzwerk',
    es: 'Mi Red',
    fr: 'Mon Réseau',
    it: 'La Mia Rete'
  },
  'community.forum': {
    en: 'Q&A Forum',
    de: 'Q&A Forum',
    es: 'Foro de P&R',
    fr: 'Forum Q&R',
    it: 'Forum Q&A'
  },
  'community.success': {
    en: 'Success Stories',
    de: 'Erfolgsgeschichten',
    es: 'Historias de Éxito',
    fr: 'Histoires de Succès',
    it: 'Storie di Successo'
  },
  'community.events': {
    en: 'Events',
    de: 'Veranstaltungen',
    es: 'Eventos',
    fr: 'Événements',
    it: 'Eventi'
  },
  
  // Posts and Content
  'post.placeholder': {
    en: 'Share your dog training progress, tips, or ask for help...',
    de: 'Teilen Sie Ihre Fortschritte beim Hundetraining, Tipps oder bitten Sie um Hilfe...',
    es: 'Comparte tu progreso de entrenamiento canino, consejos, o pide ayuda...',
    fr: 'Partagez vos progrès en dressage de chien, des conseils, ou demandez de l\'aide...',
    it: 'Condividi i tuoi progressi nell\'addestramento del cane, consigli, o chiedi aiuto...'
  },
  'post.share': {
    en: 'Share',
    de: 'Teilen',
    es: 'Compartir',
    fr: 'Partager',
    it: 'Condividi'
  },
  'post.like': {
    en: 'Like',
    de: 'Gefällt mir',
    es: 'Me gusta',
    fr: 'J\'aime',
    it: 'Mi piace'
  },
  'post.comment': {
    en: 'Comment',
    de: 'Kommentar',
    es: 'Comentario',
    fr: 'Commentaire',
    it: 'Commento'
  },
  'post.comments': {
    en: 'comments',
    de: 'Kommentare',
    es: 'comentarios',
    fr: 'commentaires',
    it: 'commenti'
  },
  
  // Activities
  'activity.title': {
    en: 'Activity Title',
    de: 'Aktivitätstitel',
    es: 'Título de Actividad',
    fr: 'Titre de l\'Activité',
    it: 'Titolo Attività'
  },
  'activity.description': {
    en: 'Description',
    de: 'Beschreibung',
    es: 'Descripción',
    fr: 'Description',
    it: 'Descrizione'
  },
  'activity.difficulty': {
    en: 'Difficulty',
    de: 'Schwierigkeit',
    es: 'Dificultad',
    fr: 'Difficulté',
    it: 'Difficoltà'
  },
  'activity.beginner': {
    en: 'Beginner',
    de: 'Anfänger',
    es: 'Principiante',
    fr: 'Débutant',
    it: 'Principiante'
  },
  'activity.intermediate': {
    en: 'Intermediate',
    de: 'Fortgeschritten',
    es: 'Intermedio',
    fr: 'Intermédiaire',
    it: 'Intermedio'
  },
  'activity.advanced': {
    en: 'Advanced',
    de: 'Experte',
    es: 'Avanzado',
    fr: 'Avancé',
    it: 'Avanzato'
  },
  'activity.duration': {
    en: 'Duration (minutes)',
    de: 'Dauer (Minuten)',
    es: 'Duración (minutos)',
    fr: 'Durée (minutes)',
    it: 'Durata (minuti)'
  },
  'activity.create': {
    en: 'Create Activity',
    de: 'Aktivität erstellen',
    es: 'Crear Actividad',
    fr: 'Créer une Activité',
    it: 'Crea Attività'
  },
  
  // Subscription
  'subscription.unlock': {
    en: 'Unlock Premium Content',
    de: 'Premium-Inhalte freischalten',
    es: 'Desbloquear Contenido Premium',
    fr: 'Débloquer le Contenu Premium',
    it: 'Sblocca Contenuto Premium'
  },
  'subscription.upgrade': {
    en: 'Upgrade Now',
    de: 'Jetzt upgraden',
    es: 'Actualizar Ahora',
    fr: 'Mettre à Niveau Maintenant',
    it: 'Aggiorna Ora'
  },
  'subscription.community': {
    en: 'Community',
    de: 'Gemeinschaft',
    es: 'Comunidad',
    fr: 'Communauté',
    it: 'Comunità'
  },
  'subscription.premium': {
    en: 'Pro Trainer',
    de: 'Pro-Trainer',
    es: 'Entrenador Pro',
    fr: 'Entraîneur Pro',
    it: 'Allenatore Pro'
  },
  'subscription.professional': {
    en: 'Expert',
    de: 'Experte',
    es: 'Experto',
    fr: 'Expert',
    it: 'Esperto'
  },
  
  // Time
  'time.now': {
    en: 'Just now',
    de: 'Gerade eben',
    es: 'Ahora mismo',
    fr: 'À l\'instant',
    it: 'Proprio ora'
  },
  'time.hour': {
    en: 'hour',
    de: 'Stunde',
    es: 'hora',
    fr: 'heure',
    it: 'ora'
  },
  'time.hours': {
    en: 'hours',
    de: 'Stunden',
    es: 'horas',
    fr: 'heures',
    it: 'ore'
  },
  'time.day': {
    en: 'day',
    de: 'Tag',
    es: 'día',
    fr: 'jour',
    it: 'giorno'
  },
  'time.days': {
    en: 'days',
    de: 'Tage',
    es: 'días',
    fr: 'jours',
    it: 'giorni'
  },
  'time.ago': {
    en: 'ago',
    de: 'vor',
    es: 'hace',
    fr: 'il y a',
    it: 'fa'
  },
  
  // Common
  'common.loading': {
    en: 'Loading...',
    de: 'Laden...',
    es: 'Cargando...',
    fr: 'Chargement...',
    it: 'Caricamento...'
  },
  'common.error': {
    en: 'Error',
    de: 'Fehler',
    es: 'Error',
    fr: 'Erreur',
    it: 'Errore'
  },
  'common.success': {
    en: 'Success',
    de: 'Erfolg',
    es: 'Éxito',
    fr: 'Succès',
    it: 'Successo'
  },
  'common.cancel': {
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    fr: 'Annuler',
    it: 'Annulla'
  },
  'common.save': {
    en: 'Save',
    de: 'Speichern',
    es: 'Guardar',
    fr: 'Enregistrer',
    it: 'Salva'
  },
  'common.edit': {
    en: 'Edit',
    de: 'Bearbeiten',
    es: 'Editar',
    fr: 'Modifier',
    it: 'Modifica'
  },
  'common.delete': {
    en: 'Delete',
    de: 'Löschen',
    es: 'Eliminar',
    fr: 'Supprimer',
    it: 'Elimina'
  }
};

const STORAGE_KEY = 'wolkenkruemel_language';

class I18nManager {
  private currentLanguage: Language = 'en';
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load saved language or detect browser language
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && this.isValidLanguage(savedLang)) {
      this.currentLanguage = savedLang as Language;
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (this.isValidLanguage(browserLang)) {
        this.currentLanguage = browserLang as Language;
      }
    }
  }

  private isValidLanguage(lang: string): boolean {
    return ['en', 'de', 'es', 'fr', 'it'].includes(lang);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    if (this.currentLanguage !== language) {
      this.currentLanguage = language;
      localStorage.setItem(STORAGE_KEY, language);
      this.notifyListeners();
    }
  }

  translate(key: string, fallback?: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback || key;
    }
    
    return translation[this.currentLanguage] || translation.en || fallback || key;
  }

  addListener(callback: () => void): void {
    this.listeners.add(callback);
  }

  removeListener(callback: () => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // Helper method for time formatting
  formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - targetDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      return this.translate('time.now');
    } else if (hours < 24) {
      const hourText = hours === 1 
        ? this.translate('time.hour') 
        : this.translate('time.hours');
      return `${hours} ${hourText} ${this.translate('time.ago')}`;
    } else {
      const days = Math.floor(hours / 24);
      const dayText = days === 1 
        ? this.translate('time.day') 
        : this.translate('time.days');
      return `${days} ${dayText} ${this.translate('time.ago')}`;
    }
  }
}

export const i18n = new I18nManager();

// React hook for using translations
export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate(prev => prev + 1);
    };

    i18n.addListener(handleLanguageChange);
    return () => i18n.removeListener(handleLanguageChange);
  }, []);

  return {
    t: (key: string, fallback?: string) => i18n.translate(key, fallback),
    language: i18n.getCurrentLanguage(),
    setLanguage: (lang: Language) => i18n.setLanguage(lang),
    formatTimeAgo: (date: Date | string) => i18n.formatTimeAgo(date),
  };
}

// Language selector component data
export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];
