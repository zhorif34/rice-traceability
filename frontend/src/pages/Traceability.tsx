import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, QrCode, Sprout, Truck, Factory, Building2, Warehouse, ShoppingBag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const entityIcons: Record<string, any> = { petani: Sprout, pengepul: Truck, rmu: Factory, distributor: Building2, bulog: Warehouse, retailer: ShoppingBag };
const entityLabels: Record<string, string> = { petani: "Petani", pengepul: "Pengepul", rmu: "RMU", distributor: "Distributor", bulog: "Bulog", retailer: "Pengecer" };

const Traceability = () => {
  const [batchId, setBatchId] = useState("");
  const [traceData, setTraceData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/traceability/trace/${batchId.trim()}`);
      setTraceData(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Batch tidak ditemukan.");
      setTraceData(null);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"><span className="text-gradient">Keterlacakan</span> Beras</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Masukkan ID Batch atau pindai kode QR untuk melihat perjalanan rantai pasok.</p>
          </div>
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-3 mb-16 animate-fade-up">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Masukkan ID Batch" className="pl-10 h-12" value={batchId} onChange={(e) => setBatchId(e.target.value)} /></div>
            <Button type="submit" size="lg" className="h-12" disabled={loading}><QrCode className="w-5 h-5 mr-2" />{loading ? "..." : "Lacak"}</Button>
          </form>
          {traceData && traceData.length > 0 && (
            <div className="max-w-2xl mx-auto animate-fade-up">
              <div className="glass rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="w-6 h-6 text-primary" /><h2 className="font-semibold text-lg text-foreground">Batch: {batchId}</h2></div>
                <p className="text-sm text-muted-foreground">Terverifikasi di Blockchain</p>
              </div>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-8">
                  {traceData.map((step: any, i: number) => {
                    const Icon = entityIcons[step.entityType] || Sprout;
                    return (
                      <div key={i} className="relative flex gap-6 animate-fade-up">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 z-10 bg-background"><Icon className="w-7 h-7 text-primary" /></div>
                        <div className="bg-card rounded-xl border border-border p-5 flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-foreground">{entityLabels[step.entityType] || step.entityType}</h3>
                            <span className="text-xs text-muted-foreground">{step.createdAt ? new Date(step.createdAt).toLocaleDateString('id-ID') : ''}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {step.data && Object.entries(step.data).filter(([k]) => k !== 'prev_batch_id').map(([key, val]: [string, any]) => (
                              <div key={key} className="text-sm"><span className="text-muted-foreground">{key.replace(/_/g, ' ')}: </span><span className="font-medium text-foreground">{String(val)}</span></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Traceability;
