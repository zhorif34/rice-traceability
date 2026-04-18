import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Factory, Package, ShieldCheck } from "lucide-react";
import api from "@/services/api";

const RmuDashboard = () => {
  const [prevBatchId, setPrevBatchId] = useState("");
  const [recv, setRecv] = useState({ gkg: "", batch: "", moisture: "", visual: "", date: "", supplier: "" });
  const [pack, setPack] = useState({ type: "", weight: "", date: "", batchNo: "", sniCert: "" });
  const [sni, setSni] = useState({ sosoh: "", moisture: "", head: "", broken: "", menir: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/rmu/batch", {
        prev_batch_id: prevBatchId, volume_gkg_masuk_kg: recv.gkg, ...(recv.batch ? { nomor_batch_pengepul: recv.batch } : {}),
        kadar_air_masuk: recv.moisture, pemeriksaan_visual: recv.visual, tanggal_penerimaan: recv.date,
        supplier_id: recv.supplier, jenis_kemasan: pack.type, berat_netto: pack.weight,
        tanggal_pengemasan: pack.date, nomor_batch_beras: pack.batchNo, sertifikat_mutu_sni: pack.sniCert,
        kadar_air: sni.moisture, derajat_sosoh: sni.sosoh || undefined,
        butir_kepala: sni.head || undefined, butir_patah: sni.broken || undefined,
        butir_menir: sni.menir || undefined,
      });
      toast.success(`Batch ID: ${res.data.batchId}`, { description: "SNI tervalidasi!" });
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor RMU" entityLabel="Penggilingan Padi">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardHeader><CardTitle>Batch ID dari Petani/Pengepul</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>ID Batch (Petani atau Pengepul)</Label><Input placeholder="cth. FARMER_... atau COLLECTOR_..." value={prevBatchId} onChange={e => setPrevBatchId(e.target.value)} required /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Factory className="w-5 h-5 text-primary" />Data Penerimaan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Volume GKG Masuk (kg)</Label><Input type="number" value={recv.gkg} onChange={e => setRecv({ ...recv, gkg: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nomor Batch Pengepul</Label><Input placeholder="Opsional jika dari Petani langsung" value={recv.batch} onChange={e => setRecv({ ...recv, batch: e.target.value })} /></div>
            <div className="space-y-2"><Label>Kadar Air Masuk (%)</Label><Input type="number" step="0.1" value={recv.moisture} onChange={e => setRecv({ ...recv, moisture: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Inspeksi Visual</Label><Input value={recv.visual} onChange={e => setRecv({ ...recv, visual: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Penerimaan</Label><Input type="date" value={recv.date} onChange={e => setRecv({ ...recv, date: e.target.value })} required /></div>
            <div className="space-y-2"><Label>ID Pemasok</Label><Input value={recv.supplier} onChange={e => setRecv({ ...recv, supplier: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Data Pengemasan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Jenis Kemasan</Label><Input placeholder="cth. Karung" value={pack.type} onChange={e => setPack({ ...pack, type: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Berat Bersih (kg)</Label><Input type="number" value={pack.weight} onChange={e => setPack({ ...pack, weight: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Pengemasan</Label><Input type="date" value={pack.date} onChange={e => setPack({ ...pack, date: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nomor Batch Beras</Label><Input value={pack.batchNo} onChange={e => setPack({ ...pack, batchNo: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Sertifikat Mutu SNI</Label><Input value={pack.sniCert} onChange={e => setPack({ ...pack, sniCert: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card className="border-primary/30"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Standar Kualitas SNI</CardTitle>
          <CardDescription>Kadar air wajib. Parameter lain opsional tetapi harus memenuhi SNI jika diisi.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Kadar Air (%) *</Label><Input type="number" step="0.1" value={sni.moisture} onChange={e => setSni({ ...sni, moisture: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Derajat Sosoh (%)</Label><Input type="number" step="0.1" value={sni.sosoh} onChange={e => setSni({ ...sni, sosoh: e.target.value })} /></div>
            <div className="space-y-2"><Label>Butir Kepala (%)</Label><Input type="number" step="0.1" value={sni.head} onChange={e => setSni({ ...sni, head: e.target.value })} /></div>
            <div className="space-y-2"><Label>Butir Patah (%)</Label><Input type="number" step="0.1" value={sni.broken} onChange={e => setSni({ ...sni, broken: e.target.value })} /></div>
            <div className="space-y-2"><Label>Butir Menir (%)</Label><Input type="number" step="0.1" value={sni.menir} onChange={e => setSni({ ...sni, menir: e.target.value })} /></div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memproses..." : "Kirim & Validasi SNI"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default RmuDashboard;
