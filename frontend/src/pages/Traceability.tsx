import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QrScanner from "@/components/QrScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, QrCode, Camera, Keyboard, Sprout, Truck, Factory, Building2, Warehouse, ShoppingBag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const entityIcons: Record<string, any> = { petani: Sprout, pengepul: Truck, rmu: Factory, distributor: Building2, bulog: Warehouse, retailer: ShoppingBag };
const entityLabels: Record<string, string> = { petani: "Petani", pengepul: "Pengepul", rmu: "RMU", distributor: "Distributor", bulog: "Bulog", retailer: "Pengecer" };

const Traceability = () => {
  const [batchId, setBatchId] = useState("");
  const [traceData, setTraceData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const fetchTrace = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/traceability/trace/${id.trim()}`);
      setTraceData(res.data);
      setBatchId(id.trim());
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Batch tidak ditemukan.");
      setTraceData(null);
    } finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchTrace(batchId);
  };

  const handleQrScan = async (decodedText: string) => {
    setScanMode(false);
    toast.success("QR Code terdeteksi!");
    await fetchTrace(decodedText);
  };

  const handleScanError = (errorMessage: string) => {
    toast.error(errorMessage);
    setScanMode(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"><span className="text-gradient">Keterlacakan</span> Beras</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Masukkan ID Batch atau pindai kode QR untuk melihat perjalanan rantai pasok beras Anda.</p>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mt-3">
              Konsumen dapat menelusuri beras yang dibeli dari <span className="font-semibold text-primary">Distributor</span>, <span className="font-semibold text-primary">Bulog</span>, atau <span className="font-semibold text-primary">Pengecer</span>.
              Pindai kode QR dari kemasan atau gunakan <span className="font-medium">Input Manual</span> untuk memasukkan ID Batch.
            </p>
          </div>

          <div className="max-w-lg mx-auto mb-16 animate-fade-up">
            <div className="flex gap-4 mb-6 justify-center">
              <Button size="lg" onClick={() => setScanMode(false)} className={`h-14 px-8 text-base font-semibold rounded-xl shadow-md transition-all ${!scanMode ? "bg-green-700 text-white hover:bg-green-800 ring-2 ring-green-700 ring-offset-2" : "bg-white text-green-700 border-2 border-green-700 hover:bg-green-50"}`}>
                <Keyboard className="w-5 h-5 mr-2" />Input Manual
              </Button>
              <Button size="lg" onClick={() => setScanMode(true)} className={`h-14 px-8 text-base font-semibold rounded-xl shadow-md transition-all ${scanMode ? "bg-green-700 text-white hover:bg-green-800 ring-2 ring-green-700 ring-offset-2" : "bg-white text-green-700 border-2 border-green-700 hover:bg-green-50"}`}>
                <Camera className="w-5 h-5 mr-2" />Pindai QR
              </Button>
            </div>

            {scanMode ? (
              <div className="space-y-4">
                <QrScanner onScan={handleQrScan} onError={handleScanError} />
                <p className="text-center text-sm text-muted-foreground">Arahkan kamera ke kode QR pada kemasan beras</p>
              </div>
            ) : (
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Masukkan ID Batch" className="pl-10 h-12" value={batchId} onChange={(e) => setBatchId(e.target.value)} /></div>
                <Button type="submit" size="lg" className="h-12 bg-green-800 text-white hover:bg-green-900" disabled={loading}>{loading ? "..." : "Lacak"}</Button>
              </form>
            )}
          </div>
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
