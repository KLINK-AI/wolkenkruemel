import { Link, useLocation } from "wouter";
import { Home, User, Settings, Moon, Sun, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
// SVG Logo as fallback when PNG not available
const LogoFallback = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="w-full h-full">
    <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
    <text x="20" y="26" textAnchor="middle" fontSize="16" fill="currentColor" fontWeight="bold">W</text>
  </svg>
);

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  // Mock user for demo - In production, get this from auth context
  const currentUser = { role: "admin", username: "Steve" };
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/activities", label: "Aktivitäten", icon: Calendar },
    { path: "/community", label: "Community", icon: Users },
  ];
  
  // Admin nav item - only show for admin role
  const adminNavItem = { path: "/admin", label: "Admin", icon: Settings };

  return (
    <header className="app-header sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 flex-shrink-0">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wolken (Clouds) */}
                <g fill="#60a5fa" opacity="0.8">
                  <circle cx="25" cy="30" r="8"/>
                  <circle cx="75" cy="30" r="8"/>
                  <circle cx="50" cy="25" r="12"/>
                  <path d="M15 50c0-5 5-10 15-8 5 1 10-2 20 0s15-1 20 0 15-5 20 0c3 3 2 8-2 10-8 4-16 2-25 2s-17 2-25-2c-4-2-5-7-2-10z"/>
                </g>
                
                {/* Hund (Dog) */}
                <g fill="#f59e0b">
                  <ellipse cx="50" cy="70" rx="18" ry="10"/>
                  <circle cx="42" cy="75" r="3"/>
                  <circle cx="58" cy="75" r="3"/>
                  <path d="M35 80c3 4 8 6 15 6s12-2 15-6" stroke="#d97706" strokeWidth="2" fill="none"/>
                  {/* Ohren */}
                  <ellipse cx="35" cy="65" rx="4" ry="8" transform="rotate(-20 35 65)"/>
                  <ellipse cx="65" cy="65" rx="4" ry="8" transform="rotate(20 65 65)"/>
                </g>
                
                {/* Schwanz */}
                <path d="M68 75 Q80 70 75 60" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xl font-semibold hidden sm:block">
              Wolkenkrümel
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={location === item.path ? 'nav-link-active px-3 py-2 rounded-md flex items-center space-x-2' : 'nav-link px-3 py-2 rounded-md flex items-center space-x-2'}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Admin Link - only visible for admin users */}
            {currentUser.role === "admin" && (
              <Link 
                href={adminNavItem.path}
                className={location === adminNavItem.path ? 'nav-link-active px-3 py-2 rounded-md flex items-center space-x-2' : 'nav-link px-3 py-2 rounded-md flex items-center space-x-2'}
              >
                <Settings className="w-4 h-4" />
                <span>{adminNavItem.label}</span>
              </Link>
            )}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Language Toggle */}
            <LanguageToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{currentUser.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}