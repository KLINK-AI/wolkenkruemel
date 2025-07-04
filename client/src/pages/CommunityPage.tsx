import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import TrendingTopics from "@/components/community/TrendingTopics";
import SuggestedUsers from "@/components/community/SuggestedUsers";

// Mock user data - in real app this would come from auth context
const mockUser = {
  id: 1,
  name: "Steve",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200",
  activitiesCompleted: 12,
  postsCreated: 3,
  likesReceived: 24
};

export default function CommunityPage() {
  return (
    <div className="bg-background min-h-screen">
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
    </div>
  );
}