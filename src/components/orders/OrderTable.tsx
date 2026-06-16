"use client";

import { OrderItem } from "@/types/stage";
import { GarmentType } from "@/lib/firebase/garment-types";
import { Pin, Trash2, History, GripVertical, Eye } from "lucide-react";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrderTableProps {
  items: OrderItem[];
  syncQty: number;
  onSyncQtyChange: (qty: number) => void;
  onSync: () => void;
  onClear: () => void;
  onExport: () => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onHistory: () => void;
  onReorder: (items: OrderItem[]) => void;
  productCode: string;
  onProductCodeChange: (code: string) => void;
  garmentTypes: GarmentType[];
  onViewDetail: (item: OrderItem) => void;
}

const PINNED_KEY = "pinned_stage_ids";
function getPinnedIds(): string[] {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) ?? "[]"); } catch { return []; }
}
function savePinnedIds(ids: string[]) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids));
}

const TH = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap ${className}`}>
    {children}
  </th>
);
const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

function SortableRow({
  item,
  idx,
  isPinned,
  typeMap,
  onQtyChange,
  onRemove,
  onTogglePin,
  isActive,
  onViewDetail,
}: {
  item: OrderItem;
  idx: number;
  isPinned: boolean;
  typeMap: Map<string, string>;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onTogglePin: (item: OrderItem) => void;
  onViewDetail: (item: OrderItem) => void;
  isActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isActive ? 0.3 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPinned ? "bg-yellow-50" : ""}`}
    >
      <TD className="text-center font-medium text-gray-500">
        {String(idx + 1).padStart(2, "0")}
      </TD>
      <TD>
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
          {typeMap.get(item.type_id) ?? "—"}
        </span>
      </TD>
      <TD>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
            title="Kéo để sắp xếp"
          >
            <GripVertical size={16} />
          </button>
          <span className="font-medium">{item.name}</span>
        </div>
      </TD>
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
      <TD className="text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetail(item)}
            title="Xem chi tiết"
            className="text-gray-300 hover:text-blue-500 transition-colors"
          >
            <Eye className="w-6 h-6" />
          </button>
          <button
            onClick={() => onTogglePin(item)}
            title={isPinned ? "Bỏ ghim" : "Ghim công đoạn này"}
            className={`transition-all hover:scale-110 ${isPinned ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
          >
            {isPinned ? <Pin className="w-6 h-6 fill-yellow-500" /> : <Pin className="w-6 h-6" />}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            title="Xóa khỏi bảng"
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </TD>
    </tr>
  );
}

export default function OrderTable({
  items,
  syncQty,
  onSync,
  onClear,
  onExport,
  onQtyChange,
  onRemove,
  onSyncQtyChange,
  onHistory,
  onReorder,
  productCode,
  onProductCodeChange,
  garmentTypes = [],
  onViewDetail,
}: OrderTableProps) {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => getPinnedIds());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  const typeMap = new Map((garmentTypes ?? []).map((t) => [t.id, t.name]));

  const togglePin = (item: OrderItem) => {
    const current = getPinnedIds();
    const isAlreadyPinned = current.includes(item.id);
    const updated = isAlreadyPinned ? current.filter((id) => id !== item.id) : [...current, item.id];
    savePinnedIds(updated);
    setPinnedIds(updated);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-3">
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
        <div className="w-px h-5 bg-gray-200" />
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200">
                  <TH className="w-12">STT</TH>
                  <TH>Loại</TH>
                  <TH>Tên công đoạn</TH>
                  <TH>Số lượng cắt</TH>
                  <TH>Giá công ty</TH>
                  <TH>Giá thị trường</TH>
                  <TH className="text-center">Thao tác</TH>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-gray-400">
                      Chọn công đoạn bên trái để thêm vào bảng
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      isPinned={pinnedIds.includes(item.id)}
                      typeMap={typeMap}
                      onQtyChange={onQtyChange}
                      onRemove={onRemove}
                      onTogglePin={togglePin}
                      isActive={item.id === activeId}
                      onViewDetail={onViewDetail}
                    />
                  ))
                )}
              </tbody>
            </table>
          </SortableContext>

              <DragOverlay>
                {activeItem && (
                  <table className="w-full bg-white shadow-xl rounded-lg border border-[#8B1A1A]">
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 w-12 text-center text-sm text-gray-500">—</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            {typeMap.get(activeItem.type_id) ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{activeItem.name}</td>
                        <td className="px-4 py-3 text-sm text-center">{activeItem.qty}</td>
                        <td className="px-4 py-3 text-sm">{activeItem.price_company.toLocaleString("vi-VN")}đ</td>
                        <td className="px-4 py-3 text-sm">{activeItem.price_market.toLocaleString("vi-VN")}đ</td>
                        <td className="px-4 py-3" />
                      </tr>
                    </tbody>
                  </table>
                )}
              </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onHistory} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <History size={15} />
          Lịch sử
        </button>
        <button onClick={onClear} className="px-5 py-2 text-sm font-medium text-gray-800 bg-[#F0B429] rounded-lg hover:bg-[#e0a820] transition-colors">
          Xóa
        </button>
        <button onClick={onExport} className="px-5 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#9B1A1A] transition-colors">
          In PDF
        </button>
      </div>
    </div>
  );
}