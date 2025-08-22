import { useState, ChangeEvent } from 'react';
import useFilteredStudents from '../../../contexts/hooks/useFilteredStudents';
import shortGrade from '../utils/shortGrade';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';

// 生徒データ型（必要に応じて拡張してください）
interface Student {
    id: string;
    studentId?: string;
    lastName: string;
    firstName: string;
    grade: string;
    classType?: string;
    duration?: string;
}

// useFilteredStudents の返り値型
interface UseFilteredStudentsReturn {
    filteredStudents: Student[];
    existingGrades: string[];
}

// useAdminData の返り値型
interface AdminData {
    classroomCode?: string;
}

interface UseAdminDataReturn {
    adminData: AdminData | null;
    loading: boolean;
}

export default function StudentList() {
    const [searchKeyword, setSearchKeyword] = useState < string > ('');
    const [gradeFilter, setGradeFilter] = useState < string > ('');

    const { adminData, loading }: UseAdminDataReturn = useAdminData(); // ✅ Contextからadmin情報を取得
    const classroomCode = adminData?.classroomCode || '';

    const { filteredStudents, existingGrades }: UseFilteredStudentsReturn = useFilteredStudents(
        searchKeyword,
        gradeFilter,
        classroomCode
    );

    if (loading) return <div>読み込み中...</div>;
    if (!classroomCode) return <div>教室情報が取得できません</div>;

    return (
        <div className="w-48 p-2 border bg-white rounded shadow text-sm">
            <h3 className="font-bold mb-2">生徒一覧</h3>

            <input
                type="text"
                placeholder="名前で検索"
                value={searchKeyword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchKeyword(e.target.value)}
                className="mb-2 p-1 border rounded w-full text-sm"
            />

            <select
                value={gradeFilter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setGradeFilter(e.target.value)}
                className="mb-2 p-1 border rounded w-full text-sm"
            >
                <option value="">すべての学年</option>
                {existingGrades.map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>

            <div className="overflow-y-auto max-h-[500px] pr-1">
                {filteredStudents.map((s) => {
                    console.log('🧾 生徒データ:', s);

                    return (
                        <div
                            key={s.id}
                            draggable
                            onDragStart={(e) =>
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify({
                                        student: {
                                            name: `${s.lastName} ${s.firstName}`,
                                            grade: shortGrade(s.grade),
                                            studentId: s.studentId || s.id,
                                            seat: '',
                                            subject: '',
                                            classType: s.classType || '',
                                            duration: s.duration || '',
                                        },
                                        fromPeriod: null,
                                    })
                                )
                            }
                            className="p-1 mb-1 border rounded bg-blue-100 hover:bg-blue-200 cursor-move"
                        >
                            {`(${shortGrade(s.grade)}) ${s.lastName} ${s.firstName}`}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
