"use client";

import { useState } from "react";
import { Stage } from "@/types/stage";
import StageItem from "./StageItem";

interface StageListProps {
  stages: Stage[];
  selectedIds: Set<string>;
  onToggle: (stage: Stage) => void;
  onAdd: () => void;
}

export default function StageList({
  stages,
  selectedIds,
  onToggle,
  onAdd,
}: StageListProps) {
  const [search, setSearch] = useState("");

  const filtered = stages.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[340px] shrink-0 bg-gray-50 rounded-xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Search + Add */}
      <div className="flex gap-2 p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400 placeholder:text-gray-400"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
        >
          Thêm
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Không tìm thấy công đoạn
          </p>
        ) : (
          filtered.map((stage) => (
            <StageItem
              key={stage.id}
              stage={stage}
              isSelected={selectedIds.has(stage.id)}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}