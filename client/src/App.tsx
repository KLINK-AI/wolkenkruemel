import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CommunityPage from "@/pages/CommunityPage";
import CommunityNetworkPage from "@/pages/CommunityNetworkPage";
import CommunityQAPage from "@/pages/CommunityQAPage";
import CreatePostPage from "@/pages/CreatePostPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ActivityDetailPage from "@/pages/ActivityDetailPage";
import CreateActivityPage from "@/pages/CreateActivityPage";
import EditActivityPage from "@/pages/EditActivityPage";
import AdminActivitiesPage from "@/pages/AdminActivitiesPage";
import ProfilePage from "@/pages/ProfilePage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscribePage from "@/pages/SubscribePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/community/network" component={CommunityNetworkPage} />
        <Route path="/community/qa" component={CommunityQAPage} />
        <Route path="/community/create-post" component={CreatePostPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/aktivitäten" component={ActivitiesPage} />
        <Route path="/activities/create" component={CreateActivityPage} />
        <Route path="/aktivitäten/create" component={CreateActivityPage} />
        <Route path="/activities/:id" component={ActivityDetailPage} />
        <Route path="/activities/:id/edit" component={EditActivityPage} />
        <Route path="/activities/admin" component={AdminActivitiesPage} />
        <Route path="/aktivitäten/:id" component={ActivityDetailPage} />
        <Route path="/create-activity" component={CreateActivityPage} />
        <Route path="/create" component={CreateActivityPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/profil" component={ProfilePage} />
        <Route path="/subscription" component={SubscriptionPage} />
        <Route path="/abonnement" component={SubscriptionPage} />
        <Route path="/premium" component={SubscriptionPage} />
        <Route path="/subscribe" component={SubscribePage} />
        <Route path="/upgrade" component={SubscribePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/registrieren" component={RegisterPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" storageKey="wolkenkruemel-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
