"use client";

import { StageWithPrice } from "@/types/stage";
import { GarmentType } from "@/lib/firebase/garment-types";

interface StageItemProps {
  stage: StageWithPrice;
  isSelected: boolean;
  onToggle: (stage: StageWithPrice) => void;
  garmentTypes: GarmentType[];
}

export default function StageItem({ stage, isSelected, onToggle, garmentTypes}: StageItemProps) {
  const typeName = garmentTypes.find((t) => t.id === stage.type_id)?.name ?? stage.type_id;

  return (
    <button
      onClick={() => onToggle(stage)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{stage.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stage.price_company.toLocaleString("vi-VN")} / {stage.price_market.toLocaleString("vi-VN")} - {typeName}
        </p>
      </div>
      <div
        className={`w-5 h-5 rounded-full shrink-0 ml-3 border-2 transition-colors ${
          isSelected
            ? "bg-[#8B1A1A] border-[#8B1A1A]"
            : "border-gray-300 group-hover:border-gray-400"
        }`}
      />
    </button>
  );
}