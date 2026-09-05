"use client";

import { useState } from "react";
import { Building2, Store, Columns2 } from "lucide-react";

export type PriceType = "company" | "market" | "both";

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (priceType: PriceType) => void;
}

const OPTIONS: { value: PriceType; label: string; color: string; Icon: React.ElementType }[] = [
  { value: "company", label: "Giá xưởng", color: "#8B1A1A", Icon: Building2 },
  { value: "market", label: "Giá ngoài", color: "#1A4A8B", Icon: Store },
  { value: "both", label: "Cả hai", color: "#1D6B3B", Icon: Columns2 },
];

export default function PrintDialog({ open, onClose, onConfirm }: PrintDialogProps) {
  const [selected, setSelected] = useState<PriceType>("company");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Chọn loại giá in PDF</h2>

        <div className="flex gap-3 mb-6">
          {OPTIONS.map(({ value, label, color, Icon }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                onClick={() => setSelected(value)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-colors ${
                  isSelected ? "bg-opacity-5" : "border-gray-200 hover:border-gray-300"
                }`}
                style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
              >
                <Icon size={24} style={{ color: isSelected ? color : "#9ca3af" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? color : "#4b5563" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
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
            className="flex-1 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: OPTIONS.find((o) => o.value === selected)?.color }}
          >
            In PDF
          </button>
        </div>
      </div>
    </div>
  );
}