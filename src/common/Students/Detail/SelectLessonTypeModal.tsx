// src/common/Students/Detail/SelectLessonTypeModal.tsx
import React from "react";

interface SelectLessonTypeModalProps {
    onClose: () => void;
    onSelect: (type: "通常" | "補習" | "春季講習" | "夏季講習" | "冬季講習") => void;
}

const SelectLessonTypeModal: React.FC<SelectLessonTypeModalProps> = ({
    onClose,
    onSelect,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold text-center mb-4">
                    授業種別を選択
                </h2>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onSelect("通常")}
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        通常
                    </button>
                    <button
                        onClick={() => onSelect("補習")}
                        className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        補習
                    </button>
                    <button
                        onClick={() => onSelect("春季講習")}
                        className="bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition"
                    >
                        春季講習
                    </button>
                    <button
                        onClick={() => onSelect("夏季講習")}
                        className="bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-700 transition"
                    >
                        夏季講習
                    </button>
                    <button
                        onClick={() => onSelect("冬季講習")}
                        className="bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
                    >
                        冬季講習
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-500 hover:text-gray-700 text-sm block mx-auto"
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
};

export default SelectLessonTypeModal;
