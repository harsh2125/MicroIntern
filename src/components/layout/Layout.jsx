import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main layout wrapper — wraps every page
 * All pages render inside the <main> between Navbar and Footer
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      {/* pt-16 = navbar height offset */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;