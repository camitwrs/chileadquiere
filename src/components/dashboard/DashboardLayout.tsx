import { useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import FloatingActionButton from "./FloatingActionButton";
import FirstTimeUserTour from "@/components/FirstTimeUserTour";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <Breadcrumb />
        
        <main className="flex-1 bg-muted/30 dashboard">
          {children}
        </main>
      </div>

      <FloatingActionButton />
      {/* First-time user guided tour - shows automatically if not seen */}
      <FirstTimeUserTour />
    </div>
  );
}
