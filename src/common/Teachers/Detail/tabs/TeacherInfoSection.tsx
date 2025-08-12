import React from 'react';
// エイリアスを @/ に統一して型をインポート
import type { Teacher } from '@/schemas';

/**
 * Propsの型定義
 */
interface TeacherInfoSectionProps {
    // 表示・編集対象のフォームデータ
    formData: Partial<Teacher>;
    // 現在編集モードであるかどうかのフラグ
    isEditing: boolean;
    // フォームの入力値が変更されたときに呼び出される関数
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TeacherInfoSection: React.FC<TeacherInfoSectionProps> = ({ formData, isEditing, onChange }) => {
    return (
        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* --- 姓（カナ） --- */}
                <div>
                    <label htmlFor="kanalast" className="block text-sm font-medium text-gray-700 mb-1">
                        姓（カナ）
                    </label>
                    <input
                        type="text"
                        id="kanalast"
                        name="kanalast"
                        value={formData.kanalast || ''}
                        onChange={onChange}
                        readOnly={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        disabled={!isEditing}
                    />
                </div>

                {/* --- 名（カナ） --- */}
                <div>
                    <label htmlFor="kanafirst" className="block text-sm font-medium text-gray-700 mb-1">
                        名（カナ）
                    </label>
                    <input
                        type="text"
                        id="kanafirst"
                        name="kanafirst"
                        value={formData.kanafirst || ''}
                        onChange={onChange}
                        readOnly={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        disabled={!isEditing}
                    />
                </div>

                {/* --- 他の項目もここに追加 --- */}
            </div>
        </div>
    );
};

export default TeacherInfoSection;
