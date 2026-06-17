"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMaterials } from "@/lib/firebase/materials";
import { Material } from "@/types/material";

interface MaterialPickerProps {
  basePath: string; // "/stages" hoặc "/stages/manage"
  title?: string;
}

export default function MaterialPicker({ basePath, title = "Chọn chất liệu" }: MaterialPickerProps) {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterials().then(setMaterials).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <button
              key={mat.id}
              onClick={() => router.push(`${basePath}/${mat.id}`)}
              className="flex items-center justify-center h-32 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-800 font-semibold text-lg hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors"
            >
              {mat.name}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}