import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./config";
import { Stage } from "@/types/stage";

export async function getStages(): Promise<Stage[]> {
  const q = query(
    collection(db, "stages"),
    where("isActive", "==", true),
    orderBy("type_id", "asc"),
    orderBy("price_company", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Stage[];
}

export async function getStagesByMaterial(materialId: string) {
  const pricesSnapshot = await getDocs(
    query(
      collection(db, "stage_prices"),
      where("material_id", "==", materialId),
      where("isActive", "==", true),
    ),
  );

  if (pricesSnapshot.empty) return [];

  const stagesSnapshot = await getDocs(
    query(collection(db, "stages"), where("isActive", "==", true)),
  );

  const stagesMap = new Map(
    stagesSnapshot.docs.map((doc) => [
      doc.id,
      { id: doc.id, ...doc.data() } as Stage,
    ]),
  );

  return pricesSnapshot.docs
    .map((doc) => {
      const price = doc.data();
      const stage = stagesMap.get(price.stage_id);
      if (!stage) return null;
      return {
        ...stage,
        price_company: price.price_company,
        price_market: price.price_market,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.type_id.localeCompare(b!.type_id)) as (Stage & {
    price_company: number;
    price_market: number;
  })[];
}
