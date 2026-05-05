import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      const role = user?.role;
      localStorage.setItem("ambapari_user", JSON.stringify({ token, ...user }));
      toast.success("Login berhasil!");
      navigate(`/dashboard/${role}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login gagal. Periksa kredensial Anda.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src="/images/hero-rice.jpg" alt="Sawah padi" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Selamat Datang Kembali</h2>
            <p className="text-white text-lg max-w-md">Akses dasbor Anda dan kelola data rantai pasok dengan aman.</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <img src="/images/logo-ambapari.png" alt="Ambapari" className="h-8 w-8 object-contain" /><span className="font-display text-2xl font-bold text-foreground">Ambapari</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Masuk ke akun Anda</h1>
            <p className="text-muted-foreground mt-2">Masukkan kredensial untuk mengakses platform</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="email@anda.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Kata Sandi</Label>
              <div className="relative"><Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">Belum punya akun? <Link to="/register" className="text-primary font-medium hover:underline">Daftar di sini</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;
