// src/components/StudentDetail.js
import React, { useState } from 'react';
import StudentInfoSection from './StudentInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import ActionButtons from './ActionButtons';

const StudentDetail = ({ student, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...student });
    const [originalData, setOriginalData] = useState({ ...student }); // 編集前の保持用

    const handleEditClick = () => {
        setOriginalData(formData); // 編集前を保存
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(originalData); // 編集前に戻す
        setIsEditing(false);
    };

    const handleSaveClick = () => {
        // 保存処理は後で実装
        console.log("保存されました（仮）");
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 bg-white rounded shadow-md max-w-5xl mx-auto">
            {/* 上部ボタン */}
            <ActionButtons
                isEditing={isEditing}
                onBack={onBack}
                onEdit={handleEditClick}
                onCancel={handleCancelClick}
                onSave={handleSaveClick}
            />

            {/* メイン情報エリア */}
            <div className="flex mt-4">
                <StudentInfoSection
                    formData={formData}
                    isEditing={isEditing}
                    onChange={handleChange}
                />
                <GuardianInfoSection
                    formData={formData}
                    isEditing={isEditing}
                    onChange={handleChange}
                />
            </div>

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

export default StudentDetail;
