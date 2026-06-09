import Image from "next/image";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  let email = "";

  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session);
      email = decoded.email ?? "";
    } catch {}
  }

  return (
    <header className="h-14 bg-[#8B1A1A] flex items-center px-6 shrink-0">
      <Image
        src="/logo.png"
        alt="NITIMO"
        width={120}
        height={40}
        className="object-contain"
        priority
      />
       <div className="flex items-center gap-3 ml-auto">
        {email && (
          <span className="text-white/70 text-sm">{email}</span>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}