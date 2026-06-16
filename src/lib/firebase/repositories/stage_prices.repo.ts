import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config";
import { StagePrice } from "@/types/stage-price";

const COL = "stage_prices";

export const stagePriceRepo = {
  // GET BY STAGE — tất cả mức giá của 1 stage (theo từng material)
  async getByStage(stageId: string): Promise<StagePrice[]> {
    const snap = await getDocs(
      query(
        collection(db, COL),
        where("stage_id", "==", stageId),
        where("isActive", "==", true),
      ),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StagePrice[];
  },

  // GET BY MATERIAL — tất cả giá theo material
  async getByMaterial(materialId: string): Promise<StagePrice[]> {
    const snap = await getDocs(
      query(
        collection(db, COL),
        where("material_id", "==", materialId),
        where("isActive", "==", true),
      ),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StagePrice[];
  },

  // CREATE
  async create(data: {
    stage_id: string;
    material_id: string;
    price_company: number;
    price_market: number;
  }): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return ref.id;
  },

  // UPDATE
  async update(
    id: string,
    data: Partial<Pick<StagePrice, "price_company" | "price_market">>,
  ): Promise<void> {
    await updateDoc(doc(db, COL, id), { ...data, updatedAt: new Date() });
  },

  // SOFT DELETE
  async delete(id: string): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      isActive: false,
      updatedAt: new Date(),
    });
  },
};
