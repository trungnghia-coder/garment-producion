import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { Material } from "@/types/material";

export async function getMaterials(): Promise<Material[]> {
  const q = query(collection(db, "materials"), where("isActive", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Material[];
}
