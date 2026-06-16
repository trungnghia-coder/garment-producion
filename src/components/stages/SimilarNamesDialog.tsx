"use client";

import { AlertTriangle, X } from "lucide-react";

interface SimilarNamesDialogProps {
  open: boolean;
  newName: string;
  similarNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SimilarNamesDialog({
  open,
  newName,
  similarNames,
  onConfirm,
  onCancel,
}: SimilarNamesDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Có công đoạn tên tương tự
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-2">
          Tên <span className="font-medium text-gray-800">&quot;{newName}&quot;</span> khá
          giống với các công đoạn đã có:
        </p>

        <ul className="flex flex-col gap-1.5 mb-4 max-h-40 overflow-y-auto">
          {similarNames.map((name) => (
            <li
              key={name}
              className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              {name}
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-500 mb-4">
          Bạn vẫn muốn thêm công đoạn mới này chứ?
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
          >
            Vẫn thêm
          </button>
        </div>
      </div>
    </div>
  );
}