import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import NotFound from "@/pages/not-found";
import CommunityPage from "@/pages/CommunityPage";
import CreateActivityPage from "@/pages/CreateActivityPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CommunityPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/create-activity" component={CreateActivityPage} />
      <Route component={NotFound} />
    </Switch>
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
