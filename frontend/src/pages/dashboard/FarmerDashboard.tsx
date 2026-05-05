import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BatchHistoryCard from "@/components/BatchHistoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Sprout, Wheat } from "lucide-react";
import api from "@/services/api";
import { useBatchHistory } from "@/hooks/useBatchHistory";

const FarmerDashboard = () => {
  const [land, setLand] = useState({ gps: "", area: "", fertHistory: "" });
  const [planting, setPlanting] = useState({ sowDate: "", seedVariety: "", seedSource: "", pesticides: "" });
  const [harvest, setHarvest] = useState({ harvestDate: "", paddyVolume: "", yieldPerHa: "" });
  const [loading, setLoading] = useState(false);
  const { batches, refresh } = useBatchHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/farmer/batch", {
        lokasi_gps: land.gps, luas_area_ha: land.area,
        riwayat_pupuk_pestisida: land.fertHistory, tanggal_tanam: planting.sowDate,
        varietas_benih: planting.seedVariety, sumber_benih: planting.seedSource,
        pestisida: planting.pesticides, tanggal_panen: harvest.harvestDate,
        volume_gkg_kg: harvest.paddyVolume, hasil_panen_per_ha: harvest.yieldPerHa,
      });
      const batchId = res.data.batchId;
      await refresh();
      toast.success(`ID Batch: ${batchId}`, { description: "Data dicatat ke blockchain." });
      setLand({ gps: "", area: "", fertHistory: "" });
      setPlanting({ sowDate: "", seedVariety: "", seedSource: "", pesticides: "" });
      setHarvest({ harvestDate: "", paddyVolume: "", yieldPerHa: "" });
    } catch (err: any) { toast.error(err.response?.data?.error || "Gagal."); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Dasbor Petani" entityLabel="Petani">
      <div className="space-y-6">
        <BatchHistoryCard batches={batches} entityLabel="Petani" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Data Lahan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Lokasi GPS / Alamat</Label><Input placeholder="cth. Desa Suka Maju" value={land.gps} onChange={e => setLand({ ...land, gps: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Luas Lahan (ha)</Label><Input type="number" step="0.01" placeholder="cth. 2.5" value={land.area} onChange={e => setLand({ ...land, area: e.target.value })} required /></div>
            <div className="space-y-2 md:col-span-2"><Label>Riwayat Pupuk / Pestisida</Label><Textarea placeholder="Jelaskan riwayat..." value={land.fertHistory} onChange={e => setLand({ ...land, fertHistory: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="w-5 h-5 text-primary" />Data Tanam</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Tanggal Tanam</Label><Input type="date" value={planting.sowDate} onChange={e => setPlanting({ ...planting, sowDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Varietas Benih</Label><Input placeholder="cth. IR64" value={planting.seedVariety} onChange={e => setPlanting({ ...planting, seedVariety: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Sumber Benih</Label><Input placeholder="cth. Bersertifikat" value={planting.seedSource} onChange={e => setPlanting({ ...planting, seedSource: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Pestisida</Label><Input placeholder="cth. Decis" value={planting.pesticides} onChange={e => setPlanting({ ...planting, pesticides: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wheat className="w-5 h-5 text-primary" />Data Panen</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Tanggal Panen</Label><Input type="date" value={harvest.harvestDate} onChange={e => setHarvest({ ...harvest, harvestDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Volume GKG (kg)</Label><Input type="number" placeholder="cth. 5000" value={harvest.paddyVolume} onChange={e => setHarvest({ ...harvest, paddyVolume: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Hasil per Ha (kg/ha)</Label><Input type="number" placeholder="cth. 6000" value={harvest.yieldPerHa} onChange={e => setHarvest({ ...harvest, yieldPerHa: e.target.value })} required /></div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>{loading ? "Memproses..." : "Hasilkan ID Batch & Kirim"}</Button>
      </form>
    </DashboardLayout>
  );
};
export default FarmerDashboard;
