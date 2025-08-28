import React from 'react';
// エイリアスを @/ に統一
import type { Teacher } from '@/schemas';
// デフォルトエクスポートを正しくインポートし、パスを修正
import useTeachers from '@/contexts/hooks/useTeachers';

/**
 * Propsの型定義
 */
interface TeacherListProps {
    // 一覧から教師が選択されたときに呼び出される関数
    onSelectTeacher: (teacher: Teacher) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ onSelectTeacher }) => {
    // カスタムフックから教師データ、ロード状態、エラーを取得
    // useTeachersフックは classroomCode を引数に取れますが、ここでは渡さずに全ての講師を取得
    const { teachers, loading, error } = useTeachers();

    if (loading) {
        return <div className="text-center p-10">データを読み込み中...</div>;
    }

    // errorはオブジェクトの可能性があるため、より安全に表示
    if (error) {
        return <div className="text-center p-10 text-red-600">エラーが発生しました。</div>;
    }

    if (!teachers || teachers.length === 0) {
        return <div className="text-center p-10 text-gray-500">該当する講師がいません。</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {teachers.map((teacher: Teacher) => (
                    <li
                        key={teacher.id} // keyはteacher.uidの方が適切かもしれません
                        className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => onSelectTeacher(teacher)}
                    >
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{teacher.fullname}</p>
                            <p className="text-sm text-gray-600">
                                {teacher.lastNameKana} {teacher.firstNameKana}
                            </p>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeacherList;
