import { useCallback, useEffect, useState } from "react";

export type BatchEntry = {
  batchId: string;
  entity: string;
  summary: string;
  details: Record<string, string>;
  createdBy: string;
  createdAt: string;
};

const STORAGE_PREFIX = "ambapari_batches_";
const EVENT_NAME = "ambapari:batches-updated";

const getCurrentUser = (): { email: string } | null => {
  try {
    const raw = localStorage.getItem("ambapari_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storageKey = (email: string) => `${STORAGE_PREFIX}${email}`;

const readBatches = (email: string): BatchEntry[] => {
  try {
    const raw = localStorage.getItem(storageKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useBatchHistory = () => {
  const user = getCurrentUser();
  const email = user?.email ?? "";
  const [batches, setBatches] = useState<BatchEntry[]>(() =>
    email ? readBatches(email) : []
  );

  useEffect(() => {
    if (!email) return;
    const refresh = () => setBatches(readBatches(email));
    const onCustom = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(email)) refresh();
    };
    window.addEventListener(EVENT_NAME, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [email]);

  const addBatch = useCallback(
    (entry: Omit<BatchEntry, "createdBy" | "createdAt">) => {
      if (!email) return null;
      const newEntry: BatchEntry = {
        ...entry,
        createdBy: email,
        createdAt: new Date().toISOString(),
      };
      const next = [newEntry, ...readBatches(email)];
      localStorage.setItem(storageKey(email), JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { email } }));
      return newEntry;
    },
    [email]
  );

  return { batches, addBatch, currentUserEmail: email };
};
