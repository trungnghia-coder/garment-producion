import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "./config";

export const auth = getAuth(app);

export async function login(email: string, password: string) {
  // Validate @nitimo.com domain
  //   if (!email.endsWith("@nitimo.com")) {
  //     throw new Error("Vui lòng sử dụng email công ty @nitimo.com");
  //   }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}
