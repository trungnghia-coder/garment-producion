import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config";
import { Stage, StageWithPrice } from "@/types/stage";

const COL = "stages";

export const stageRepo = {
  // GET ALL
  async getAll(): Promise<Stage[]> {
    const snap = await getDocs(
      query(
        collection(db, COL),
        where("isActive", "==", true),
        orderBy("type_id"),
      ),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Stage[];
  },

  // GET BY ID
  async getById(id: string): Promise<Stage | null> {
    const snap = await getDoc(doc(db, COL, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Stage) : null;
  },

  // GET BY MATERIAL
  async getByMaterial(materialId: string): Promise<StageWithPrice[]> {
    const pricesSnap = await getDocs(
      query(
        collection(db, "stage_prices"),
        where("material_id", "==", materialId),
        where("isActive", "==", true),
      ),
    );
    if (pricesSnap.empty) return [];

    const stagesSnap = await getDocs(
      query(collection(db, COL), where("isActive", "==", true)),
    );
    const stagesMap = new Map(
      stagesSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as Stage]),
    );

    return pricesSnap.docs
      .map((d) => {
        const price = d.data();
        const stage = stagesMap.get(price.stage_id);
        if (!stage) return null;
        return {
          ...stage,
          price_company: price.price_company,
          price_market: price.price_market,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.type_id.localeCompare(b!.type_id)) as StageWithPrice[];
  },

  // CREATE
  async create(
    data: Omit<Stage, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return ref.id;
  },

  // UPDATE
  async update(id: string, data: Partial<Stage>): Promise<void> {
    await updateDoc(doc(db, COL, id), { ...data, updatedAt: new Date() });
  },

  // SOFT DELETE
  async delete(id: string): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      isActive: false,
      updatedAt: new Date(),
    });
  },

  // CHECK SIMILAR NAME
  async findSimilarNames(name: string): Promise<string[]> {
    const snap = await getDocs(
      query(collection(db, COL), where("isActive", "==", true)),
    );
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    const inputNorm = normalize(name);
    return snap.docs
      .map((d) => d.data().name as string)
      .filter((n) => {
        const nNorm = normalize(n);
        return (
          nNorm !== inputNorm &&
          (nNorm.includes(inputNorm) ||
            inputNorm.includes(nNorm) ||
            levenshtein(inputNorm, nNorm) <= 3)
        );
      });
  },
};

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}
