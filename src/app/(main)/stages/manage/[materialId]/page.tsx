"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { stageRepo } from "@/lib/firebase/repositories/stage.repo";
import { getGarmentTypes, GarmentType } from "@/lib/firebase/garment-types";
import { StageWithPrice } from "@/types/stage";
import { useStages } from "@/hooks/useStage";
import StageDrawer from "@/components/stages/StageDrawer";
import toast from "react-hot-toast";

export default function ManageStagePage() {
  const { materialId } = useParams<{ materialId: string }>();
  const router = useRouter();
  const { stages, loading, refresh } = useStages(materialId);

  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [search, setSearch] = useState("");
  const [filterTypeId, setFilterTypeId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: "add" | "edit";
    stage?: StageWithPrice | null;
  }>({ open: false, mode: "add" });

  useEffect(() => {
    getGarmentTypes().then(setGarmentTypes);
  }, []);

  // ── Filter ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return (stages as StageWithPrice[]).filter((s) => {
      const matchSearch = s.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchType = filterTypeId ? s.type_id === filterTypeId : true;
      return matchSearch && matchType;
    });
  }, [stages, search, filterTypeId]);

  const typeMap = useMemo(
    () => new Map(garmentTypes.map((t) => [t.id, t.name])),
    [garmentTypes],
  );

  // ── Handlers ─────────────────────────────────────────
  const handleDelete = useCallback(
    async (stage: StageWithPrice) => {
      if (
        !window.confirm(
          `Bạn chắc chắn muốn xóa công đoạn "${stage.name}"?\nThao tác này không thể hoàn tác.`,
        )
      )
        return;

      setDeletingId(stage.id);
      try {
        await stageRepo.delete(stage.id);
        toast.success(`Đã xóa "${stage.name}"`);
        refresh();
      } catch {
        toast.error("Xóa thất bại, vui lòng thử lại!");
      } finally {
        setDeletingId(null);
      }
    },
    [refresh],
  );

  const handleSaved = useCallback(async () => {
    const updatedStages = (await refresh()) as StageWithPrice[];
    return updatedStages;
  }, [refresh]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-semibold text-gray-800">
            Quản lý công đoạn
          </h1>
        </div>

        <button
          onClick={() => setDrawer({ open: true, mode: "add" })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
        >
          <Plus size={15} />
          Thêm công đoạn
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm tên công đoạn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] bg-gray-50"
          />
        </div>

        {/* Filter loại công đoạn */}
        <select
          value={filterTypeId}
          onChange={(e) => setFilterTypeId(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] bg-gray-50"
        >
          <option value="">Tất cả loại</option>
          {garmentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Result count */}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} công đoạn
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">
                  STT
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Tên công đoạn
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Loại
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Giá công ty
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Giá thị trường
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-sm text-gray-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-sm text-gray-400"
                  >
                    {search || filterTypeId
                      ? "Không tìm thấy công đoạn phù hợp"
                      : "Chưa có công đoạn nào"}
                  </td>
                </tr>
              ) : (
                filtered.map((stage, idx) => (
                  <tr
                    key={stage.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-gray-400 font-medium">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {stage.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        {typeMap.get(stage.type_id) ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {stage.price_company.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {stage.price_market.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() =>
                            setDrawer({ open: true, mode: "edit", stage })
                          }
                          title="Chỉnh sửa"
                          className="text-gray-300 hover:text-[#8B1A1A] transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(stage)}
                          disabled={deletingId === stage.id}
                          title="Xóa công đoạn"
                          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <StageDrawer
        open={drawer.open}
        mode={drawer.mode}
        stage={drawer.stage}
        onClose={() => setDrawer((prev) => ({ ...prev, open: false }))}
        garmentTypes={garmentTypes}
        defaultMaterialId={materialId}
        onSaved={handleSaved}
      />
    </div>
  );
}