// src/pages/Students/Detail/BillingDetailsTable.tsx
import React, { useState, useRef } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import BillingCodeSearchModal, { BillingCode } from "./BillingCodeSearchModal";
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
    studentGrade: string;
    month: string;
    customerUid: string;
    studentId: string;
}

const BillingDetailsTable: React.FC<BillingDetailsTableProps> = ({
    details,
    isEditing,
    onChange,
    onDragEnd,
    studentGrade,
    month,
    customerUid,
    studentId,
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
            const yyyymm = "202509"; // 適宜 targetMonth に置き換え
            const registrationLocation = "047"; // 適宜 classroomCode に置き換え
            const feeMasterDocId = `${yyyymm}_${registrationLocation}`;
            const feeMasterRef = doc(db, "FeeMaster", feeMasterDocId);
            const tuitionRef = doc(collection(feeMasterRef, "categories"), "tuition");
            const tuitionSnap = await getDoc(tuitionRef);

            if (!tuitionSnap.exists()) {
                console.log("tuitionが存在しません");
                return;
            }

            const tuitionData = tuitionSnap.data() || {};

            // Firestore のデータを BillingCode 形式に変換
            const options: BillingCode[] = Object.entries(tuitionData).map(([code, v]: [string, any]) => ({
                code,
                name: v.lessonType === "通常" ? "授業料" : v.lessonType,
                category: "授業料",
            }));

            setSearchOptions(options); // useState で searchOptions を保持しておく
        } catch (err) {
            console.error(err);
            alert("授業料データの取得に失敗しました");
        }
    };

    const handleSelectCode = (code: string) => {
        if (searchIndex === null) return;
        onChange(searchIndex, "code", code);
        setSearchIndex(null);
        setModalOpen(false);
    };

    // ドラッグ開始前に各列幅を取得
    const handleBeforeCapture = () => {
        if (!tableRef.current) return;
        const headerCells = tableRef.current.querySelectorAll('thead th');
        const widths: number[] = [];
        headerCells.forEach((th) => widths.push(th.getBoundingClientRect().width));
        setColumnWidths(widths);
    };

    const renderRow = (d: BillingDetail, index: number) => (
        <Draggable draggableId={d.code + index} index={index} key={d.code + index}>
            {(provided, snapshot) => (
                <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...(isEditing ? provided.dragHandleProps : {})}
                    className={`border border-gray-200 ${snapshot.isDragging ? "z-10 bg-gray-100" : "z-0"
                        }`}
                    style={{ ...provided.draggableProps.style, display: "table-row" }}
                >
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[0] ? { width: columnWidths[0] } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <span>{d.code}</span>
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
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[1] ? { width: columnWidths[1] } : undefined}
                    >
                        {d.name}
                    </td>
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[2] ? { width: columnWidths[2] } : undefined}
                    >
                        {d.taxType}
                    </td>
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[3] ? { width: columnWidths[3] } : undefined}
                    >
                        {d.price}
                    </td>
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[4] ? { width: columnWidths[4] } : undefined}
                    >
                        {d.qty}
                    </td>
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[5] ? { width: columnWidths[5] } : undefined}
                    >
                        {d.total}
                    </td>
                    <td
                        className="border px-2 py-1 whitespace-nowrap"
                        style={columnWidths[6] ? { width: columnWidths[6] } : undefined}
                    >
                        {d.note}
                    </td>
                </tr>
            )}
        </Draggable>
    );

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
                            <th className="border px-2 py-1 whitespace-nowrap">税込金額</th>
                            <th className="border px-2 py-1 whitespace-nowrap">備考</th>
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
                                        {Array(7)
                                            .fill(0)
                                            .map((_, i) => (
                                                <td
                                                    key={i}
                                                    className="border border-gray-200 h-0 p-0 m-0"
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
