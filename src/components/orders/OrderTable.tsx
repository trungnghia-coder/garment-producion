"use client";

import { OrderItem } from "@/types/stage";
import { useState } from "react";

interface OrderTableProps {
  items: OrderItem[];
  syncQty: number;
  onSyncQtyChange: (qty: number) => void;
  onSync: () => void;
  onClear: () => void;
  onExport: () => void;
  onQtyChange: (id: string, qty: number) => void;
  productCode: string;
  onProductCodeChange: (code: string) => void;
}

const TH = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap ${className}`}>
    {children}
  </th>
);

const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);


export default function OrderTable({
  items,
  syncQty,
  onSync,
  onClear,
  onExport,
  onQtyChange,
  onSyncQtyChange,
  productCode,
  onProductCodeChange,
}: OrderTableProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-3">
        {/* Mã sản phẩm */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Mã sản phẩm:</label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => onProductCodeChange(e.target.value)}
            placeholder="VD: 053302"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] w-100"
          />
        </div>

        <div className="w-px h-5 bg-gray-200" /> {/* Divider */}

        {/* Đồng bộ */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Đồng bộ số lượng cắt:</label>
          <input
            type="number"
            min={0}
            value={syncQty || ""}
            onChange={(e) => onSyncQtyChange(Number(e.target.value))}
            placeholder="0"
            className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] text-center"
          />
          <button
            onClick={onSync}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
          >
            Đồng bộ
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 border-2 border-black rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-200">
                <TH className="w-12">STT</TH>
                <TH>Tên công đoạn</TH>
                <TH>Số lượng cắt</TH>
                <TH>Giá công ty</TH>
                <TH>Giá thị trường</TH>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm text-gray-400">
                    Chọn công đoạn bên trái để thêm vào bảng
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TD className="text-center font-medium text-gray-500">
                      {String(idx + 1).padStart(2, "0")}
                    </TD>
                    <TD className="font-medium">{item.name}</TD>
                    <TD>
                      <input
                        type="number"
                        min={0}
                        value={item.qty}
                        onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-md outline-none focus:border-[#8B1A1A] text-center"
                      />
                    </TD>
                    <TD>{item.price_company.toLocaleString("vi-VN")}đ</TD>
                    <TD>{item.price_market.toLocaleString("vi-VN")}đ</TD>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClear}
          className="px-5 py-2 text-sm font-medium text-gray-800 bg-[#F0B429] rounded-lg hover:bg-[#e0a820] transition-colors"
        >
          Xóa
        </button>
        <button
          onClick={onExport}
          className="px-5 py-2 text-sm font-medium text-white bg-[#FF0000] rounded-lg hover:bg-[#FF0000] transition-colors"
        >
          In PDF
        </button>
      </div>
    </div>
  );
}