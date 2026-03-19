import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Study from "@/pages/study";
import Stats from "@/pages/stats";
import Landing from "@/pages/landing";
import Profile from "@/pages/profile";
import Header from "@/components/layout/header";
import NavigationTabs from "@/components/layout/navigation-tabs";
import Footer from "@/components/layout/footer";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

function Router() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={() => {
            setActiveTab("Dashboard");
            return <Dashboard />;
          }} />
          <Route path="/habits" component={() => {
            setActiveTab("Habits");
            return <Habits />;
          }} />
          <Route path="/study" component={() => {
            setActiveTab("Study");
            return <Study />;
          }} />
          <Route path="/stats" component={() => {
            setActiveTab("Stats");
            return <Stats />;
          }} />
          <Route path="/profile" component={() => {
            setActiveTab("Profile");
            return <Profile />;
          }} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
