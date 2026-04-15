import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const entities = [
  { value: "petani", label: "Petani" },
  { value: "pengepul", label: "Pengepul" },
  { value: "rmu", label: "RMU (Penggilingan Padi)" },
  { value: "distributor", label: "Distributor" },
  { value: "bulog", label: "Bulog" },
  { value: "retailer", label: "Pengecer" },
];

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", entity: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Kata sandi tidak cocok."); return; }
    if (!form.entity) { toast.error("Pilih jenis entitas."); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", { email: form.email, password: form.password, role: form.entity, entityName: form.name });
      toast.success("Akun berhasil dibuat! Silakan masuk.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registrasi gagal.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src="/images/hero-rice.jpg" alt="Sawah padi" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="font-display text-4xl font-bold text-background mb-4">Gabung Jaringan</h2>
            <p className="text-background/70 text-lg max-w-md">Daftar sebagai pemangku kepentingan dan mulai melacak beras.</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8"><img src="/images/logo-ambapari.png" alt="Ambapari" className="h-8 w-8 object-contain" /><span className="font-display text-2xl font-bold text-foreground">Ambapari</span></Link>
            <h1 className="text-2xl font-bold text-foreground">Buat akun Anda</h1>
            <p className="text-muted-foreground mt-2">Bergabung sebagai pemangku kepentingan rantai pasok</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Nama Lengkap / Perusahaan</Label><Input id="name" placeholder="Nama atau perusahaan Anda" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="reg-email">Email</Label><Input id="reg-email" type="email" placeholder="email@anda.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Jenis Entitas</Label><Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v })}><SelectTrigger><SelectValue placeholder="Pilih peran Anda" /></SelectTrigger><SelectContent>{entities.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="reg-pass">Kata Sandi</Label><div className="relative"><Input id="reg-pass" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            <div className="space-y-2"><Label htmlFor="confirm">Konfirmasi Kata Sandi</Label><Input id="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Memproses..." : "Buat Akun"}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">Sudah punya akun? <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Register;
