import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [{ to: "/", label: "Beranda" }, { to: "/traceability", label: "Telusuri" }];
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo-ambapari.png" alt="Ambapari" className="h-8 w-8 object-contain" /><span className="font-display text-xl font-bold text-foreground">Ambapari</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors hover:text-primary ${isActive(l.to) ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>)}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Masuk</Link></Button>
            <Button size="sm" asChild><Link to="/register">Daftar</Link></Button>
          </div>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      {open && (
        <div className="md:hidden glass border-t border-border px-4 pb-4 space-y-3">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`block py-2 text-sm font-medium ${isActive(l.to) ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>)}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" asChild><Link to="/login" onClick={() => setOpen(false)}>Masuk</Link></Button>
            <Button size="sm" asChild><Link to="/register" onClick={() => setOpen(false)}>Daftar</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
