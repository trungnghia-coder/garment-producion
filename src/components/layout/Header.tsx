import Image from "next/image";

export default function Header() {
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
    </header>
  );
}