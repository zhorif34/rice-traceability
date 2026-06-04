import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { reportPublicApi } from "@/services/api";

const jenisAduan = [
  "Dugaan Beras Oplosan",
  "Manipulasi Data",
  "Kerusakan Kemasan",
  "Kualitas Tidak Sesuai",
  "Pemalsuan Label",
  "Pelanggaran Distribusi",
  "Ketidaksesuaian SNI",
  "Lainnya",
];

const ConsumerReportSection = () => {
  const [form, setForm] = useState({
    nama: "", email: "", batchId: "", jenis: "", entitas: "", lokasi: "", tanggal: "", deskripsi: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.jenis || !form.deskripsi) {
      toast.error("Mohon lengkapi field wajib.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await reportPublicApi.create({
        nama: form.nama,
        email: form.email,
        batchId: form.batchId,
        jenis: form.jenis,
        entitas: form.entitas,
        lokasi: form.lokasi,
        tanggal: form.tanggal,
        deskripsi: form.deskripsi,
      });
      toast.success(`Aduan ${result.reportId} berhasil dikirim. Terima kasih atas laporannya.`);
      setForm({ nama: "", email: "", batchId: "", jenis: "", entitas: "", lokasi: "", tanggal: "", deskripsi: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal mengirim aduan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="aduan" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-1.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-destructive text-sm font-medium">ADUAN</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Laporkan Kejanggalan Beras
            </h2>
            <p className="text-muted-foreground text-lg">
              Sampaikan aduan langsung dari sini. Setiap laporan tercatat secara aman dan transparan.
            </p>
          </div>
          <Card className="backdrop-blur bg-card/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Form Pengaduan
              </CardTitle>
              <CardDescription>Isi data berikut untuk mengirimkan aduan Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Pelapor *</Label>
                    <Input placeholder="Nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch ID Bermasalah</Label>
                    <Input placeholder="cth. FARM-M1A2B3C" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Aduan *</Label>
                    <Select value={form.jenis} onValueChange={v => setForm({ ...form, jenis: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                      <SelectContent>
                        {jenisAduan.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Entitas Pelapor *</Label>
                    <Select value={form.entitas} onValueChange={v => setForm({ ...form, entitas: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih entitas" /></SelectTrigger>
                      <SelectContent>
                        {["Petani", "Pengepul", "RMU", "Distributor", "BULOG", "Retailer", "Konsumen"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Lokasi Kejadian</Label>
                    <Input placeholder="cth. Pasar Induk Cipinang" value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Pelaporan</Label>
                    <Input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi Aduan *</Label>
                  <Textarea rows={4} placeholder="Jelaskan kejanggalan secara detail..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-green-600 hover:opacity-90 shadow-lg shadow-primary/30" disabled={submitting}>
                  <ShieldCheck className="w-4 h-4 mr-2" /> {submitting ? "Mengirim..." : "Kirim Aduan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ConsumerReportSection;
