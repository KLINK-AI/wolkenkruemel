import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.activities': 'Aktivitäten',
    'nav.community': 'Community',
    'nav.profile': 'Mein Profil',
    'nav.createActivity': 'Aktivität erstellen',
    
    // Community Page
    'community.title': 'Community',
    'community.whatsHappening': 'Was passiert in der Community?',
    'community.shareThoughts': 'Teile deine Gedanken mit der Community...',
    'community.post': 'Beitrag',
    'community.question': 'Frage',
    'community.activity': 'Aktivität',
    'community.trending': 'Trending Topics',
    'community.suggested': 'Vorgeschlagene Nutzer',
    'community.events': 'Kommende Events',
    'community.stats': 'Deine Statistiken',
    'community.activitiesCompleted': 'Aktivitäten abgeschlossen',
    'community.postsCreated': 'Beiträge erstellt',
    'community.likesReceived': 'Likes erhalten',
    
    // Create Activity Page
    'createActivity.title': 'Neue Aktivität erstellen',
    'createActivity.backToCommunity': 'Zurück zur Community',
    'createActivity.activityTitle': 'Aktivitätstitel',
    'createActivity.titlePlaceholder': 'Gib deiner Aktivität einen aussagekräftigen Titel...',
    'createActivity.description': 'Beschreibung',
    'createActivity.descriptionPlaceholder': 'Beschreibe kurz, worum es in dieser Aktivität geht...',
    'createActivity.content': 'Inhalt',
    'createActivity.contentPlaceholder': 'Gib hier eine detaillierte Anleitung für die Aktivität...',
    'createActivity.difficulty': 'Schwierigkeit',
    'createActivity.beginner': 'Anfänger',
    'createActivity.intermediate': 'Fortgeschritten',
    'createActivity.advanced': 'Experte',
    'createActivity.duration': 'Dauer (Minuten)',
    'createActivity.tags': 'Tags',
    'createActivity.tagsPlaceholder': 'Füge Tags hinzu (mit Komma getrennt)...',
    'createActivity.submit': 'Aktivität erstellen',
    'createActivity.publishing': 'Veröffentliche...',
    
    // Footer
    'footer.tagline': 'Bessere Beziehungen zwischen Hunden und ihren Menschen durch gemeinschaftsbasiertes Training.',
    'footer.quickLinks': 'Schnellzugriff',
    'footer.about': 'Über uns',
    'footer.contact': 'Kontakt',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.community': 'Community',
    'footer.activities': 'Aktivitäten',
    'footer.support': 'Support',
    'footer.help': 'Hilfe',
    'footer.faq': 'FAQ',
    'footer.social': 'Social Media',
    'footer.rights': 'Alle Rechte vorbehalten.',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolgreich',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.like': 'Gefällt mir',
    'common.comment': 'Kommentar',
    'common.share': 'Teilen',
    'common.follow': 'Folgen',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.activities': 'Activities',
    'nav.community': 'Community',
    'nav.profile': 'My Profile',
    'nav.createActivity': 'Create Activity',
    
    // Community Page
    'community.title': 'Community',
    'community.whatsHappening': 'What\'s happening in the community?',
    'community.shareThoughts': 'Share your thoughts with the community...',
    'community.post': 'Post',
    'community.question': 'Question',
    'community.activity': 'Activity',
    'community.trending': 'Trending Topics',
    'community.suggested': 'Suggested Users',
    'community.events': 'Upcoming Events',
    'community.stats': 'Your Stats',
    'community.activitiesCompleted': 'Activities Completed',
    'community.postsCreated': 'Posts Created',
    'community.likesReceived': 'Likes Received',
    
    // Create Activity Page
    'createActivity.title': 'Create New Activity',
    'createActivity.backToCommunity': 'Back to Community',
    'createActivity.activityTitle': 'Activity Title',
    'createActivity.titlePlaceholder': 'Give your activity a descriptive title...',
    'createActivity.description': 'Description',
    'createActivity.descriptionPlaceholder': 'Briefly describe what this activity is about...',
    'createActivity.content': 'Content',
    'createActivity.contentPlaceholder': 'Provide detailed instructions for the activity...',
    'createActivity.difficulty': 'Difficulty',
    'createActivity.beginner': 'Beginner',
    'createActivity.intermediate': 'Intermediate',
    'createActivity.advanced': 'Advanced',
    'createActivity.duration': 'Duration (minutes)',
    'createActivity.tags': 'Tags',
    'createActivity.tagsPlaceholder': 'Add tags (comma separated)...',
    'createActivity.submit': 'Create Activity',
    'createActivity.publishing': 'Publishing...',
    
    // Footer
    'footer.tagline': 'Building better relationships between dogs and their humans through community-driven training.',
    'footer.quickLinks': 'Quick Links',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.community': 'Community',
    'footer.activities': 'Activities',
    'footer.support': 'Support',
    'footer.help': 'Help',
    'footer.faq': 'FAQ',
    'footer.social': 'Social Media',
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.like': 'Like',
    'common.comment': 'Comment',
    'common.share': 'Share',
    'common.follow': 'Follow',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('de'); // Default to German

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}