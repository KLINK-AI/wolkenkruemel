// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isEmailVerified: boolean;
  role: UserRole;
  createdAt: string;
  agreedToTerms: boolean;
  agreedToNewsletter: boolean;
  favorites: string[];
}

export type UserRole = 'free' | 'premium' | 'admin';

// Activity types
export interface Activity {
  id: string;
  title: string;
  description: string;
  tips: string[];
  troubleshooting: string[];
  variations: string[];
  type: ActivityType;
  experienceLevel: ExperienceLevel[];
  duration: Duration;
  location: Location[];
  engagementType: EngagementType[];
  requiresMaterials: boolean;
  materials?: string[];
  premiumOnly: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ActivityType = 'training' | 'exercise' | 'game';
export type ExperienceLevel = 'puppy' | 'beginner' | 'advanced' | 'professional';
export type Duration = 5 | 10 | 15 | 30;
export type Location = 'indoor' | 'outdoor';
export type EngagementType = 'physical' | 'cognitive';

// Filter types
export interface ActivityFilter {
  type?: ActivityType;
  experienceLevel?: ExperienceLevel;
  duration?: Duration;
  location?: Location;
  engagementType?: EngagementType[];
  requiresMaterials?: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName?: string;
  agreedToTerms: boolean;
  agreedToNewsletter: boolean;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  priceId: string;
}