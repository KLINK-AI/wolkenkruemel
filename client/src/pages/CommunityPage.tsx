import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import TrendingTopics from "@/components/community/TrendingTopics";
import SuggestedUsers from "@/components/community/SuggestedUsers";

import { Button } from "@/components/ui/button";
import { Bell, Menu, Instagram } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
// Logo will be displayed using SVG for now until PNG asset is properly configured

// Mock user data - in real app this would come from auth context
const mockUser = {
  id: 1,
  name: "Sarah M.",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616c6d5e37c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  activitiesCompleted: 12,
  postsCreated: 3,
  likesReceived: 24
};

export default function CommunityPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background dark:bg-background shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <img 
                    src="/wolkenkruemel.png" 
                    alt="Wolkenkrümel Logo" 
                    className="h-8 w-8"
                  />
                  <span className="text-xl font-bold text-foreground">Wolkenkrümel</span>
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`text-foreground hover:text-primary transition-colors ${location === '/' ? 'text-primary font-medium border-b-2 border-primary' : ''}`}
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/activities" 
                className={`text-foreground hover:text-primary transition-colors ${location === '/activities' ? 'text-primary font-medium border-b-2 border-primary' : ''}`}
              >
                {t('nav.activities')}
              </Link>
              <Link 
                href="/community" 
                className={`text-foreground hover:text-primary transition-colors ${location === '/community' ? 'text-primary font-medium border-b-2 border-primary' : ''}`}
              >
                {t('nav.community')}
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <LanguageToggle />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User Avatar */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <img className="w-8 h-8 rounded-full" src={mockUser.avatar} alt="User Avatar" />
                  <span className="text-sm font-medium text-foreground">{mockUser.name}</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <CommunitySidebar user={mockUser} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <CommunityFeed />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <TrendingTopics />
            <SuggestedUsers currentUserId={mockUser.id} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background dark:bg-background border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/Wolkenkruemel.png" 
                  alt="Wolkenkrümel Logo" 
                  className="h-8 w-auto mr-2"
                />
              </div>
              <p className="text-sm text-muted-foreground">Building better relationships between dogs and their humans through community-driven training.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.community')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/community" className="hover:text-primary transition-colors">{t('footer.feed')}</Link></li>
                <li><Link href="/community" className="hover:text-primary transition-colors">{t('footer.forum')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.help')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.connect')}</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/wolkenkruemel.tgi/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 Wolkenkrümel. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
