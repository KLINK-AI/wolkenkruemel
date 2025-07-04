import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-primary-500 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
 <Header />
 <main className="container-custom">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;