import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Teacher } from '@/schemas'; // パスはプロジェクトに合わせてください
import TeacherInfoSection from './tabs/TeacherInfoSection';
import ActionButtons from '../../../components/ActionButtons';
import { useAdminData } from '@/contexts/providers/AdminDataProvider';

const TABS = ['基本情報', '担当情報', 'スケジュール', '支払情報'];

const TeacherDetail: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const { AdminDataContext } = useAdminData();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Teacher | null>(null);
    const [activeTab, setActiveTab] = useState('基本情報');

    useEffect(() => {
        if (teacher) setFormData(teacher);
    }, [teacher]);

    const handleChange = useCallback(() => {
        if (teacher) setFormData(teacher);
        setIsEditing(false);
    },
        [teacher]
    );

    const handleSave = useCallback(() => {
        setIsEditing(false);
    }, [formData]);

    const handleCancel = useCallback(() => {
        setFormData(teacher);
        setIsEditing(false);
    }, [teacher]);

    const handleDelete = useCallback(() => {
        if (window.confirm(`「${teacher?.fullname}」のデータを本当に削除しますか？`)) {
            // teacher.id は string なので、エラーなく呼び出せる
            console.log('削除ボタンが押されました');
        }
    }, [teacher]);

    const onBack = () => navigate(-1);

    const renderTabContent = () => {
        switch (activeTab) {
            case '基本情報':
                return (
                    <div className="flex gap-6">
                        {formData ? (
                            <TeacherInfoSection
                                formData={formData}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>読み込み中...</p>
                        )}
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
