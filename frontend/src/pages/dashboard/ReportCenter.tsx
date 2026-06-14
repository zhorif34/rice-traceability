import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertTriangle, ShieldCheck, FileSearch, Search, Download,
  Sprout, Truck, Factory, Building2, Warehouse,
  ShoppingBag, User, FileText, ScanLine, Activity, Lock, Link2,
  CheckCircle2, Clock, Eye
} from "lucide-react";
import { toast } from "sonner";
import { reportApi, Report, ReportStats } from "@/services/api";

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

const entitasPelapor = ["Petani", "Pengepul", "RMU", "Distributor", "BULOG", "Retailer", "Konsumen"];

const supplyChain = [
  { key: "petani", label: "Petani", Icon: Sprout },
  { key: "pengepul", label: "Pengepul", Icon: Truck },
  { key: "rmu", label: "RMU", Icon: Factory },
  { key: "distributor", label: "Distributor", Icon: Building2 },
  { key: "bulog", label: "BULOG", Icon: Warehouse },
  { key: "retailer", label: "Retailer", Icon: ShoppingBag },
  { key: "konsumen", label: "Konsumen", Icon: User },
];

const statusVariant: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Diverifikasi: "bg-blue-100 text-blue-800 border-blue-200",
  Investigasi: "bg-orange-100 text-orange-800 border-orange-200",
  Selesai: "bg-green-100 text-green-800 border-green-200",
};

const priorityVariant: Record<string, string> = {
  Tinggi: "bg-red-100 text-red-800 border-red-200",
  Sedang: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Rendah: "bg-gray-100 text-gray-800 border-gray-200",
};

const entityToLabel: Record<string, string> = {
  farmer: "Petani", collector: "Pengepul", rmu: "RMU",
  distributor: "Distributor", bulog: "BULOG", retailer: "Retailer",
  konsumen: "Konsumen", admin: "Admin",
};

