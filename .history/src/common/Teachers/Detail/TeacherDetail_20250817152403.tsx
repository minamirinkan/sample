import React, { useState, useCallback } from 'react';
// Zodで定義されたスキーマと型をインポート
import type { Teacher } from '@/schemas'; // パスはプロジェクトに合わせてください
import TeacherInfoSection from './tabs/TeacherInfoSection';
import ActionButtons from '../../../components/ActionButtons';

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

const TABS = ['基本情報', '担当情報', 'スケジュール', '支払情報'];

const TeacherDetail: React.FC<TeacherDetailProps> = ({ teacher, onBack, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Teacher>(teacher);
    const [activeTab, setActiveTab] = useState('基本情報');

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev: Teacher) => ({
                ...prev,
                [name]: value,
            }));
        },
        []
    );

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
        if (window.confirm(`「${teacher.fullname}」のデータを本当に削除しますか？`)) {
            // teacher.id は string なので、エラーなく呼び出せる
            onDelete(teacher.code);
        }
    }, [teacher, onDelete]);

    const renderTabContent = () => {
        switch (activeTab) {
            case '基本情報':
                return (
                    <div className="flex gap-6">
                        <TeacherInfoSection
                            formData={formData}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />
                    </div>
                );
            case '担当情報':
                return (
                    <div className="text-gray-500 italic">このセクションは現在準備中です。</div>
                );
            case 'スケジュール':
                return (
                    <div className="text-gray-500 italic">このセクションは現在準備中です。</div>
                );
            case '支払情報':
                return (
                    <div className="text-gray-500 italic">このセクションは現在準備中です。</div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow-md max-w-5xl mx-auto">
            {/* タイトル */}
            <div className="flex items-center mb-4 space-x-6">
                <h1 className="text-2xl font-bold text-gray-800">講師マスタ</h1>
                <span className="text-2xl text-gray-500 font-normal">詳細</span>
            </div>

            {/* タブ */}
            <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
                            ${activeTab === tab
                                ? 'border-green-600 text-green-700 bg-white'
                                : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-400'
                            }
                        `}
                        onClick={() => setActiveTab(tab)}
                        aria-selected={activeTab === tab}
                        role="tab"
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {/* --- ボタン（上） --- */}
            {activeTab === '基本情報' && (
                <ActionButtons
                    isEditing={isEditing}
                    onBack={onBack}
                    onEdit={() => setIsEditing(true)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
            {/* --- メインコンテンツ --- */}
            <div className="mt-4">{renderTabContent()}</div>

            {/* --- ボタン（下） --- */}
            {activeTab === '基本情報' && (
                <div className="mt-6">
                    <ActionButtons
                        isEditing={isEditing}
                        onBack={onBack}
                        onEdit={() => setIsEditing(true)}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default TeacherDetail;
