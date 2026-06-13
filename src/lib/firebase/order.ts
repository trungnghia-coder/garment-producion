import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { StageWithPrice } from "@/types/stage";

export interface Order {
  productCode: string;
  stages: StageWithPrice[];
  syncQty: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function saveOrder(
  productCode: string,
  stages: StageWithPrice[],
  syncQty: number,
): Promise<void> {
  const ref = doc(db, "orders", productCode);
  const existing = await getDoc(ref);

  await setDoc(ref, {
    productCode,
    stages,
    syncQty,
    createdAt: existing.exists() ? existing.data().createdAt : Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("updatedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Order);
}

export async function getOrderByCode(
  productCode: string,
): Promise<Order | null> {
  const ref = doc(db, "orders", productCode);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as Order;
}

export async function cloneOrder(productCode: string): Promise<string | null> {
  const original = await getOrderByCode(productCode);
  if (!original) return null;

  for (let i = 1; i <= 9; i++) {
    const newCode = `${productCode}-${i}`;
    const existing = await getOrderByCode(newCode);
    if (!existing) {
      await setDoc(doc(db, "orders", newCode), {
        ...original,
        productCode: newCode,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return newCode;
    }
  }

  return null;
}
