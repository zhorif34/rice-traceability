import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Sprout, Truck, Factory, Building2, Warehouse, ShoppingBag, CheckCircle2, ShieldCheck } from "lucide-react";
import api from "@/services/api";

const entityLabels: Record<string, string> = { petani: "Petani", pengepul: "Pengepul", rmu: "RMU", distributor: "Distributor", bulog: "Bulog", retailer: "Pengecer" };
const entityColors: Record<string, string> = { petani: "bg-green-100 text-green-800", pengepul: "bg-yellow-100 text-yellow-800", rmu: "bg-blue-100 text-blue-800", distributor: "bg-purple-100 text-purple-800", bulog: "bg-orange-100 text-orange-800", retailer: "bg-pink-100 text-pink-800" };
const entityIcons: Record<string, any> = { petani: Sprout, pengepul: Truck, rmu: Factory, distributor: Building2, bulog: Warehouse, retailer: ShoppingBag };

const AdminDashboard = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrace, setSelectedTrace] = useState<any[] | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { try { const res = await api.get("/admin/batches"); setBatches(res.data); } catch {} finally { setLoading(false); } })();
  }, []);

  const handleTrace = async (batchId: string) => {
    setSelectedBatchId(batchId);
    try { const res = await api.get(`/admin/trace/${batchId}`); setSelectedTrace(res.data); } catch { setSelectedTrace([]); }
  };

  const filtered = batches.filter(b => b.batchId?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout title="Dasbor Admin" entityLabel="Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{batches.length}</div><p className="text-sm text-muted-foreground">Total Batch</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{new Set(batches.map(b => b.entityType)).size}</div><p className="text-sm text-muted-foreground">Entitas Aktif</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{batches.filter(b => b.sniValid).length}</div><p className="text-sm text-muted-foreground">SNI Valid</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Daftar Batch</CardTitle>
          <div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari Batch ID..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        </CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Batch ID</TableHead><TableHead>Entitas</TableHead><TableHead>Tanggal</TableHead><TableHead>SNI</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map(b => (
                <TableRow key={b.batchId}><TableCell className="font-mono font-semibold">{b.batchId}</TableCell>
                  <TableCell><Badge variant="secondary" className={entityColors[b.entityType] || ""}>{entityLabels[b.entityType] || b.entityType}</Badge></TableCell>
                  <TableCell>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID') : '-'}</TableCell>
                  <TableCell>{b.sniValid ? <Badge className="bg-green-100 text-green-800">Valid</Badge> : '-'}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => handleTrace(b.batchId)}><Eye className="w-4 h-4 mr-1" />Lihat</Button></TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!selectedBatchId} onOpenChange={() => { setSelectedBatchId(null); setSelectedTrace(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white text-foreground">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" />Ketelusuran: {selectedBatchId}</DialogTitle></DialogHeader>
          {selectedTrace && selectedTrace.length > 0 && (<div className="relative mt-4"><div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" /><div className="space-y-6">{selectedTrace.map((step: any, i: number) => {
            const Icon = entityIcons[step.entityType] || Sprout;
            return (<div key={i} className="relative flex gap-4"><div className="w-16 h-16 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 bg-background border-primary/20"><Icon className="w-7 h-7 text-primary" /></div>
              <div className="rounded-xl border p-4 flex-1"><div className="flex items-start justify-between mb-1"><h3 className="font-semibold">{entityLabels[step.entityType] || step.entityType}</h3><span className="text-xs text-muted-foreground">{step.createdAt ? new Date(step.createdAt).toLocaleDateString('id-ID') : ''}</span></div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">{step.data && Object.entries(step.data).filter(([k]) => k !== 'prev_batch_id').map(([key, val]: [string, any]) => (<div key={key} className="text-sm"><span className="text-muted-foreground">{key.replace(/_/g, ' ')}: </span><span className="font-medium">{String(val)}</span></div>))}</div></div></div>);
          })}</div></div>)}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
export default AdminDashboard;
