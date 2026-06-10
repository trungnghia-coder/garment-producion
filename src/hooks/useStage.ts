import { useEffect, useState } from "react";
import { getStages } from "@/lib/firebase/stages";
import { Stage } from "@/types/stage";

export function useStages() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStages()
      .then(setStages)
      .finally(() => setLoading(false));
  }, []);

  return { stages, loading };
}
