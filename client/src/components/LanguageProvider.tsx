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
    'community.feed': 'Feed',
    'community.network': 'Mein Netzwerk',
    'community.forum': 'Q&A Forum',
    
    // Create Activity Page
    'createActivity.title': 'Neue Trainingsaktivität erstellen',
    'createActivity.subtitle': 'Teile dein Hundeerziehungswissen mit der Community. Deine Aktivität wird vor der Veröffentlichung überprüft.',
    'createActivity.backToCommunity': 'Zurück zur Community',
    'createActivity.activityTitle': 'Aktivitätstitel',
    'createActivity.titleLabel': 'Aktivitätstitel',
    'createActivity.titlePlaceholder': 'z.B. Grundlegendes Sitz-Kommando Training',
    'createActivity.description': 'Kurze Beschreibung',
    'createActivity.descriptionLabel': 'Kurze Beschreibung',
    'createActivity.descriptionPlaceholder': 'Kurze Übersicht, was diese Aktivität lehrt...',
    'createActivity.descriptionHelp': 'Dies wird in Aktivitätsvorschauen und Suchergebnissen angezeigt.',
    'createActivity.descriptionHelper': 'Dies wird in Aktivitätsvorschauen und Suchergebnissen angezeigt.',
    'createActivity.imageLabel': 'Aktivitätsbild (Optional)',
    'createActivity.imageUpload': 'Lade ein Bild hoch, um deine Aktivität ansprechender zu gestalten',
    'createActivity.chooseImage': 'Bild auswählen',
    'createActivity.imageFormats': 'Unterstützte Formate: JPG, PNG, GIF. Max. Größe: 5MB',
    'createActivity.imageError': 'Bildgröße muss unter 5MB liegen',
    'createActivity.difficultyLevel': 'Schwierigkeitsgrad',
    'createActivity.selectDifficulty': 'Schwierigkeit wählen',
    'createActivity.beginner': 'Anfänger',
    'createActivity.intermediate': 'Fortgeschritten',
    'createActivity.advanced': 'Experte',
    'createActivity.duration': 'Dauer (Minuten)',
    'createActivity.tags': 'Tags',
    'createActivity.tagsPlaceholder': 'Tag hinzufügen...',
    'createActivity.tagsHelp': 'Tags helfen Nutzern, deine Aktivität zu finden. Drücke Enter oder klicke + zum Hinzufügen.',
    'createActivity.content': 'Aktivitätsinhalt',
    'createActivity.contentPlaceholder': 'Gib detaillierte Anweisungen für deine Trainingsaktivität...',
    'createActivity.contentHelp': 'Füge Schritt-für-Schritt-Anweisungen, Tipps und wichtige Hinweise hinzu.',
    'createActivity.cancel': 'Abbrechen',
    'createActivity.submit': 'Aktivität erstellen',
    'createActivity.creating': 'Erstelle...',
    'createActivity.successTitle': 'Aktivität erstellt',
    'createActivity.successMessage': 'Deine Trainingsaktivität wurde zur Überprüfung eingereicht.',
    'createActivity.errorTitle': 'Fehler',
    
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
    
    // Activity Detail Page
    'activityDetail.backToActivities': 'Zurück zu den Aktivitäten',
    'activityDetail.createdBy': 'Erstellt von',
    'activityDetail.difficulty': 'Schwierigkeit',
    'activityDetail.duration': 'Dauer',
    'activityDetail.minutes': 'Minuten',
    'activityDetail.likes': 'Likes',
    'activityDetail.completions': 'Abgeschlossen',
    'activityDetail.instructions': 'Anleitung',
    'activityDetail.progress': 'Fortschritt verfolgen',
    'activityDetail.tried': 'Ich habe diese Aktivität ausprobiert',
    'activityDetail.mastered': 'Mein Hund beherrscht diese Übung',
    'activityDetail.favorite': 'Diese Aktivität ist ein Favorit unserer Routine',
    'activityDetail.edit': 'Aktivität bearbeiten',
    'activityDetail.notFound': 'Aktivität nicht gefunden',
    'activityDetail.author': 'Autor',
    
    // User Profile
    'profile.title': 'Profil',
    'profile.edit': 'Profil bearbeiten',
    'profile.username': 'Benutzername',
    'profile.email': 'E-Mail',
    'profile.displayName': 'Anzeigename',
    'profile.bio': 'Biografie',
    'profile.bioPlaceholder': 'Erzähl uns etwas über dich und deinen Hund...',
    'profile.activitiesCreated': 'Aktivitäten erstellt',
    'profile.postsCreated': 'Beiträge erstellt',
    'profile.likesReceived': 'Likes erhalten',
    'profile.memberSince': 'Mitglied seit',
    'profile.updateProfile': 'Profil aktualisieren',
    'profile.updating': 'Aktualisiere...',
    'profile.updated': 'Profil erfolgreich aktualisiert',
    'profile.error': 'Fehler beim Aktualisieren des Profils',
    
    // Edit Activity
    'editActivity.title': 'Aktivität bearbeiten',
    'editActivity.backToActivity': 'Zurück zur Aktivität',
    'editActivity.update': 'Aktivität aktualisieren',
    'editActivity.updating': 'Aktualisiere...',
    'editActivity.updated': 'Aktivität erfolgreich aktualisiert',
    'editActivity.error': 'Fehler beim Aktualisieren der Aktivität',
    
    // Community Additional
    'community.trendingTopics': 'Beliebte Themen',
    'community.suggestedUsers': 'Vorgeschlagene Nutzer',
    
    // Create Post
    'createPost.title': 'Post erstellen',
    
    // Activity Creation Limits
    'activity.createLimits': 'Erstelle mind. 1 Aktivität. Max. 5 in der kostenlosen Version.',
    
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
    'common.back': 'Zurück',
    
    // Activities Page
    'activities.title': 'Trainingsaktivitäten',
    'activities.subtitle': 'Entdecke und teile Trainingsaktivitäten für deinen Hund',
    'activities.create': 'Neue Aktivität',
    'activities.createFirst': 'Erste Aktivität erstellen',
    'activities.noActivities': 'Keine Aktivitäten gefunden',
    'activities.noActivitiesDesc': 'Sei der erste, der eine Trainingsaktivität teilt!',
    'activities.minutes': 'Min',
    'activities.by': 'von',
    'activities.view': 'Ansehen',
    
    // Difficulty levels
    'difficulty.beginner': 'Anfänger',
    'difficulty.intermediate': 'Fortgeschritten',
    'difficulty.advanced': 'Experte',
    
    // Footer links
    'footer.feed': 'Feed',
    'footer.forum': 'Q&A Forum',
    'footer.connect': 'Verbinden',
    
    // Home Page
    'home.hero.title': 'Bessere Beziehungen zwischen dir und deinem Hund',
    'home.hero.subtitle': 'Entdecke gemeinschaftsbasierte Trainingsaktivitäten, teile deine Erfahrungen und baue eine stärkere Bindung zu deinem Hund auf.',
    'home.hero.exploreActivities': 'Aktivitäten entdecken',
    'home.hero.joinCommunity': 'Community beitreten',
    'home.features.title': 'Warum die Wolkenkrümel Plattform?',
    'home.features.training.title': 'Experten-Training',
    'home.features.training.description': 'Professionelle Trainingsaktivitäten von erfahrenen Hundetrainern und der Community.',
    'home.features.community.title': 'Community-Power',
    'home.features.community.description': 'Vernetze dich mit anderen Hundebesitzern und teile deine Erfahrungen.',

    'home.features.bonding.title': 'Stärkere Bindung',
    'home.features.bonding.description': 'Baue eine tiefere Verbindung zu deinem Hund durch gemeinsame Aktivitäten auf.',
    'home.cta.title': 'Bereit, deine erste Aktivität zu teilen?',
    'home.cta.subtitle': 'Hilf anderen Hundebesitzern mit deinen Erfahrungen und werde Teil unserer Community.',
    'home.cta.button': 'Erste Aktivität erstellen',
    
    // Time translations
    'time.now': 'Gerade eben',
    'time.hour': 'Stunde',
    'time.hours': 'Stunden',
    'time.day': 'Tag',
    'time.days': 'Tage',
    'time.ago': 'vor',
    
    // Post translations
    'posts.placeholder': 'Was beschäftigt dich heute mit deinem Hund?',
    'posts.shared': 'Beitrag geteilt',
    'posts.sharedDescription': 'Dein Beitrag wurde erfolgreich geteilt.',
    'posts.createTitle': 'Post erstellen',
    'post.types.general': 'Allgemein',
    'post.types.question': 'Frage',
    'post.types.success': 'Erfolgsgeschichte',
    
    // Premium translations
    'premium.unlock': 'Premium freischalten',
    'premium.unlockDescription': 'Erstelle unbegrenzt Aktivitäten und erhalte Zugang zu exklusiven Inhalten.',
    
    // Activity translations
    'activity.create': 'Aktivität erstellen',
    
    // Navigation translations
    'nav.feed': 'Feed',
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
    'community.shareThoughts': 'Share your thoughts and connect with the community',
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
    
    // Create Post
    'createPost.title': 'Create Post',
    
    // Activity Creation Limits
    'activity.createLimits': 'Create at least 1 activity. Max. 5 in the free version.',
    
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
    
    // Activities Page
    'activities.title': 'Training Activities',
    'activities.subtitle': 'Discover and share training activities for your dog',
    'activities.create': 'New Activity',
    'activities.createFirst': 'Create First Activity',
    'activities.noActivities': 'No activities found',
    'activities.noActivitiesDesc': 'Be the first to share a training activity!',
    'activities.minutes': 'min',
    'activities.by': 'by',
    'activities.view': 'View',
    
    // Difficulty levels
    'difficulty.beginner': 'Beginner',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.advanced': 'Advanced',
    
    // Footer links
    'footer.feed': 'Feed',
    'footer.forum': 'Q&A Forum',
    'footer.connect': 'Connect',
    
    // Home Page
    'home.hero.title': 'Better relationships between you and your dog',
    'home.hero.subtitle': 'Discover community-based training activities, share your experiences, and build a stronger bond with your dog.',
    'home.hero.exploreActivities': 'Explore Activities',
    'home.hero.joinCommunity': 'Join Community',
    'home.features.title': 'Why Wolkenkrümel?',
    'home.features.training.title': 'Expert Training',
    'home.features.training.description': 'Professional training activities from experienced dog trainers and the community.',
    'home.features.community.title': 'Community Power',
    'home.features.community.description': 'Connect with other dog owners and share your experiences.',
    'home.features.expert.title': 'Proven Methods',
    'home.features.expert.description': 'All activities are based on scientifically proven training methods.',
    'home.features.bonding.title': 'Stronger Bond',
    'home.features.bonding.description': 'Build a deeper connection with your dog through shared activities.',
    'home.cta.title': 'Ready to share your first activity?',
    'home.cta.subtitle': 'Help other dog owners with your experiences and become part of our community.',
    'home.cta.button': 'Create First Activity',
    
    // Time translations
    'time.now': 'Just now',
    'time.hour': 'hour',
    'time.hours': 'hours',
    'time.day': 'day',
    'time.days': 'days',
    'time.ago': 'ago',
    
    // Post translations
    'posts.placeholder': 'What\'s on your mind about your dog today?',
    'posts.shared': 'Post shared',
    'posts.sharedDescription': 'Your post has been shared successfully.',
    'posts.createTitle': 'Create Post',
    'post.types.general': 'General',
    'post.types.question': 'Question',
    'post.types.success': 'Success Story',
    
    // Premium translations
    'premium.unlock': 'Unlock Premium',
    'premium.unlockDescription': 'Create unlimited activities and get access to exclusive content.',
    
    // Activity translations
    'activity.create': 'Create Activity',
    
    // Navigation translations
    'nav.feed': 'Feed',
    
    // Community translations
    'community.feed': 'Feed',
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