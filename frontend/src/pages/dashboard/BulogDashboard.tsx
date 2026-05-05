import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BatchHistoryCard from "@/components/BatchHistoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart, TrendingUp } from "lucide-react";
import api from "@/services/api";
import { useBatchHistory } from "@/hooks/useBatchHistory";

const BulogDashboard = () => {
  const [prevBatchId, setPrevBatchId] = useState("");
  const [purchase, setPurchase] = useState({ po: "", volume: "", price: "", quality: "", warehouse: "", date: "" });
  const [sales, setSales] = useState({ so: "", volume: "", recipient: "", date: "" });
  const [loading, setLoading] = useState(false);
  const { batches, refresh } = useBatchHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/bulog/batch", {
        prev_batch_id: prevBatchId, nomor_po: purchase.po, volume_dibeli_ton: purchase.volume,
        harga_satuan_rp_per_kg: purchase.price, mutu_beras_sni: purchase.quality,
        nomor_gudang_penerimaan: purchase.warehouse, tanggal_pembelian: purchase.date,
        nomor_so: sales.so, volume_dijual_ton: sales.volume, penerima: sales.recipient,
        tanggal_pengiriman_gudang: sales.date,
      });
      const batchId = res.data.batchId;
      await refresh();
      toast.success(`Batch ID: ${batchId}`, { description: "Data Bulog dicatat." });
      if (res.data.qrCode) { const w = window.open('', '_blank'); if (w) { w.document.write(`<img src="${res.data.qrCode}" />`); w.document.title = "QR Code"; } }
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor Bulog" entityLabel="Bulog">
      <div className="space-y-6">
        <BatchHistoryCard batches={batches} entityLabel="Bulog" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card><CardHeader><CardTitle>Batch ID dari RMU/Distributor</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>ID Batch (RMU atau Distributor)</Label><Input placeholder="cth. RMU_... atau DISTRIBUTOR_..." value={prevBatchId} onChange={e => setPrevBatchId(e.target.value)} required /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Data Pembelian</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nomor PO</Label><Input value={purchase.po} onChange={e => setPurchase({ ...purchase, po: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume Dibeli (ton)</Label><Input type="number" step="0.01" value={purchase.volume} onChange={e => setPurchase({ ...purchase, volume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Harga Satuan (Rp/kg)</Label><Input type="number" value={purchase.price} onChange={e => setPurchase({ ...purchase, price: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Mutu Beras (SNI)</Label><Input value={purchase.quality} onChange={e => setPurchase({ ...purchase, quality: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nomor Gudang</Label><Input value={purchase.warehouse} onChange={e => setPurchase({ ...purchase, warehouse: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Pembelian</Label><Input type="date" value={purchase.date} onChange={e => setPurchase({ ...purchase, date: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Data Penjualan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nomor SO</Label><Input value={sales.so} onChange={e => setSales({ ...sales, so: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume Dijual (ton)</Label><Input type="number" step="0.01" value={sales.volume} onChange={e => setSales({ ...sales, volume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Penerima</Label><Input value={sales.recipient} onChange={e => setSales({ ...sales, recipient: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tanggal Pengiriman</Label><Input type="date" value={sales.date} onChange={e => setSales({ ...sales, date: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memproses..." : "Kirim & Buat QR"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default BulogDashboard;
