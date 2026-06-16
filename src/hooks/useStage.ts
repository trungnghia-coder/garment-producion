import { useEffect, useState, useCallback } from "react";
import { getStages, getStagesByMaterial } from "@/lib/firebase/stages";
import { Stage, StageWithPrice } from "@/types/stage";

export function useStages(materialId?: string) {
  const [stages, setStages] = useState<Stage[] | StageWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = useCallback(() => {
    setLoading(true);
    const fetch = materialId ? getStagesByMaterial(materialId) : getStages();
    fetch.then(setStages).finally(() => setLoading(false));
  }, [materialId]);

  useEffect(() => {
    const fetch = materialId ? getStagesByMaterial(materialId) : getStages();

    fetch.then(setStages).finally(() => setLoading(false));
  }, [materialId]);

  return { stages, loading, refresh: fetchStages };
}
