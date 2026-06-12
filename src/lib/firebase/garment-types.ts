import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";

export interface GarmentType {
  id: string;
  name: string;
}

export async function getGarmentTypes(): Promise<GarmentType[]> {
  const snapshot = await getDocs(collection(db, "garment_types"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GarmentType[];
}
