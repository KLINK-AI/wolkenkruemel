import { Link, useLocation } from "wouter";
import { Heart, User, Settings, Moon, Sun } from "lucide-react";
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

  const navItems = [
    { path: "/activities", label: "Aktivitäten" },
    { path: "/favoriten", label: "Favoriten", icon: Heart },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="app-header sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="logo-round w-10 h-10 flex-shrink-0">
              <LogoFallback />
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
                  <span className="hidden sm:block">Steve</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Einstellungen</DropdownMenuItem>
                <DropdownMenuItem>Abmelden</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}