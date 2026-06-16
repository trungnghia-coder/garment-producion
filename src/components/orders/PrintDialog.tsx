"use client";

import { useState } from "react";
import { Building2, Store } from "lucide-react";

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (priceType: "company" | "market") => void;
}

export default function PrintDialog({ open, onClose, onConfirm }: PrintDialogProps) {
  const [selected, setSelected] = useState<"company" | "market">("company");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Chọn loại giá in PDF</h2>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelected("company")}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
              selected === "company"
                ? "border-[#8B1A1A] bg-[#8B1A1A]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Building2 size={24} className={selected === "company" ? "text-[#8B1A1A]" : "text-gray-400"} />
            <span className={`text-sm font-medium ${selected === "company" ? "text-[#8B1A1A]" : "text-gray-600"}`}>
              Giá công ty
            </span>
          </button>

          <button
            onClick={() => setSelected("market")}
            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
              selected === "market"
                ? "border-[#1A4A8B] bg-[#1A4A8B]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Store size={24} className={selected === "market" ? "text-[#1A4A8B]" : "text-gray-400"} />
            <span className={`text-sm font-medium ${selected === "market" ? "text-[#1A4A8B]" : "text-gray-600"}`}>
              Giá thị trường
            </span>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#9B1A1A] transition-colors"
          >
            In PDF
          </button>
        </div>
      </div>
    </div>
  );
}