import { useState } from 'react';
import useFilteredStudents from '../../../contexts/hooks/useFilteredStudents';
import shortGrade from '../utils/shortGrade';
import { useAuth } from '../../../contexts/AuthContext';
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
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const { userData } = useAuth();
    const { loading }: UseAdminDataReturn = useAdminData(); // ✅ Contextからadmin情報を取得
    const classroomCode = userData?.classroomCode || '';
    const { filteredStudents, existingGrades }: UseFilteredStudentsReturn = useFilteredStudents(
        searchKeyword,
        gradeFilter,
        classroomCode
    );
    const gradeOrder = ['小', '中', '高']; // 優先順

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        const getGradeIndex = (grade: string) => {
            const prefix = grade.charAt(0); // 「小」「中」「高」を取得
            return gradeOrder.indexOf(prefix);
        };

        // 学年順で比較
        const gradeDiff = getGradeIndex(a.grade) - getGradeIndex(b.grade);
        if (gradeDiff !== 0) return gradeDiff;

        // 同じ学年内なら数字順（例: 小1, 小2）
        const numA = parseInt(a.grade.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.grade.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
    });

    if (loading) return <div>読み込み中...</div>;
    if (!classroomCode) return <div>教室情報が取得できません</div>;

    return (
        <div className="p-4 w-[500px] mx-auto">
            <h3 className="font-bold text-lg mb-3 text-center border-b pb-1">生徒一覧</h3>

            <input
                type="text"
                placeholder="名前で検索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="mb-2 p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="mb-3 p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                <option value="">すべての学年</option>
                {existingGrades.map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>

            {/* 横幅いっぱいではなく中央揃え */}
            <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    {sortedStudents.map((s) => (
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
                            className="flex justify-between items-center p-1 border rounded bg-blue-50 hover:bg-blue-100 cursor-move text-sm"
                        >
                            <span>{`${s.lastName} ${s.firstName}`}</span>
                            <span className="text-xs px-1 py-0.5 bg-blue-200 rounded-full font-semibold">
                                {shortGrade(s.grade)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
