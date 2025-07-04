import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X, Sun, Moon, ChevronDown, LogOut, Heart, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenus();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30' 
        : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-200 dark:hover:text-primary-300 dark:hover:bg-primary-900/20'
    }`;

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50" style={{ '--header-height': '80px' }}>
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenus}>
            <img 
              src="https://klink-ai.com/Wolkenkruemel_Logo.jpg" 
              alt="Wolkenkrümel Logo" 
              className="h-8 w-8 rounded-full"
            />
            <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
              Wolkenkrümel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <NavLink to="/activities" className={navLinkClass} onClick={closeMenus}>
                  Aktivitäten
                </NavLink>
                <NavLink to="/favorites" className={navLinkClass} onClick={closeMenus}>
                  <div className="flex items-center gap-1">
                    <Heart size={16} />
                    <span>Favoriten</span>
                  </div>
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={navLinkClass} onClick={closeMenus}>
                    <div className="flex items-center gap-1">
                      <Settings size={16} />
                      <span>Admin</span>
                    </div>
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={closeMenus}>
                  Anmelden
                </NavLink>
                <NavLink to="/register" className={navLinkClass} onClick={closeMenus}>
                  Registrieren
                </NavLink>
              </>
            )}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Profile dropdown for authenticated users on desktop */}
            {user && (
              <div className="hidden md:block relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-200 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
                >
                  <span className="font-medium">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-1 z-10 border dark:border-neutral-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-200 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                      onClick={closeMenus}
                    >
                      Profil
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-200 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                        onClick={closeMenus}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-200 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} />
                        <span>Abmelden</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t dark:border-neutral-700 pt-4 animate-slideDown">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">Angemeldet als</p>
                    <p className="font-medium text-primary-700 dark:text-primary-300">
                      {user.displayName || user.email}
                    </p>
                  </div>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMenus}>
                    Profil
                  </NavLink>
                  <NavLink to="/activities" className={navLinkClass} onClick={closeMenus}>
                    Aktivitäten
                  </NavLink>
                  <NavLink to="/favorites" className={navLinkClass} onClick={closeMenus}>
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>Favoriten</span>
                    </div>
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink to="/admin" className={navLinkClass} onClick={closeMenus}>
                      <div className="flex items-center gap-1">
                        <Settings size={16} />
                        <span>Admin</span>
                      </div>
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-200 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                  >
                    <LogOut size={16} />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={closeMenus}>
                    Anmelden
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass} onClick={closeMenus}>
                    Registrieren
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;