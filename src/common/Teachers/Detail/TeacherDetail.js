// src/components/TeacherDetail
import React, { useState } from 'react';
import TeacherInfoSection from './tabs/TeacherInfoSection';
import ActionButtons from './ActionButtons';

const TABS = ['基本情報', '担当情報', 'スケジュール', '支払情報'];

const TeacherDetail = ({ teacher, onBack }) => {
    const [activeTab, setActiveTab] = useState('基本情報');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(teacher);
    const [originalData, setOriginalData] = useState(teacher); // ← 追加

    const handleEditClick = () => {
        setOriginalData(formData); // ← 編集開始時点のデータを保持
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(originalData);  // ← 編集前の状態に戻す
        setIsEditing(false);        // ← 編集モード解除
    };

    const handleSaveClick = () => {
        console.log('講師情報を保存（仮）');
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
            case 'スケジュール':
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
                                ? 'border-blue-600 text-blue-700 bg-white'
                                : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ボタン */}
            <ActionButtons
                isEditing={isEditing}
                onBack={onBack}
                onEdit={handleEditClick}
                onCancel={handleCancelClick}
                onSave={handleSaveClick}
            />

            {/* メイン内容 */}
            <div className="mt-4">{renderTabContent()}</div>

            {/* 下部ボタン */}
            <div className="mt-6">
                <ActionButtons
                    isEditing={isEditing}
                    onBack={onBack}
                    onEdit={handleEditClick}
                    onCancel={handleCancelClick}
                    onSave={handleSaveClick}
                />
            </div>
        </div>
    );
};

export default TeacherDetail;
