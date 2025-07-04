import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CommunityFeed from "@/components/community/CommunityFeed";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import TrendingTopics from "@/components/community/TrendingTopics";
import SuggestedUsers from "@/components/community/SuggestedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function CommunityPage() {
  // Check if user is authenticated
  const { currentUser } = useAuth();

  // If user is not authenticated, show login prompt
  if (!currentUser) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Community-Zugang</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Der Community-Bereich ist nur für registrierte Benutzer verfügbar. 
              Melden Sie sich an oder registrieren Sie sich, um mit anderen Hundebesitzern zu interagieren.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>Anmelden</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Registrieren</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <CommunitySidebar user={{
              id: currentUser.id,
              name: currentUser.displayName || currentUser.username,
              avatar: currentUser.avatarUrl || "",
              activitiesCompleted: currentUser.activitiesCreated || 0,
              postsCreated: currentUser.postsCreated || 0,
              likesReceived: currentUser.likesReceived || 0
            }} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <CommunityFeed />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <TrendingTopics />
            <SuggestedUsers currentUserId={currentUser.id} />
          </div>
        </div>
      </main>
    </div>
  );
}