import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Toaster position="top-right" />
    </>
  );
}