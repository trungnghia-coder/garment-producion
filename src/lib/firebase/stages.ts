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
