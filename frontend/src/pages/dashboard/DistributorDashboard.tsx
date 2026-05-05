import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BatchHistoryCard from "@/components/BatchHistoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import api from "@/services/api";
import { useBatchHistory } from "@/hooks/useBatchHistory";

const DistributorDashboard = () => {
  const [form, setForm] = useState({ prevBatchId: "", poNumber: "", riceVolume: "", destination: "", dispatchDate: "" });
  const [loading, setLoading] = useState(false);
  const { batches, addBatch } = useBatchHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/distributor/batch", {
        prev_batch_id: form.prevBatchId, nomor_po: form.poNumber,
        volume_beras_dikirim_karung: form.riceVolume, tujuan_pengiriman: form.destination,
        tanggal_pengiriman: form.dispatchDate,
      });
      const batchId = res.data.batchId;
      addBatch({
        batchId,
        entity: "distributor",
        summary: `PO ${form.poNumber || "-"} • ${form.riceVolume || "0"} karung • ${form.destination || "-"}`,
        details: { ...form },
      });
      toast.success(`Batch ID: ${batchId}`, { description: "Data distributor dicatat." });
      if (res.data.qrCode) { const w = window.open('', '_blank'); if (w) { w.document.write(`<img src="${res.data.qrCode}" />`); w.document.title = "QR Code"; } }
      setForm({ prevBatchId: "", poNumber: "", riceVolume: "", destination: "", dispatchDate: "" });
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor Distributor" entityLabel="Distributor">
      <div className="space-y-6">
        <BatchHistoryCard batches={batches} entityLabel="Distributor" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card><CardHeader><CardTitle>Batch ID dari RMU</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>ID Batch RMU</Label><Input value={form.prevBatchId} onChange={e => setForm({ ...form, prevBatchId: e.target.value })} required /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Data Pengiriman</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nomor PO</Label><Input value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume Dikirim (karung)</Label><Input type="number" value={form.riceVolume} onChange={e => setForm({ ...form, riceVolume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tujuan</Label><Select value={form.destination} onValueChange={v => setForm({ ...form, destination: v })}><SelectTrigger><SelectValue placeholder="Pilih tujuan" /></SelectTrigger><SelectContent><SelectItem value="bulog">Bulog</SelectItem><SelectItem value="retailer">Pengecer</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Tanggal Pengiriman</Label><Input type="date" value={form.dispatchDate} onChange={e => setForm({ ...form, dispatchDate: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memproses..." : "Kirim & Buat QR"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default DistributorDashboard;
