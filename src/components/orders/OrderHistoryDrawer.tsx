"use client";

import { useEffect, useState } from "react";
import { X, Copy, FolderOpen, Clock } from "lucide-react";
import { getOrders, cloneOrder, Order } from "@/lib/firebase/order";

interface OrderHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onLoad: (order: Order) => void;
  onCloned: (newCode: string) => void;
}

function timeAgo(ts: { seconds: number }): string {
  const diff = Date.now() / 1000 - ts.seconds;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function OrderHistoryDrawer({
  open,
  onClose,
  onLoad,
  onCloned,
}: OrderHistoryDrawerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [open]);

  const handleClone = async (productCode: string) => {
    setCloningId(productCode);
    const newCode = await cloneOrder(productCode);
    setCloningId(null);
    if (newCode) {
      // Refresh danh sách
      const updated = await getOrders();
      setOrders(updated);
      onCloned(newCode);
    } else {
      alert("Đã dùng hết đuôi -1 đến -9 cho mã này!");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-800 text-sm">Lịch sử lệnh</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {loading ? (
            <div className="text-center text-sm text-gray-400 py-12">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-12">Chưa có lệnh nào</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.productCode}
                className="border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-colors bg-gray-50"
              >
                {/* Mã + thời gian */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.productCode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.syncQty} bộ · {order.stages.length} công đoạn
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {timeAgo(order.updatedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { onLoad(order); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
                  >
                    <FolderOpen size={13} />
                    Load
                  </button>
                  <button
                    onClick={() => handleClone(order.productCode)}
                    disabled={cloningId === order.productCode}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Copy size={13} />
                    {cloningId === order.productCode ? "Đang nhân..." : "Nhân bản"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}