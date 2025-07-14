// src/components/SelectableStudentList.jsx
import { useState } from 'react';
import useFilteredStudents from '../hooks/useFilteredStudents';
import shortGrade from '../utils/shortGrade';
import { useAuth } from '../contexts/AuthContext.tsx';

export default function SelectableStudentList({ onStudentSelect }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { adminData, loading } = useAuth();
  const classroomCode = adminData?.classroomCode || '';

  const { filteredStudents, existingGrades } = useFilteredStudents(
    searchKeyword,
    gradeFilter,
    classroomCode
  );

  if (loading) return <div>読み込み中...</div>;
  if (!classroomCode) return <div>教室情報が取得できません</div>;

  return (
    <div className="inline-block">
      {/* 🔘 ボタン部分（横並び） */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          生徒選択
        </button>
        <input
          type="text"
          placeholder="生徒検索"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="p-2 border rounded text-sm w-40"
        />
      </div>

      {/* 🔽 展開部分（フィルター + 一覧） */}
      {isExpanded && (
        <div className="absolute z-50 border rounded p-3 bg-white shadow-md w-64">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="mb-2 p-1 border rounded w-full text-sm"
          >
            <option value="">すべての学年</option>
            {existingGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="overflow-y-auto max-h-60">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onStudentSelect(s.studentId || s.id);
                  setIsExpanded(false); // ✅ 選択後に閉じる
                }}
                className="p-1 mb-1 border rounded bg-blue-100 hover:bg-blue-200 cursor-pointer text-sm"
              >
                {`(${shortGrade(s.grade)}) ${s.lastName} ${s.firstName}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
