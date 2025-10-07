// src/common/StudentsSchedule/StudentListButton.tsx
import { useState, useMemo } from "react";
import useFilteredStudents from "../../../contexts/hooks/useFilteredStudents";
import shortGrade from "../../timetable/utils/shortGrade";
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminData } from "../../../contexts/providers/AdminDataProvider";

// 生徒データ型
interface Student {
  id: string;
  studentId?: string;
  lastName: string;
  firstName: string;
  grade: string;
  classType?: string;
  duration?: string;
}

// hook返り値
interface UseFilteredStudentsReturn {
  filteredStudents: Student[];
  existingGrades: string[];
}
interface AdminData {
  classroomCode?: string;
}
interface UseAdminDataReturn {
  adminData: AdminData | null;
  loading: boolean;
}

export default function StudentListButton() {
  const [open, setOpen] = useState(false);

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const { userData } = useAuth();
  const { loading }: UseAdminDataReturn = useAdminData();
  const classroomCode = userData?.classroomCode || "";
  const { filteredStudents, existingGrades }: UseFilteredStudentsReturn =
    useFilteredStudents(searchKeyword, gradeFilter, classroomCode);

  // 並び替え
  const gradeOrder = ["小", "中", "高"];
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const idx = (g: string) => gradeOrder.indexOf(g.charAt(0));
      const diff = idx(a.grade) - idx(b.grade);
      if (diff !== 0) return diff;
      const numA = parseInt(a.grade.match(/\d+/)?.[0] || "0", 10);
      const numB = parseInt(b.grade.match(/\d+/)?.[0] || "0", 10);
      return numA - numB;
    });
  }, [filteredStudents]);

  // 選択状態
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) return <div>読み込み中...</div>;
  if (!classroomCode) return <div>教室情報が取得できません</div>;

  return (
    <>
      {/* ボタン */}
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded"
      >
        生徒一覧を開く
      </button>

      {/* モーダル */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 w-[640px] max-h-[80vh] overflow-y-auto relative">
            {/* 閉じる */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>

            {/* タイトル */}
            <h3 className="font-bold text-lg mb-3 text-center border-b pb-1">
              生徒一覧（選択式）
            </h3>

            {/* 検索・学年フィルタ */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="名前で検索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-40 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">すべての学年</option>
                {existingGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* リスト */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {sortedStudents.map((s) => {
                const id = s.studentId || s.id;
                const selected = selectedIds.has(id);
                return (
                  <div
                    key={id}
                    onClick={() => toggleSelect(id)}
                    className={`flex justify-between items-center p-2 border rounded cursor-pointer text-sm ${
                      selected
                        ? "bg-blue-100 border-blue-400"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span>{`${s.lastName} ${s.firstName}`}</span>
                    <span className="text-xs px-1 py-0.5 bg-blue-200 rounded-full font-semibold">
                      {shortGrade(s.grade)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* フッター */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1 rounded border bg-white hover:bg-gray-50"
              >
                解除
              </button>
              <button
                onClick={() => {
                  const selected = sortedStudents.filter((s) =>
                    selectedIds.has(s.studentId || s.id)
                  );
                  console.log("✅ 選択された生徒:", selected);
                  setOpen(false);
                }}
                disabled={selectedIds.size === 0}
                className={`px-3 py-1 rounded text-white ${
                  selectedIds.size === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                決定（{selectedIds.size}）
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
