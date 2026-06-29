import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import api from "@/services/api";

const entityLabels: Record<string, string> = { petani: "Petani", pengepul: "Pengepul", rmu: "RMU", distributor: "Distributor", bulog: "Lembaga Logistik Pemerintah", retailer: "Pengecer", admin: "Admin" };
const entityColors: Record<string, string> = { petani: "bg-green-100 text-green-800", pengepul: "bg-yellow-100 text-yellow-800", rmu: "bg-blue-100 text-blue-800", distributor: "bg-purple-100 text-purple-800", bulog: "bg-orange-100 text-orange-800", retailer: "bg-pink-100 text-pink-800", admin: "bg-gray-100 text-gray-800" };

interface UserData {
  id: string;
  email: string;
  entityName: string;
  role: string;
  createdAt: string;
  batches: { batchId: string; createdAt: string }[];
}

const AdminUserData = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entityLabels[u.role] ?? u.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Data Pengguna" entityLabel="Admin">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Data Entitas Terdaftar
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau jenis entitas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap / Perusahaan</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Jenis Entitas</TableHead>
                    <TableHead>Batch ID Dihasilkan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.entityName || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={entityColors[u.role] || ""}>
                          {entityLabels[u.role] ?? u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.batches.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Belum ada</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.batches.map((b) => (
                              <Badge
                                key={b.batchId}
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {b.batchId}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {searchTerm ? "Tidak ada hasil yang cocok." : "Belum ada entitas yang terdaftar."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUserData;
