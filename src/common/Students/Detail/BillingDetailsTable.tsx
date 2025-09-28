// src/pages/Students/Detail/BillingDetailsTable.tsx
import React, { useState, useRef } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import BillingCodeSearchModal, { BillingCode } from "./BillingCodeSearchModal";
import { FaTrash } from "react-icons/fa";
import { formatCodeForDisplay, generateTuitionName, generateTuitionNameShort } from "./tuitionName";
import { FeeLesson } from "./BillingPage";
export interface BillingDetail {
    code: string;
    name: string;
    taxType: string;
    price: number;
    qty: number;
    total: number;
    note: string;
}

interface BillingDetailsTableProps {
    details: BillingDetail[];
    isEditing: boolean;
    onChange: (index: number, field: keyof BillingDetail, value: string | number) => void;
    onDragEnd?: (result: DropResult) => void;
    onDeleteRow: (index: number) => void;
    studentGrade: string;
    month: string;
    customerUid: string;
    studentId: string;
    studentLessons: FeeLesson[];
}

const BillingDetailsTable: React.FC<BillingDetailsTableProps> = ({
    details,
    isEditing,
    onChange,
    onDragEnd,
    onDeleteRow,
    studentGrade,
    month,
    customerUid,
    studentId,
    studentLessons,
}) => {
    const [searchIndex, setSearchIndex] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [columnWidths, setColumnWidths] = useState<number[]>([]);
    const tableRef = useRef<HTMLTableElement>(null);

    const [searchOptions, setSearchOptions] = useState<BillingCode[]>([]);

    const handleSearchCode = async (index: number) => {
        setSearchIndex(index);
        setModalOpen(true);

        try {
            const yyyymm = "202509";
            const registrationLocation = "047";
            const feeMasterDocId = `${yyyymm}_${registrationLocation}`;
            const feeMasterRef = doc(db, "FeeMaster", feeMasterDocId);

            const categories = ["tuition", "discount", "maintenance", "material", "penalty", "test"];
            let allOptions: BillingCode[] = [];

            for (const category of categories) {
                const categoryRef = doc(collection(feeMasterRef, "categories"), category);
                const categorySnap = await getDoc(categoryRef);
                if (!categorySnap.exists()) continue;

                const data = categorySnap.data() || {};

                if (category === "tuition") {
                    // 生徒が契約している授業だけ
                    const tuitionOptions: BillingCode[] = studentLessons.map((lesson) => ({
                        code: lesson.feeCode,
                        name: lesson.lessonType === "通常" ? "授業料" : lesson.lessonType,
                        category: "授業料",
                        amount: lesson.amount,
                    }));
                    allOptions = [...allOptions, ...tuitionOptions];
                } else {
                    const otherOptions: BillingCode[] = Object.entries(data).map(
                        ([code, v]: [string, any]) => ({
                            code,
                            name: v.item || code,
                            category:
                                category === "discount"
                                    ? "割引"
                                    : category === "maintenance"
                                        ? "維持費"
                                        : category === "material"
                                            ? "教材"
                                            : category === "penalty"
                                                ? "違約金"
                                                : category === "test"
                                                    ? "テスト"
                                                    : "その他",
                            amount: v.amount,
                        })
                    );
                    allOptions = [...allOptions, ...otherOptions];
                }
            }

            setSearchOptions(allOptions);
        } catch (err) {
            console.error(err);
            alert("データ取得に失敗しました");
        }
    };

    const handleSelectCode = (selected: BillingCode) => {
        if (searchIndex === null) return;

        // コード更新
        onChange(searchIndex, "code", selected.code);

        // 編集中かどうかで名前を分岐
        const displayName =
            isEditing && selected.category === "授業料"
                ? generateTuitionNameShort(selected.code, month)
                : selected.name;

        onChange(searchIndex, "name", displayName);
        if (selected.amount !== undefined) {
            onChange(searchIndex, "price", selected.amount);
            onChange(searchIndex, "total", selected.amount); // 数量1前提
        }

        setSearchIndex(null);
        setModalOpen(false);
    };

    // ドラッグ開始前に各列幅を取得
    const handleBeforeCapture = () => {
        if (!tableRef.current) return;
        const headerCells = tableRef.current.querySelectorAll('thead th');
        const widths: number[] = [];
        headerCells.forEach((th) => widths.push(th.getBoundingClientRect().width));
        // 常に 8 列分に揃える（操作列含む）
        while (widths.length < 8) widths.push(0);
        setColumnWidths(widths);
    };

    const isTuitionCode = (code?: string) => {
        if (!code) return false;
        const parts = code.split("_");
        return parts.length >= 4 && (parts[0] === "W" || parts[0] === "A");
    };

    const renderRow = (d: BillingDetail, index: number) => {
        // ✅ 各行ごとに displayName を決定
        const displayName = isTuitionCode(d.code)
            ? (isEditing
                ? generateTuitionNameShort(d.code, month) // 編集モードなら short
                : generateTuitionName(d.code, month))     // 通常モードなら long
            : d.name;
        return (
            <Draggable draggableId={d.code + index} index={index} key={d.code + index}>
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(isEditing ? provided.dragHandleProps : {})}
                        className={`border border-gray-200 ${snapshot.isDragging ? "z-10 bg-gray-100" : "z-0"}`}
                        style={{ ...provided.draggableProps.style, display: "table-row" }}
                    >
                        <td
                            className="border px-2 py-1 whitespace-nowrap"
                            style={columnWidths[0] ? { width: columnWidths[0] } : undefined}
                        >
                            <div className="flex items-center justify-between">
                                <span>{formatCodeForDisplay(d.code)}</span>
                                {isEditing && (
                                    <button
                                        className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 ml-2"
                                        onClick={() => handleSearchCode(index)}
                                    >
                                        検索
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[1] ? { width: columnWidths[1] } : undefined}>{displayName}</td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[2] ? { width: columnWidths[2] } : undefined}>{d.taxType}</td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[3] ? { width: columnWidths[3] } : undefined}>{d.price.toLocaleString()}</td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[4] ? { width: columnWidths[4] } : undefined}>{d.qty}</td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[5] ? { width: columnWidths[5] } : undefined}>{d.total.toLocaleString()}</td>
                        <td className="border px-2 py-1 whitespace-nowrap" style={columnWidths[6] ? { width: columnWidths[6] } : undefined}>{d.note}</td>

                        {/* 操作列: 編集時だけボタン表示、ドラッグ中は空セルで幅を保持 */}
                        {(isEditing || snapshot.isDragging) && (
                            <td className="border px-2 py-1 whitespace-nowrap text-center" style={columnWidths[7] ? { width: columnWidths[7] } : undefined}>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => onDeleteRow(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </td>
                        )}
                    </tr>
                )}
            </Draggable>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table
                    ref={tableRef}
                    className="table-auto border-separate border-spacing-0 w-full"
                >
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border px-2 py-1 whitespace-nowrap">コード</th>
                            <th className="border px-2 py-1 whitespace-nowrap">項目名</th>
                            <th className="border px-2 py-1 whitespace-nowrap">課税区分</th>
                            <th className="border px-2 py-1 whitespace-nowrap">税抜単価</th>
                            <th className="border px-2 py-1 whitespace-nowrap">数量</th>
                            <th className="border px-2 py-1 whitespace-nowrap">税抜金額</th>
                            <th className="border px-2 py-1 whitespace-nowrap">備考</th>
                            {isEditing && <th className="border p-2">削除</th>}
                        </tr>
                    </thead>

                    <DragDropContext
                        onDragEnd={onDragEnd ?? (() => { })}
                        onBeforeCapture={handleBeforeCapture}
                    >
                        <Droppable droppableId="billingDetails" type="TABLE">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="relative">
                                    {details.map(renderRow)}
                                    {provided.placeholder}
                                    {/* 最下行の縦線保持用ダミー行 */}
                                    <tr>
                                        {Array(8)
                                            .fill(0)
                                            .map((_, i) => (
                                                <td
                                                    key={i}
                                                    className="h-0 p-0 m-0"
                                                    style={columnWidths[i] ? { width: columnWidths[i] } : undefined}
                                                />
                                            ))}
                                    </tr>
                                </tbody>
                            )}
                        </Droppable>
                    </DragDropContext>
                </table>
            </div>

            <BillingCodeSearchModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                options={searchOptions}
                onSelect={handleSelectCode}
                studentGrade={studentGrade}
                month={month}
                customerUid={customerUid}
                studentId={studentId}
            />
        </>
    );
};

export default BillingDetailsTable;
