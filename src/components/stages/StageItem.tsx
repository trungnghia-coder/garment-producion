"use client";

import { Stage } from "@/types/stage";

interface StageItemProps {
  stage: Stage;
  isSelected: boolean;
  onToggle: (stage: Stage) => void;
}

export default function StageItem({ stage, isSelected, onToggle }: StageItemProps) {
  return (
    <button
      onClick={() => onToggle(stage)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{stage.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stage.price_company.toLocaleString("vi-VN")} / {stage.price_market.toLocaleString("vi-VN")}
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