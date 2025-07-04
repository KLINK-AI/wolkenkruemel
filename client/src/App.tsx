import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CommunityPage from "@/pages/CommunityPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ActivityDetailPage from "@/pages/ActivityDetailPage";
import CreateActivityPage from "@/pages/CreateActivityPage";
import EditActivityPage from "@/pages/EditActivityPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/aktivitäten" component={ActivitiesPage} />
        <Route path="/activities/:id" component={ActivityDetailPage} />
        <Route path="/activities/:id/edit" component={EditActivityPage} />
        <Route path="/aktivitäten/:id" component={ActivityDetailPage} />
        <Route path="/create-activity" component={CreateActivityPage} />
        <Route path="/create" component={CreateActivityPage} />
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
