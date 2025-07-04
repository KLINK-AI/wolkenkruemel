import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import TrendingTopics from "@/components/community/TrendingTopics";
import SuggestedUsers from "@/components/community/SuggestedUsers";
import UpcomingEvents from "@/components/community/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
// Logo will be inline SVG

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

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background dark:bg-background shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <svg className="h-12 w-auto mr-2" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Große Wolken im Hintergrund */}
                    <ellipse cx="60" cy="25" rx="35" ry="20" fill="#87CEEB" opacity="0.8"/>
                    <ellipse cx="80" cy="30" rx="25" ry="15" fill="#B0E0E6" opacity="0.7"/>
                    <ellipse cx="40" cy="35" rx="20" ry="12" fill="#ADD8E6" opacity="0.6"/>
                    <ellipse cx="120" cy="20" rx="30" ry="18" fill="#87CEEB" opacity="0.7"/>
                    <ellipse cx="140" cy="30" rx="20" ry="12" fill="#B0E0E6" opacity="0.6"/>
                    
                    {/* Kleine Wolken-Krümel */}
                    <circle cx="30" cy="50" r="8" fill="#B0E0E6" opacity="0.5"/>
                    <circle cx="160" cy="45" r="6" fill="#ADD8E6" opacity="0.6"/>
                    <circle cx="20" cy="70" r="5" fill="#87CEEB" opacity="0.4"/>
                    
                    {/* Springender Hund (weiß/hell) */}
                    <path d="M50 70 Q45 65 40 70 Q35 75 30 70 Q25 75 20 80 Q25 85 35 85 Q45 85 55 80 Q60 75 55 70 Q50 65 45 70" fill="#F5F5F5" stroke="#333" strokeWidth="2"/>
                    <circle cx="45" cy="72" r="2" fill="#333"/>
                    <path d="M42 75 Q45 77 48 75" stroke="#333" strokeWidth="1.5" fill="none"/>
                    <path d="M35 68 Q30 65 25 68" stroke="#333" strokeWidth="2" fill="none"/>
                    <path d="M55 68 Q60 65 65 68" stroke="#333" strokeWidth="2" fill="none"/>
                    <path d="M25 80 Q20 85 15 80" stroke="#333" strokeWidth="2" fill="none"/>
                    
                    {/* Sitzender Hund (dunkel) */}
                    <ellipse cx="130" cy="85" rx="15" ry="20" fill="#2D2D2D"/>
                    <circle cx="125" cy="75" r="8" fill="#2D2D2D"/>
                    <ellipse cx="120" cy="73" rx="4" ry="6" fill="#2D2D2D"/>
                    <ellipse cx="135" cy="73" rx="4" ry="6" fill="#2D2D2D"/>
                    <circle cx="122" cy="72" r="1" fill="white"/>
                    <circle cx="133" cy="72" r="1" fill="white"/>
                    <path d="M127 75 Q130 77 133 75" stroke="white" strokeWidth="1" fill="none"/>
                    <ellipse cx="140" cy="100" rx="5" ry="8" fill="#2D2D2D"/>
                    
                    {/* Schriftzug */}
                    <text x="100" y="125" fontFamily="'Comic Sans MS', cursive" fontSize="18" fill="#4A90A4" textAnchor="middle" fontWeight="bold">
                      Wolkenkrümel
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Activities</a>
              <a href="#" className="text-primary font-medium border-b-2 border-primary">Community</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">My Profile</a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
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
            <UpcomingEvents />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background dark:bg-background border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-bold text-foreground">Wolkenkruemel</span>
              </div>
              <p className="text-sm text-muted-foreground">Building better relationships between dogs and their humans through community-driven training.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Feed</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Q&A Forum</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Wolkenkruemel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
