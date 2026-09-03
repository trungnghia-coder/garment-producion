"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { getMaterials } from "@/lib/firebase/materials";
import { Material } from "@/types/material";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

interface MaterialPickerProps {
  basePath: string;
  title?: string;
}

export default function MaterialPicker({ basePath, title = "Chọn chất liệu" }: MaterialPickerProps) {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [inputName, setInputName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchMaterials = () => {
    setLoading(true);
    getMaterials().then(setMaterials).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMaterials(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setInputName("");
    setDialogOpen(true);
  };

  const openEdit = (mat: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(mat);
    setInputName(mat.name);
    setDialogOpen(true);
  };

  const handleDelete = async (mat: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn chắc chắn muốn xóa chất liệu "${mat.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "materials", mat.id));
      toast.success(`Đã xóa "${mat.name}"`);
      fetchMaterials();
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleSave = async () => {
    if (!inputName.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateDoc(doc(db, "materials", editTarget.id), {
          name: inputName.trim(),
          updatedAt: new Date(),
        });
        toast.success("Đã cập nhật chất liệu!");
      } else {
        await addDoc(collection(db, "materials"), {
          name: inputName.trim(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success("Đã thêm chất liệu!");
      }
      setDialogOpen(false);
      fetchMaterials();
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors"
          >
            <Plus size={15} />
            Thêm
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {materials.map((mat) => (
              <div key={mat.id} className="relative group">
                <button
                  onClick={() => router.push(`${basePath}/${mat.id}`)}
                  className="w-full flex items-center justify-center h-32 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-800 font-semibold text-lg hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors"
                >
                  {mat.name}
                </button>

                {/* Edit + Delete — hiện khi hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEdit(mat, e)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#8B1A1A] hover:border-[#8B1A1A] transition-colors shadow-sm"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(mat, e)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
                    title="Xóa"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dialog thêm / edit */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                {editTarget ? "Chỉnh sửa chất liệu" : "Thêm chất liệu"}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <label className="text-sm font-medium text-gray-700 block mb-1">Tên chất liệu</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="VD: Lụa, Tole, Nhung..."
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!inputName.trim() || saving}
                className="flex-1 py-2 text-sm text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {editTarget ? "Lưu" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}