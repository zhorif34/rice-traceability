import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package } from "lucide-react";
import api from "@/services/api";

const CollectorDashboard = () => {
  const [form, setForm] = useState({ prevBatchId: "", consignmentNo: "", gkgVolume: "", farmerOrigin: "", dispatchDate: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/collector/batch", {
        prev_batch_id: form.prevBatchId, nomor_pengiriman: form.consignmentNo,
        volume_gkg_diterima_kg: form.gkgVolume, asal_petani_lokasi: form.farmerOrigin,
        tanggal_pengiriman: form.dispatchDate,
      });
      toast.success(`Batch ID: ${res.data.batchId}`, { description: "Data pengepul berhasil dicatat." });
      setForm({ prevBatchId: "", consignmentNo: "", gkgVolume: "", farmerOrigin: "", dispatchDate: "" });
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor Pengepul" entityLabel="Pengepul">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Data Penerimaan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>ID Batch dari Petani</Label><Input placeholder="cth. FARMER_..." value={form.prevBatchId} onChange={e => setForm({ ...form, prevBatchId: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nomor Pengiriman</Label><Input placeholder="cth. COL-001" value={form.consignmentNo} onChange={e => setForm({ ...form, consignmentNo: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume GKG Diterima (kg)</Label><Input type="number" value={form.gkgVolume} onChange={e => setForm({ ...form, gkgVolume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Asal / Lokasi Petani</Label><Input value={form.farmerOrigin} onChange={e => setForm({ ...form, farmerOrigin: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Pengiriman</Label><Input type="date" value={form.dispatchDate} onChange={e => setForm({ ...form, dispatchDate: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memproses..." : "Kirim Data"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default CollectorDashboard;
