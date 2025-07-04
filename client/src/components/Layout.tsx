import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-background">
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}