import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBottomNav?: boolean;
  className?: string;
}

const AppLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showBottomNav = false,
  className = "" 
}: AppLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showHeader && <Header />}
      <main className={showBottomNav ? "pb-20 lg:pb-0" : ""}>
        {children}
      </main>
      {showFooter && <div className="hidden lg:block"><Footer /></div>}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
