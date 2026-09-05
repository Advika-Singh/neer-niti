import { useEffect, useState } from "react";
import { apiGetRainfall, apiGetRisk } from "./api";
import { DISTRICTS } from "./districts";
import type { DroughtIndex, MonthlyRainfall } from "./types";

/** Polls live drought risk (SPI/SPEI/RDI) for every district — cheap, backend caches the underlying weather fetch. */
export function useAllDistrictsRisk(refreshMs = 30000) {
  const [risk, setRisk] = useState<Record<string, DroughtIndex>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results = await Promise.allSettled(DISTRICTS.map((d) => apiGetRisk(d.id)));
      if (cancelled) return;
      setRisk((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === "fulfilled") next[DISTRICTS[i].id] = r.value;
        });
        return next;
      });
      setLoading(false);
    }

    load();
    const id = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refreshMs]);

  return { risk, loading };
}

export function useMonthlyRainfall(districtId: string) {
  const [rainfall, setRainfall] = useState<MonthlyRainfall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetRainfall(districtId)
      .then((data) => {
        if (!cancelled) setRainfall(data);
      })
      .catch(() => {
        if (!cancelled) setRainfall([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId]);

  return { rainfall, loading };
}
