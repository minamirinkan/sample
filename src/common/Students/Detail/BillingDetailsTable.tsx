import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import BillingCodeSearchModal, { BillingCode } from "./BillingCodeSearchModal";
import { FaTrash } from "react-icons/fa";
import { formatCodeForDisplay, generateTuitionName, generateTuitionNameShort } from "./tuitionName";
import { BillingDetail, FeeLesson } from "./BillingDetails";
import { Customer } from "../../../contexts/types/customer";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

interface BillingDetailsTableProps {
    details: BillingDetail[];
    isEditing: boolean;
    onChange: (index: number, field: keyof BillingDetail, value: string | number) => void;
    onDragEnd?: (result: DropResult) => void;
    onDeleteRow: (index: number) => void;
    studentGrade: string;
    month: string;
    customer: Customer;
    studentId: string;
}

const BillingDetailsTable: React.FC<BillingDetailsTableProps> = ({
    details,
    isEditing,
    onChange,
    onDragEnd,
    onDeleteRow,
    studentGrade,
    month,
    customer,
    studentId,
}) => {
    const [searchIndex, setSearchIndex] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [columnWidths, setColumnWidths] = useState<number[]>([]);
    const [searchOptions, setSearchOptions] = useState<BillingCode[]>([]);
    const tableRef = useRef<HTMLTableElement>(null);

    const customerUid = customer?.uid;
    const classroomCode = customer?.classroomCode || "000";

    // 🔍 請求項目コード検索
    const handleSearchCode = async (index: number) => {
        setSearchIndex(index);
        setModalOpen(true);

        try {
            // まず契約情報を取得
            const contractsSnap = await getDocs(collection(db, "customers", customerUid, "contracts"));
            const studentLessons: FeeLesson[] = [];

            contractsSnap.forEach((doc) => {
                const data = doc.data();

                if (data.studentId === studentId && (data.lessonType === "通常" || data.lessonType === "補習")) {
                    studentLessons.push({
                        feeCode: data.feeCode,
                        lessonType: data.lessonType,
                        amount: data.amount,
                        classType: data.classType,
                        duration: data.duration,
                        grade: data.grade,
                        times: data.times,
                    });
                }
            });

            // FeeMaster の最新データを取得（targetMonth以前）
            const code = classroomCode || "000";
            const feeMasterSnap = await getDocs(collection(db, "FeeMaster"));

            let latestFeeMasterDoc: any = null;
            let latestYyyymm = "";
            feeMasterSnap.forEach((doc) => {
                const [yyyymm, classroom] = doc.id.split("_");
                if (classroom === code && yyyymm <= month && yyyymm > latestYyyymm) {
                    latestYyyymm = yyyymm;
                    latestFeeMasterDoc = doc;
                }
            });

            if (!latestFeeMasterDoc) {
                alert("FeeMaster が見つかりません");
                return;
            }

            // カテゴリごとにFeeMasterを展開
            const categories = ["admission", "tuition", "discount", "maintenance", "material", "penalty", "test", "extra"];
            let allOptions: BillingCode[] = [];

            for (const category of categories) {
                if (category === "tuition") {
                    // 🟦 tuition ドキュメントを取得
                    const tuitionDocRef = doc(latestFeeMasterDoc.ref, "categories", "tuition");
                    const tuitionDocSnap = await getDoc(tuitionDocRef);

                    if (tuitionDocSnap.exists()) {
                        const tuitionData = tuitionDocSnap.data();

                        // 🟩 顧客契約（contracts）に含まれる feeCode のみ抽出
                        const targetFeeCodes = studentLessons.map((lesson) => lesson.feeCode);

                        const tuitionOptions: BillingCode[] = Object.entries(tuitionData)
                            .filter(([code]) => targetFeeCodes.includes(code)) // ← ここがポイント！
                            .map(([code, v]: [string, any]) => ({
                                code,
                                name: generateTuitionName(code, month),
                                category: "授業料",
                                amount: v.amount ?? 0,
                            }));

                        allOptions = [...allOptions, ...tuitionOptions];
                    } else {
                        console.warn("⚠️ tuition ドキュメントが存在しません");
                    }
                } else if (category === "extra") {
                    // 🟦 extra ドキュメントを取得（補習授業用）
                    const extraDocRef = doc(latestFeeMasterDoc.ref, "categories", "extra");
                    const extraDocSnap = await getDoc(extraDocRef);

                    if (extraDocSnap.exists()) {
                        const extraData = extraDocSnap.data();

                        // 補習の feeCode だけ抽出
                        const extraFeeCodes = studentLessons
                            .filter((lesson) => lesson.lessonType === "補習")
                            .map((lesson) => lesson.feeCode);

                        const extraOptions: BillingCode[] = Object.entries(extraData)
                            .filter(([code]) => extraFeeCodes.includes(code))
                            .map(([code, v]: [string, any]) => ({
                                code,
                                name: generateTuitionName(code, month),
                                category: "授業料(補習)",
                                amount: v.amount ?? 0,
                            }));

                        allOptions = [...allOptions, ...extraOptions];
                    }

                } else {
                    // その他カテゴリ（維持費・教材など）は従来通り
                    const categoryRef = doc(collection(latestFeeMasterDoc.ref, "categories"), category);
                    const categorySnap = await getDoc(categoryRef);
                    if (!categorySnap.exists()) continue;

                    const data = categorySnap.data() || {};

                    const otherOptions: BillingCode[] = Object.entries(data).map(([code, v]: [string, any]) => ({
                        code,
                        name: v.item || code,
                        category:
                            category === "discount"
                                ? "割引"
                                : category === "maintenance"
                                    ? "維持費"
                                    : category === "admission"
                                        ? "入会金"
                                        : category === "material"
                                            ? "教材"
                                            : category === "penalty"
                                                ? "違約金"
                                                : category === "test"
                                                    ? "テスト"
                                                    : "その他",
                        amount: v.amount ?? 0,
                    }));

                    allOptions = [...allOptions, ...otherOptions];
                }
            }

            console.log("📘 allOptions (searchOptions):", allOptions);
            setSearchOptions(allOptions);
        } catch (err) {
            console.error(err);
            alert("データ取得に失敗しました");
        }
    };

    // ✅ コード選択時
    const handleSelectCode = (selected: BillingCode) => {
        if (searchIndex === null) return;

        onChange(searchIndex, "code", selected.code);

        const displayName =
            isEditing && selected.category === "授業料"
                ? generateTuitionNameShort(selected.code, month)
                : selected.name;

        onChange(searchIndex, "name", displayName);

        // 🟦 金額の補完処理
        let amount = selected.amount;

        // 授業料カテゴリでamountがundefinedなら、契約情報から探す
        if (selected.category === "授業料" && amount === undefined) {
            const matchedLesson = searchOptions.find(
                (opt) => opt.code === selected.code && opt.amount !== undefined
            );
            if (matchedLesson) {
                amount = matchedLesson.amount;
            }
        }

        // amountが取得できた場合にprice/totalを更新
        if (amount !== undefined) {
            onChange(searchIndex, "price", amount);
            onChange(searchIndex, "total", amount);
        } else {
            console.warn("⚠️ 授業料金額が見つかりません:", selected.code);
        }

        setSearchIndex(null);
        setModalOpen(false);
    };

    const handleBeforeCapture = () => {
        if (!tableRef.current) return;
        const headerCells = tableRef.current.querySelectorAll("thead th");
        const widths: number[] = [];
        headerCells.forEach((th) => widths.push(th.getBoundingClientRect().width));
        while (widths.length < 8) widths.push(0);
        setColumnWidths(widths);
    };

    const isTuitionCode = (code?: string) => {
        if (!code) return false;
        const parts = code.split("_");
        return parts.length >= 3 && (parts[0] === "N" || parts[0] === "H");
    };

    const renderRow = (d: BillingDetail, index: number) => {
        const isExtra = d.code.startsWith("H");

        const displayName = isTuitionCode(d.code)
            ? (isEditing
                ? generateTuitionNameShort(d.code, month, isExtra)
                : generateTuitionName(d.code, month, isExtra))
            : d.name;

        return (
            <Draggable
                draggableId={d.code + index}
                index={index}
                key={d.code + index}
                isDragDisabled={!isEditing}
            >
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(isEditing ? provided.dragHandleProps : {})}
                        className={`border border-gray-200 ${snapshot.isDragging ? "z-10 bg-gray-100" : "z-0"}`}
                        style={{ ...provided.draggableProps.style, display: "table-row" }}
                    >
                        <td className="border px-2 py-1 whitespace-nowrap" style={{ width: columnWidths[0] }}>
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
                        <td className="border px-2 py-1 whitespace-nowrap">{displayName}</td>
                        <td className="border px-2 py-1 whitespace-nowrap">{d.taxType}</td>
                        <td className="border px-2 py-1 whitespace-nowrap">{d.price.toLocaleString()}</td>
                        <td className="border px-2 py-1 whitespace-nowrap">{d.qty}</td>
                        <td className="border px-2 py-1 whitespace-nowrap">{d.total.toLocaleString()}</td>
                        <td className="border px-2 py-1 whitespace-nowrap">{d.note}</td>
                        {(isEditing || snapshot.isDragging) && (
                            <td className="border px-2 py-1 whitespace-nowrap text-center">
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
        );
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table ref={tableRef} className="table-auto border-separate border-spacing-0 w-full">
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

                    <DragDropContext onDragEnd={onDragEnd ?? (() => { })} onBeforeCapture={handleBeforeCapture}>
                        <Droppable droppableId="billingDetails" type="TABLE">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="relative">
                                    {details.map(renderRow)}
                                    {provided.placeholder}
                                    <tr>{Array(8).fill(0).map((_, i) => <td key={i} className="h-0 p-0 m-0" />)}</tr>
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