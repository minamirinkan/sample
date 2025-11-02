import React, { useState } from "react";
import { generateTuitionName } from "./tuitionName";

export interface BillingCode {
    code: string;
    name: string;
    category: string;
    amount: number;
}

interface BillingCodeSearchModalProps {
    open: boolean;
    onClose: () => void;
    options: BillingCode[];
    onSelect: (selected: BillingCode) => void;
    studentGrade: string;
    month: string;
    customerUid: string;
    studentId: string;
}

const categories = [
    "入会金",
    "授業料",
    "授業料(補習)",
    "維持費",
    "テスト",
    "教材",
    "教材(都度)",
    "割引",
    "違約金",
];

const BillingCodeSearchModal: React.FC<BillingCodeSearchModalProps> = ({
    open,
    onClose,
    options,
    onSelect,
    month,
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    if (!open) return null;

    const filteredOptions = options;
    const transformedOptions = filteredOptions.map(opt => {
        let displayName = opt.name;

        // 授業料は generateTuitionName で表示名を加工
        if (opt.category === "授業料") {
            displayName = generateTuitionName(opt.code, month);
        }

        // 🔹 授業料(補習)は generateTuitionName の授業料部分を "(補習)" に置換
        if (opt.category === "授業料(補習)") {
            displayName = generateTuitionName(opt.code, month, true);
        }

        // 維持費は「◯月分」を付ける
        if (opt.category === "維持費") {
            const yyyymm = parseInt(month.slice(4, 6), 10);
            displayName = `${yyyymm}月分${opt.name}`;
        }

        // amount は handleSearchCode ですでに保証されているので undefined チェック不要
        const displayAmount = opt.amount.toLocaleString() + "円";

        return { ...opt, name: displayName, displayAmount };
    });

    const handleClose = (): void => {
        if (expandedCategory) {
            setExpandedCategory(null);
            setTimeout(() => onClose(), 300);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 p-6 overflow-auto">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold px-6 py-4 border-b border-gray-200">
                    請求コード選択
                </h2>

                <div className="space-y-3 p-4">
                    {categories.map((cat) => {
                        const codes = transformedOptions.filter((o) => o.category === cat);
                        const isExpanded = expandedCategory === cat;

                        return (
                            <div
                                key={cat}
                                className="rounded-lg overflow-hidden border border-gray-200"
                            >
                                {/* カテゴリ名 */}
                                <button
                                    className={`w-full text-left px-4 py-3 font-semibold text-gray-800 transition-colors duration-200 ${isExpanded
                                        ? "bg-blue-100"
                                        : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                    onClick={() =>
                                        setExpandedCategory(isExpanded ? null : cat)
                                    }
                                >
                                    {cat}
                                </button>

                                {/* コードリスト（表風） */}
                                <div
                                    className={`transition-[max-height] duration-300 ease-in-out ${isExpanded ? "max-h-[70vh]" : "max-h-0"}`}
                                >
                                    <table className="w-full border-separate border-spacing-0">
                                        <tbody>
                                            {codes.map((opt, idx) => (
                                                <tr
                                                    key={opt.code}
                                                    className={`cursor-pointer transition-colors duration-150 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                        } hover:bg-blue-50`}
                                                    onClick={() => onSelect(opt)}
                                                >
                                                    <td className="px-4 py-2 border-b border-gray-300 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {opt.name}
                                                    </td>
                                                    <td className="px-4 py-2 border-b border-gray-300 text-gray-700 whitespace-nowrap text-right">
                                                        {opt.displayAmount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="px-4 pb-4">
                    <button
                        className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={handleClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingCodeSearchModal;
