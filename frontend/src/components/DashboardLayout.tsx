import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";

interface DashboardLayoutProps { title: string; entityLabel: string; children: React.ReactNode; }

const DashboardLayout = ({ title, entityLabel, children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem("ambapari_user"); navigate("/login"); };

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="bg-white border-b border-border shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2"><img src="/images/logo-ambapari.png" alt="Ambapari" className="h-8 w-8 object-contain" /><span className="font-display text-xl font-bold text-foreground">Ambapari</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Masuk sebagai <span className="font-semibold text-primary">{entityLabel}</span></span>
            <Button variant="ghost" size="sm" asChild><Link to="/"><Home className="w-4 h-4 mr-1" />Beranda</Link></Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />Keluar</Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;
