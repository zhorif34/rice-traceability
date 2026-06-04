import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertTriangle, ShieldCheck, FileSearch, Search, Download,
  Sprout, Truck, Factory, Building2, Warehouse,
  ShoppingBag, User, Activity, Lock, Link2,
  CheckCircle2, Clock, Eye, Filter, BarChart3, TrendingUp,
  Users, FileWarning
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

const entityColors: Record<string, string> = {
  Petani: "bg-green-100 text-green-800", Pengepul: "bg-yellow-100 text-yellow-800",
  RMU: "bg-blue-100 text-blue-800", Distributor: "bg-purple-100 text-purple-800",
  BULOG: "bg-orange-100 text-orange-800", Retailer: "bg-pink-100 text-pink-800",
  Konsumen: "bg-gray-100 text-gray-800",
};

const entityIcons: Record<string, any> = {
  Petani: Sprout, Pengepul: Truck, RMU: Factory,
  Distributor: Building2, BULOG: Warehouse, Retailer: ShoppingBag,
  Konsumen: User,
};

const AdminReportCenter = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, statsData] = await Promise.all([
        reportApi.getAll(),
        reportApi.getStats(),
      ]);
      setReports(reportData);
      setStats(statsData);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal memuat data aduan");
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (entityFilter !== "all" && r.entitas !== entityFilter) return false;
    if (typeFilter !== "all" && r.jenis !== typeFilter) return false;
    if (priorityFilter !== "all" && r.prioritas !== priorityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.reportId.toLowerCase().includes(s) ||
        r.batchId.toLowerCase().includes(s) ||
        r.pelapor.toLowerCase().includes(s) ||
        r.entitas.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const header = "ID,Batch ID,Pelapor,Entitas,Jenis,Status,Prioritas,Deskripsi,Tanggal,Lokasi,Verified\n";
    const rows = filtered.map(r =>
      `${r.reportId},${r.batchId},${r.pelapor},${r.entitas},${r.jenis},${r.status},${r.prioritas},"${(r.deskripsi || "").replace(/"/g, '""')}",${r.tanggal || ""},${r.lokasi || ""},${r.verified}`
    ).join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aduan_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Data aduan berhasil diekspor.");
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await reportApi.updateStatus(reportId, status);
      toast.success(`Status ${reportId} → ${status}`);
      loadData();
      setDetailOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Gagal memperbarui status");
    }
  };

  const statusBadge = (status: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusVariant[status] || ""}`}>{status}</span>
  );

  const priorityBadge = (priority: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityVariant[priority] || ""}`}>{priority}</span>
  );

  const entityBadge = (entitas: string) => {
    const Icon = entityIcons[entitas] || User;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${entityColors[entitas] || "bg-gray-100 text-gray-800"}`}>
        <Icon className="w-3 h-3" /> {entitas}
      </span>
    );
  };

  const entitasList = [...new Set(reports.map(r => r.entitas))].sort();
  const jenisList = [...new Set(reports.map(r => r.jenis))].sort();

  const byEntity = entitasList.map(e => ({
    entity: e,
    total: reports.filter(r => r.entitas === e).length,
    pending: reports.filter(r => r.entitas === e && r.status === "Pending").length,
    selesai: reports.filter(r => r.entitas === e && r.status === "Selesai").length,
  }));

  return (
    <DashboardLayout title="Manajemen Aduan Seluruh Entitas" entityLabel="Admin">
      <div className="space-y-6">
        {/* Header Banner */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Monitoring Aduan Seluruh Entitas Rantai Pasok</h2>
                <p className="text-sm text-muted-foreground">
                  Kelola dan pantau seluruh aduan dari Petani, Pengepul, RMU, Distributor, BULOG, Retailer, dan Konsumen.
                  Setiap aduan tercatat permanen di Hyperledger Fabric ledger.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><ShieldCheck className="w-3 h-3" /> Blockchain Verified</Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1"><Lock className="w-3 h-3" /> Immutable Ledger</Badge>
              <Badge className="bg-slate-100 text-slate-800 border-slate-200 gap-1"><Activity className="w-3 h-3" /> Live Data</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Aduan</p>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-muted-foreground">Indikasi Fraud</p>
                </div>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.fraud}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* By Entity Overview */}
        {byEntity.length > 0 && (
          <Card className="backdrop-blur bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-primary" /> Ringkasan per Entitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {byEntity.map(({ entity, total, pending, selesai }) => {
                  const Icon = entityIcons[entity] || User;
                  return (
                    <Card key={entity} className="bg-muted/30">
                      <CardContent className="pt-4 pb-3 text-center">
                        <div className="flex justify-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{entity}</p>
                        <p className="text-xl font-bold">{total}</p>
                        <div className="flex justify-center gap-2 mt-1 text-xs">
                          <span className="text-yellow-600">{pending} pending</span>
                          <span className="text-green-600">{selesai} selesai</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters & Table */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" /> Daftar Seluruh Aduan
              </CardTitle>
            </div>
            <div className="flex flex-col md:flex-row gap-3 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari ID / Batch / Pelapor / Entitas..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-44"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Semua Entitas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Entitas</SelectItem>
                  {entitasList.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Diverifikasi">Diverifikasi</SelectItem>
                  <SelectItem value="Investigasi">Investigasi</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Semua Prioritas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="Tinggi">Tinggi</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Rendah">Rendah</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisList.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Ekspor CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Memuat data aduan...</div>
            ) : (
              <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Aduan</TableHead>
                        <TableHead>Nama Pelapor</TableHead>
                        <TableHead>Entitas Pelapor</TableHead>
                        <TableHead>Email Pelapor</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Jenis Aduan</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="max-w-xs">Deskripsi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(r => (
                        <TableRow key={r.reportId} className="hover:bg-muted/50">
                          <TableCell className="font-mono font-semibold text-xs whitespace-nowrap">{r.reportId}</TableCell>
                          <TableCell className="font-medium text-sm whitespace-nowrap">{r.pelapor}</TableCell>
                          <TableCell className="whitespace-nowrap">{entityBadge(r.entitas)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.email || r.creator_id || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{r.batchId || "-"}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{r.jenis}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.lokasi || "-"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {r.tanggal || (r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "-")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{r.deskripsi || "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedReport(r); setDetailOpen(true); }}
                            >
                              <Eye className="w-4 h-4 mr-1" /> Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground py-12">
                          {reports.length === 0 ? "Belum ada aduan dari entitas manapun." : "Tidak ada aduan yang sesuai filter."}
                        </TableCell>
                      </TableRow>
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

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" /> Detail Aduan
              </DialogTitle>
              <DialogDescription>Informasi lengkap aduan dari entitas pelapor.</DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">ID Aduan</p>
                    <p className="font-mono font-semibold break-all">{selectedReport.reportId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Batch ID</p>
                    <p className="font-mono">{selectedReport.batchId || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Entitas Pelapor</p>
                    <div className="mt-0.5">{entityBadge(selectedReport.entitas)}</div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Pelapor</p>
                    <p className="font-medium">{selectedReport.pelapor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email Pelapor</p>
                    <p className="text-sm">{selectedReport.email || selectedReport.creator_id || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <div className="mt-0.5">{statusBadge(selectedReport.status)}</div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Prioritas</p>
                    <div className="mt-0.5">{priorityBadge(selectedReport.prioritas)}</div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Jenis Aduan</p>
                    <p className="font-medium">{selectedReport.jenis}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tanggal</p>
                    <p>{selectedReport.tanggal || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Lokasi</p>
                    <p>{selectedReport.lokasi || "-"}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-muted-foreground text-xs">Deskripsi</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-md p-3 mt-1">
                      {selectedReport.deskripsi || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-muted-foreground text-xs">Transaction Hash (Blockchain)</p>
                    <p className="font-mono text-xs break-all bg-muted/30 rounded-md p-2 mt-1">
                      0x{selectedReport.reportId.replace(/\W/g, "").toLowerCase()}{selectedReport.batchId.replace(/\W/g, "").toLowerCase()}
                    </p>
                  </div>
                  <div className="col-span-3 border-t pt-3 mt-1">
                    <p className="text-muted-foreground text-xs mb-2 font-semibold">Perbarui Status Aduan</p>
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Dibuat: {new Date(selectedReport.createdAt).toLocaleString("id-ID")}
                      {selectedReport.updatedAt !== selectedReport.createdAt && (
                        <> | Diperbarui: {new Date(selectedReport.updatedAt).toLocaleString("id-ID")}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminReportCenter;
