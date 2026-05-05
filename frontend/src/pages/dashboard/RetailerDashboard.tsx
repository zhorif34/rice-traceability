import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BatchHistoryCard from "@/components/BatchHistoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ShoppingBag, ClipboardCheck } from "lucide-react";
import api from "@/services/api";
import { useBatchHistory } from "@/hooks/useBatchHistory";

const RetailerDashboard = () => {
  const [prevBatchId, setPrevBatchId] = useState("");
  const [purchase, setPurchase] = useState({ invoice: "", volume: "", dateRecv: "", batchNo: "", price: "", dateSale: "" });
  const [checklist, setChecklist] = useState({ netWeight: false, halal: false, name: false, address: false, expiry: false });
  const [loading, setLoading] = useState(false);
  const { batches, refresh } = useBatchHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Object.values(checklist).every(Boolean)) { toast.error("Lengkapi semua checklist."); return; }
    setLoading(true);
    try {
      const res = await api.post("/retailer/batch", {
        prev_batch_id: prevBatchId, nomor_invoice: purchase.invoice,
        volume_dibeli_karung: purchase.volume, tanggal_terima: purchase.dateRecv,
        nomor_batch_beras: purchase.batchNo, harga_eceran: purchase.price,
        tanggal_penjualan: purchase.dateSale, keterangan_berat_bersih: String(checklist.netWeight),
        logo_halal: String(checklist.halal), keterangan_nama_alamat_produsen: String(checklist.name),
        tanggal_kadaluarsa: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      });
      const batchId = res.data.batchId;
      await refresh();
      toast.success(`Batch ID: ${batchId}`, { description: "QR Code dihasilkan!" });
      if (res.data.qrCode) { const w = window.open('', '_blank'); if (w) { w.document.write(`<img src="${res.data.qrCode}" />`); w.document.title = "QR Code"; } }
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor Pengecer" entityLabel="Pengecer">
      <div className="space-y-6">
        <BatchHistoryCard batches={batches} entityLabel="Pengecer" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card><CardHeader><CardTitle>Batch ID dari RMU/Distributor/Bulog</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>ID Batch (RMU, Distributor, atau Bulog)</Label><Input placeholder="cth. RMU_... / DISTRIBUTOR_... / BULOG_..." value={prevBatchId} onChange={e => setPrevBatchId(e.target.value)} required /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" />Data Pembelian & Penjualan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nomor Invoice</Label><Input value={purchase.invoice} onChange={e => setPurchase({ ...purchase, invoice: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume Dibeli (karung)</Label><Input type="number" value={purchase.volume} onChange={e => setPurchase({ ...purchase, volume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Diterima</Label><Input type="date" value={purchase.dateRecv} onChange={e => setPurchase({ ...purchase, dateRecv: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nomor Batch Beras</Label><Input value={purchase.batchNo} onChange={e => setPurchase({ ...purchase, batchNo: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Harga Eceran (Rp/kg)</Label><Input type="number" value={purchase.price} onChange={e => setPurchase({ ...purchase, price: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Penjualan</Label><Input type="date" value={purchase.dateSale} onChange={e => setPurchase({ ...purchase, dateSale: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card className="border-primary/30"><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" />Checklist Kemasan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[{ key: "netWeight", label: "Berat bersih tercantum" }, { key: "halal", label: "Logo halal tercantum" }, { key: "name", label: "Nama produsen tercantum" }, { key: "address", label: "Alamat produsen tercantum" }, { key: "expiry", label: "Tanggal kadaluarsa tercantum" }].map(item => (
              <div key={item.key} className="flex items-center gap-3"><Checkbox id={item.key} checked={checklist[item.key as keyof typeof checklist]} onCheckedChange={c => setChecklist({ ...checklist, [item.key]: !!c })} /><Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label></div>
            ))}
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memproses..." : "Kirim & Buat QR"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default RetailerDashboard;