const ReportCenter = () => {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem("ambapari_user") || "{}"); }
    catch { return {}; }
  })();
  const userRole: string = stored.entity || "konsumen";
  const userEmail: string = stored.email || "";
  const isAdmin = userRole === "admin";
  const defaultEntitas = entityToLabel[userRole] || "Konsumen";

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>("Sedang");

  const [form, setForm] = useState({
    batchId: "",
    jenis: "",
    entitas: isAdmin ? "" : defaultEntitas,
    nama: userEmail || "",
    lokasi: "",
    tanggal: "",
    deskripsi: "",
    prioritas: "Sedang",
  });

  useEffect(() => {
    loadReports();
    if (isAdmin) loadStats();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getAll();
      setReports(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal memuat aduan");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reportApi.getStats();
      setStats(data);
    } catch { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId || !form.jenis || !form.nama || !form.deskripsi) {
      toast.error("Mohon lengkapi field wajib.");
      return;
    }

    try {
      const result = await reportApi.create({
        batchId: form.batchId,
        jenis: form.jenis,
        entitas: form.entitas || "Konsumen",
        nama: form.nama,
        lokasi: form.lokasi,
        tanggal: form.tanggal,
        deskripsi: form.deskripsi,
        prioritas: form.prioritas,
      });
      toast.success(`Aduan ${result.reportId} berhasil dikirim ke blockchain ledger.`);
      setForm({ batchId: "", jenis: "", entitas: defaultEntitas, nama: userEmail || "", lokasi: "", tanggal: "", deskripsi: "", prioritas: "Sedang" });
      loadReports();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal mengirim aduan");
    }
  };

  const visibleReports = isAdmin ? reports : reports.filter(r => r.pelapor === (userEmail || form.nama) || r.entitas === defaultEntitas);

  const filtered = visibleReports.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.batchId.toLowerCase().includes(search.toLowerCase()) ||
      r.pelapor.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const header = "ID,Batch ID,Pelapor,Entitas,Jenis,Status,Prioritas,Verified\n";
    const rows = filtered.map(r =>
      `${r.reportId},${r.batchId},${r.pelapor},${r.entitas},${r.jenis},${r.status},${r.prioritas},${r.verified}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aduan.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Data aduan berhasil diekspor.");
  };

  const handleUpdateStatus = async (reportId: string, status: string, prioritas?: string) => {
    try {
      await reportApi.updateStatus(reportId, status, prioritas);
      toast.success(`Status aduan ${reportId} diperbarui menjadi ${status}`);
      loadReports();
      if (isAdmin) loadStats();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal memperbarui status");
    }
  };

  const handleUpdatePriority = async (reportId: string, prioritas: string, currentStatus: string) => {
    try {
      await reportApi.updateStatus(reportId, currentStatus, prioritas);
      toast.success(`Prioritas ${reportId} → ${prioritas}`);
      setSelectedPriority(prioritas);
      loadReports();
      if (isAdmin) loadStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal memperbarui prioritas");
    }
  };

  const statusBadge = (status: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusVariant[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );

  const priorityBadge = (priority: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityVariant[priority] || "bg-gray-100 text-gray-800"}`}>
      {priority}
    </span>
  );

  return (
    <DashboardLayout title={isAdmin ? "Dasbor Aduan Distribusi Beras (Admin)" : "Pusat Aduan Saya"} entityLabel={defaultEntitas}>
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Pusat Pelaporan Kejanggalan & Fraud</h2>
                  <p className="text-sm text-muted-foreground">Sistem pelaporan rantai pasok beras berbasis Hyperledger Fabric — aman, terverifikasi, dan tidak dapat dimanipulasi.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><ShieldCheck className="w-3 h-3" /> Blockchain Verified</Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1"><Lock className="w-3 h-3" /> Secure Reporting</Badge>
                <Badge className="bg-slate-100 text-slate-800 border-slate-200 gap-1"><Activity className="w-3 h-3" /> Live Ledger</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Aduan</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-blue-600">{stats.diproses}</p><p className="text-xs text-muted-foreground">Dalam Proses</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-red-600">{stats.prioritas}</p><p className="text-xs text-muted-foreground">Prioritas Tinggi</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-orange-600">{stats.fraud}</p><p className="text-xs text-muted-foreground">Indikasi Fraud</p></CardContent></Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {!isAdmin && (
            <Card className="lg:col-span-5 backdrop-blur bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Form Pelaporan Kejanggalan
                </CardTitle>
                <CardDescription>Setiap aduan akan dicatat permanen pada blockchain ledger.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Batch ID Bermasalah *</Label>
                      <div className="relative">
                        <Input
                          placeholder="cth. FARM-M1A2B3C"
                          value={form.batchId}
                          onChange={e => setForm({ ...form, batchId: e.target.value })}
                          className="pr-20 font-mono"
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                          <button type="button" onClick={() => toast.info("Membuka pemindai QR...")} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                            <ScanLine className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {form.batchId && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verifikasi blockchain tersedia
                        </Badge>
                      )}
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
                      <Label>Entitas Pelapor</Label>
                      <Select value={form.entitas} onValueChange={v => setForm({ ...form, entitas: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih entitas" /></SelectTrigger>
                        <SelectContent>
                          {entitasPelapor.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Pelapor *</Label>
                      <Input placeholder="Nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Lokasi Kejadian</Label>
                      <Input placeholder="cth. Pasar Induk Cipinang" value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal Kejadian</Label>
                      <Input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi Aduan *</Label>
                    <Textarea
                      rows={4}
                      placeholder="Jelaskan kejanggalan secara detail..."
                      value={form.deskripsi}
                      onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-green-600 hover:opacity-90 shadow-lg shadow-primary/30">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Kirim Aduan
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {userRole !== "konsumen" && (
          <Card className="backdrop-blur bg-card/80">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-primary" /> Monitoring Aduan
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Cari ID / Batch / Pelapor" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Diverifikasi">Diverifikasi</SelectItem>
                      <SelectItem value="Investigasi">Investigasi</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Ekspor</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Memuat data aduan...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Aduan</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Pelapor</TableHead>
                        <TableHead>Entitas</TableHead>
                        <TableHead>Jenis Aduan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioritas</TableHead>
                        {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(r => (
                        <TableRow key={r.reportId} className={selectedReport?.reportId === r.reportId ? "bg-primary/5" : ""}>
                          <TableCell className="font-mono font-semibold">{r.reportId}</TableCell>
                          <TableCell className="font-mono">{r.batchId}</TableCell>
                          <TableCell>{r.pelapor}</TableCell>
                          <TableCell>{r.entitas}</TableCell>
                          <TableCell>{r.jenis}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell>{priorityBadge(r.prioritas)}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedReport(r); setSelectedPriority(r.prioritas); setDetailOpen(true); }}
                              >
                                <Eye className="w-4 h-4 mr-1" /> Lihat
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">Tidak ada aduan ditemukan.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>Menampilkan {filtered.length} dari {reports.length} aduan</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-primary" /> Detail Aduan
                </DialogTitle>
                <DialogDescription>
                  Informasi lengkap aduan dari entitas pelapor.
                </DialogDescription>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs">ID Aduan</p>
                      <p className="font-mono font-semibold">{selectedReport.reportId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Batch ID</p>
                      <p className="font-mono">{selectedReport.batchId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pelapor</p>
                      <p className="font-medium">{selectedReport.pelapor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Entitas</p>
                      <Badge variant="secondary">{selectedReport.entitas}</Badge>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Jenis Aduan</p>
                      <p className="font-medium">{selectedReport.jenis}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Status</p>
                      {statusBadge(selectedReport.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Prioritas</p>
                      {priorityBadge(selectedReport.prioritas)}
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Deskripsi</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.deskripsi || "Tidak ada deskripsi"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Transaction Hash</p>
                      <p className="font-mono text-xs break-all">0x{selectedReport.reportId.replace(/\W/g, "").toLowerCase()}{selectedReport.batchId.replace(/\W/g, "").toLowerCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs mb-2">Perbarui Status</p>
                      <div className="flex flex-wrap gap-2">
                        {["Pending", "Diverifikasi", "Investigasi", "Selesai"].map(s => (
                          <Button
                            key={s}
                            size="sm"
                            variant={selectedReport.status === s ? "default" : "outline"}
                            onClick={() => handleUpdateStatus(selectedReport.reportId, s)}
                            disabled={selectedReport.status === s}
                          >
                            {s === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                            {s === "Diverifikasi" && <ShieldCheck className="w-3 h-3 mr-1" />}
                            {s === "Investigasi" && <Search className="w-3 h-3 mr-1" />}
                            {s === "Selesai" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs mb-2">Perbarui Prioritas Aduan</p>
                      <div className="flex flex-wrap gap-2">
                        {["Rendah", "Sedang", "Tinggi"].map(p => (
                          <Button
                            key={p}
                            size="sm"
                            variant={selectedPriority === p ? "default" : "outline"}
                            onClick={() => handleUpdatePriority(selectedReport!.reportId, p, selectedReport!.status)}
                            disabled={selectedPriority === p}
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportCenter;
