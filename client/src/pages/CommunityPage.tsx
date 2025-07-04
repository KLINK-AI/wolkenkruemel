import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import TrendingTopics from "@/components/community/TrendingTopics";
import SuggestedUsers from "@/components/community/SuggestedUsers";
import UpcomingEvents from "@/components/community/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

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
    <div className="bg-light-gray min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-10 w-10 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Wolke/Cloud */}
                  <path d="M36 20c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 1.5.3 2.9.8 4.2C10.5 25.1 9 27.4 9 30c0 3.3 2.7 6 6 6h21c4.4 0 8-3.6 8-8 0-3.8-2.7-7-6.3-7.7-.4-2.8-1.5-5.4-3.1-7.6z" fill="#87CEEB" stroke="#4A90E2" strokeWidth="1.5"/>
                  {/* Hund/Dog silhouette */}
                  <path d="M20 28c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-2z" fill="#8B4513"/>
                  <circle cx="21" cy="25" r="1" fill="#8B4513"/>
                  <circle cx="27" cy="25" r="1" fill="#8B4513"/>
                  <path d="M19 22c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v1c0 .6-.4 1-1 1h-8c-.6 0-1-.4-1-1v-1z" fill="#8B4513"/>
                  <circle cx="18" cy="21" r="1.5" fill="#8B4513"/>
                  <circle cx="30" cy="21" r="1.5" fill="#8B4513"/>
                  {/* Kleine Wolken-Krümel */}
                  <circle cx="12" cy="18" r="2" fill="#B0E0E6" opacity="0.7"/>
                  <circle cx="38" cy="22" r="1.5" fill="#B0E0E6" opacity="0.7"/>
                  <circle cx="16" cy="35" r="1.5" fill="#B0E0E6" opacity="0.7"/>
                </svg>
                <span className="text-xl font-bold text-blue-600">Wolkenkruemel</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Activities</a>
              <a href="#" className="text-primary font-medium border-b-2 border-primary">Community</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">My Profile</a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User Avatar */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <img className="w-8 h-8 rounded-full" src={mockUser.avatar} alt="User Avatar" />
                  <span className="text-sm font-medium text-gray-700">{mockUser.name}</span>
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-bold text-neutral">Wolkenkruemel</span>
              </div>
              <p className="text-sm text-gray-600">Building better relationships between dogs and their humans through community-driven training.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Feed</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Q&A Forum</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-600">© 2024 Wolkenkruemel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
