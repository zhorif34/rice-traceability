import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";

export type BatchEntry = {
  batchId: string;
  entity: string;
  summary: string;
  details: Record<string, string>;
  createdBy: string;
  createdAt: string;
};

function mapBatch(raw: any): BatchEntry {
  const data = raw.data || {};
  return {
    batchId: raw.batchId,
    entity: raw.entityType,
    summary: data.volume_gkg_kg
      ? `${data.varietas_benih || ""} • ${data.volume_gkg_kg} kg`
      : data.volume_gkg_diterima_kg
        ? `${data.asal_petani_lokasi || ""} • ${data.volume_gkg_diterima_kg} kg`
        : data.volume_gkg_masuk_kg
          ? `GKG ${data.volume_gkg_masuk_kg} kg • ${data.berat_beras_digiling || "-"} kg digiling`
          : data.volume_beras_dikirim_karung
            ? `${data.volume_beras_dikirim_karung} karung`
            : data.volume_dibeli_ton
              ? `${data.volume_dibeli_ton} ton`
              : data.volume_dibeli_karung
                ? `${data.volume_dibeli_karung} karung`
                : raw.batchId,
    details: data,
    createdBy: raw.creator_id || "",
    createdAt: raw.createdAt || "",
  };
}

export const useBatchHistory = () => {
  const [batches, setBatches] = useState<BatchEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/my-batches");
      const raw: any[] = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      setBatches((Array.isArray(raw) ? raw : []).map(mapBatch));
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return { batches, loading, refresh: fetchBatches };
};
