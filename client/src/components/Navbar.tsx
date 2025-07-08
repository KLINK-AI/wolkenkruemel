import { Link, useLocation } from "wouter";
import { Home, User, Settings, Moon, Sun, Users, Calendar, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
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
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/activities", label: t('nav.activities'), icon: Calendar },
    { path: "/community", label: t('nav.community'), icon: Users },
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
              <img 
                src="/Wolkenkruemel.png" 
                alt="Wolkenkrümel Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Logo konnte nicht geladen werden:', e);
                  // Fallback SVG wenn das originale Logo nicht lädt
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='%2360a5fa'%3E%3Ccircle cx='25' cy='30' r='8'/%3E%3Ccircle cx='75' cy='30' r='8'/%3E%3Ccircle cx='50' cy='25' r='12'/%3E%3C/g%3E%3Cg fill='%23f59e0b'%3E%3Cellipse cx='50' cy='70' rx='18' ry='10'/%3E%3C/g%3E%3C/svg%3E";
                }}
              />
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
            {currentUser && currentUser.role === "admin" && (
              <Link 
                href={adminNavItem.path}
                className={location === adminNavItem.path ? 'nav-link-active px-3 py-2 rounded-md flex items-center space-x-2' : 'nav-link px-3 py-2 rounded-md flex items-center space-x-2'}
              >
                <Settings className="w-4 h-4" />
                <span>{adminNavItem.label}</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center space-x-2">
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

            {/* Authentication */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{currentUser.displayName || currentUser.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link href="/admin/users">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin-Bereich
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">
                    Anmelden
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm border-t">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location === item.path 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Admin Link for mobile */}
            {currentUser && currentUser.role === "admin" && (
              <Link 
                href={adminNavItem.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  location === adminNavItem.path 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                } block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3`}
              >
                <Settings className="w-5 h-5" />
                <span>{adminNavItem.label}</span>
              </Link>
            )}

            {/* Mobile Controls */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="px-3 py-2">
                <LanguageToggle />
              </div>

              {/* Mobile User Menu */}
              {currentUser ? (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-3 text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted">
                      <User className="w-5 h-5" />
                      <span>Profil</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="flex items-center space-x-3 text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-muted w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Abmelden</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Anmelden
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}