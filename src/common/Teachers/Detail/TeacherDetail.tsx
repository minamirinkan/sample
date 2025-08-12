import React, { useState, useCallback } from 'react';
// Zodで定義されたスキーマと型をインポート
import type { Teacher } from '@/schemas'; // パスはプロジェクトに合わせてください
import TeacherInfoSection from '@/common/Teachers/Detail/tabs/TeacherInfoSection';

/**
 * Propsの型定義
 */
interface TeacherDetailProps {
    // 表示対象の教師データ
    teacher: Teacher;
    // 「戻る」ボタンが押されたときのコールバック
    onBack: () => void;
    // データの保存が要求されたときのコールバック
    onSave: (updatedTeacher: Teacher) => void;
    // データの削除が要求されたときのコールバック
    // ★★★★★ 修正点 ★★★★★
    onDelete: (teacherId: string) => void; // teacher.idがstringなので、stringを受け取るように修正
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ teacher, onBack, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Teacher>(teacher);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSave = useCallback(() => {
        // ここでZodを使ったバリデーションを入れるのが理想的
        onSave(formData);
        setIsEditing(false);
    }, [formData, onSave]);

    const handleCancel = useCallback(() => {
        setFormData(teacher);
        setIsEditing(false);
    }, [teacher]);

    const handleDelete = useCallback(() => {
        if (window.confirm(`「${teacher.name}」のデータを本当に削除しますか？`)) {
            // teacher.id は string なので、エラーなく呼び出せる
            onDelete(teacher.id);
        }
    }, [teacher, onDelete]);

    return (
        <div className="container mx-auto p-4">
            {/* --- ヘッダーと操作ボタン --- */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{isEditing ? '講師情報の編集' : '講師の詳細'}</h2>
                <div>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2">
                                保存
                            </button>
                            <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
                                キャンセル
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onBack} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mr-2">
                                一覧へ戻る
                            </button>
                            <button onClick={() => setIsEditing(true)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                                編集
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* --- メインコンテンツ --- */}
            <div className="space-y-6">
                <TeacherInfoSection
                    formData={formData}
                    isEditing={isEditing}
                    onChange={handleChange}
                />
            </div>

            {/* --- フッターと削除ボタン --- */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                {!isEditing && (
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        この講師を削除
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeacherDetail;
