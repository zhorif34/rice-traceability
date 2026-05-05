import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { BatchEntry } from "@/hooks/useBatchHistory";

interface BatchHistoryCardProps {
  batches: BatchEntry[];
  entityLabel: string;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const BatchHistoryCard = ({ batches, entityLabel }: BatchHistoryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Riwayat Batch ID Saya
        </CardTitle>
        <CardDescription>
          Daftar Batch ID yang telah Anda buat sebagai {entityLabel}. Diperbarui secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Belum ada Batch ID yang Anda buat. Kirim formulir di bawah untuk membuat batch pertama Anda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Ringkasan</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={`${b.batchId}-${b.createdAt}`}>
                  <TableCell className="font-mono font-semibold">{b.batchId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.summary}</TableCell>
                  <TableCell className="text-sm">{formatDate(b.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Tercatat</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchHistoryCard;
