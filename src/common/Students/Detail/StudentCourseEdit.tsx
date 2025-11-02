// src/common/Students/Detail/StudentCourseEdit.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, updateDoc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import SimpleCard from "../../../common/ToDo/ToDoContent/SimpleCard";
import EditButton from "./EditButton";
import { Student } from "../../../contexts/types/student";
import { Customer } from "../../../contexts/types/customer";
import { StudentCourse } from "./Tabs/StudentCourseTable";
import { generateFeeCode } from "./feeCodeUtils";

const lessonTypes = ["通常", "補習", "春季講習", "夏季講習", "冬季講習"];
const classTypes = ["1名クラス", "2名クラス", "個別クラス"];
const durations = ["80", "70", "40"];
const weeklyCounts = ["1", "2", "3", "4", "5"];
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i);

const StudentCourseEdit: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { formData, customer, course } = location.state as {
        formData: Student;
        customer: Customer;
        course?: StudentCourse;
    };

    // 新規作成時用の初期値
    const initialCourse: StudentCourse = course || {
        studentId: formData.studentId!,
        classType: "",
        times: "",
        note: "",
        duration: "",
        lessonType: "",
        startYear: "",
        startMonth: "",
        endYear: "",
        endMonth: "",
    };

    const [currentCourse, setCurrentCourse] = useState(initialCourse);
    const [editedNote, setEditedNote] = useState(initialCourse.note || "");
    const [startYear, setStartYear] = useState(initialCourse.startYear || "");
    const [startMonth, setStartMonth] = useState(initialCourse.startMonth || "");
    const [endYear, setEndYear] = useState(initialCourse.endYear || "");
    const [endMonth, setEndMonth] = useState(initialCourse.endMonth || "");
    const isNew = !currentCourse.id;

    const isNormal = currentCourse.lessonType === "通常";

    const handleBack = () => {
        navigate(`/admin/students/${formData.studentId}/course/${course?.id || ""}`, {
            state: { formData, customer, course },
        });
    };

    const handleSave = async () => {
        if (!customer?.uid) return;

        try {
            // feeCode を生成
            const feeCode = generateFeeCode({
                lessonType: currentCourse.lessonType,
                classType: currentCourse.classType,
                grade: formData.grade || "J3",
                times: currentCourse.times,
                duration: currentCourse.duration,
            });

            // 年月
            const yearMonth = startYear && startMonth ? `${startYear}${startMonth.padStart(2, "0")}` : "";

            // ドキュメントIDは studentId_YYYYMM_feeCode
            const docId = `${formData.studentId}_${yearMonth}_${feeCode}`;

            const contractsRef = collection(db, "customers", customer.uid, "contracts");
            const docRef = doc(contractsRef, docId);

            if (currentCourse.id) {
                // 既存コースの更新
                await updateDoc(docRef, {
                    ...currentCourse,
                    startYear,
                    startMonth,
                    endYear,
                    endMonth,
                    note: editedNote,
                    feeCode, // 既存でも feeCode 更新
                });
                alert("保存しました");
                navigate(`/admin/students/${formData.studentId}/course/${docId}`, {
                    state: {
                        formData,
                        customer,
                        course: { ...currentCourse, startYear, startMonth, endYear, endMonth, note: editedNote, feeCode },
                    },
                });
            } else {
                // 新規作成
                await setDoc(docRef, {
                    ...currentCourse,
                    startYear,
                    startMonth,
                    endYear,
                    endMonth,
                    note: editedNote,
                    createdAt: serverTimestamp(),
                    status: "active",
                    feeCode,
                });
                alert("新規作成しました");
                navigate(`/admin/students/${formData.studentId}/course/${docId}`, {
                    state: {
                        formData,
                        customer,
                        course: { ...currentCourse, id: docId, startYear, startMonth, endYear, endMonth, note: editedNote, feeCode },
                    },
                });
            }
        } catch (err) {
            console.error(err);
            alert("保存に失敗しました");
        }
    };

    return (
        <div className="space-y-4">
            <EditButton isEditing={true} onBack={handleBack} onEdit={() => { }} onSave={handleSave} />

            <SimpleCard title={isNew ? "受講情報新規作成" : "受講情報編集"}>
                <div className="grid grid-cols-[140px_1fr] gap-x-8 gap-y-3">

                    {/* 生徒名 */}
                    <div className="font-medium">生徒名</div>
                    <div>{formData.lastName} {formData.firstName}</div>

                    {/* 授業種別 */}
                    <div className="font-medium">授業種別</div>
                    <div className="flex gap-3">
                        {lessonTypes.map(type => (
                            <label
                                key={type}
                                className={`
                                    px-2 py-1 rounded
                                    ${currentCourse.lessonType === type
                                        ? "bg-blue-100 font-semibold cursor-not-allowed opacity-70"
                                        : "text-gray-400 cursor-not-allowed opacity-50"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    value={type}
                                    checked={currentCourse.lessonType === type}
                                    disabled
                                    readOnly
                                    className="mr-1 pointer-events-none"
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    {/* 授業形態 */}
                    <div className="font-medium">
                        授業形態 {isNew && <span className="bg-red-500 text-white px-1 rounded">必須</span>}
                    </div>
                    <div className="flex gap-3">
                        {classTypes.map(type => (
                            <label
                                key={type}
                                className={`px-2 py-1 rounded ${currentCourse.classType === type
                                    ? "bg-blue-100 font-semibold"
                                    : isNew
                                        ? "text-gray-700"
                                        : "text-gray-400 cursor-not-allowed opacity-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value={type}
                                    checked={currentCourse.classType === type}
                                    disabled={!isNew}
                                    onChange={() => isNew && setCurrentCourse({ ...currentCourse, classType: type })}
                                    className={`${!isNew ? "cursor-not-allowed" : "cursor-pointer"}`}
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    {/* 週回数 */}
                    {isNormal && (
                        <>
                            <div className="font-medium">
                                週回数 {isNew && <span className="bg-red-500 text-white px-1 rounded">必須</span>}
                            </div>
                            <div>
                                <select
                                    value={currentCourse.times}
                                    disabled={!isNew}
                                    onChange={(e) => isNew && setCurrentCourse({ ...currentCourse, times: e.target.value })}
                                    className={`border rounded p-1 transition
                                        ${currentCourse.times
                                            ? "bg-blue-100 font-semibold"
                                            : "bg-white-100 cursor-not-allowed"
                                        }`}
                                >
                                    <option value="">選択</option>
                                    {weeklyCounts.map(wc => (
                                        <option key={wc} value={wc}>{wc}回</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* 授業時間 */}
                    <div className="font-medium">
                        授業時間 {isNew && <span className="bg-red-500 text-white px-1 rounded">必須</span>}
                    </div>
                    <div className="flex gap-3">
                        {durations.map(dur => (
                            <label
                                key={dur}
                                className={`px-2 py-1 rounded ${currentCourse.duration === dur
                                    ? "bg-blue-100 font-semibold"
                                    : isNew
                                        ? "text-gray-700"
                                        : "text-gray-400 cursor-not-allowed opacity-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value={dur}
                                    checked={currentCourse.duration === dur}
                                    disabled={!isNew}
                                    onChange={() => isNew && setCurrentCourse({ ...currentCourse, duration: dur })}
                                    className={`${!isNew ? "cursor-not-allowed" : "cursor-pointer"}`}
                                />
                                {dur}分
                            </label>
                        ))}
                    </div>

                    {/* 受講開始月 */}
                    <div className="font-medium">
                        受講開始月 {isNew && <span className="bg-red-500 text-white px-1 rounded">必須</span>}
                    </div>
                    <div className="flex gap-2">
                        <div className={`${!isNew ? "cursor-not-allowed" : ""}`}>
                            <select
                                value={startYear || ""}
                                disabled={!isNew}
                                onChange={(e) => isNew && setStartYear(e.target.value)}
                                className={`border rounded p-1 w-full transition ${startYear
                                    ? "bg-blue-100 font-semibold"
                                    : !isNew
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-white"
                                    }`}
                            >
                                <option value="">年を選択</option>
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className={`${!isNew ? "cursor-not-allowed" : ""}`}>
                            <select
                                value={startMonth}
                                disabled={!isNew}
                                onChange={(e) => isNew && setStartMonth(e.target.value)}
                                className={`border rounded p-1 w-full transition ${startMonth
                                    ? "bg-blue-100 font-semibold"
                                    : !isNew
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-white"
                                    }`}
                            >
                                <option value="">月を選択</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* 終了年・月 */}
                    <div className="font-medium">受講終了月</div>
                    <div className="flex gap-2">
                        <select
                            value={endYear || ""}
                            onChange={(e) => setEndYear(e.target.value)}
                            className="border rounded p-1"
                        >
                            <option value="">年を選択</option>
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            value={endMonth || ""}
                            onChange={(e) => setEndMonth(e.target.value)}
                            className="border rounded p-1"
                        >
                            <option value="">月を選択</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* 備考 */}
                    <div className="font-medium">備考</div>
                    <input
                        type="text"
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        className="w-full border rounded p-1"
                        placeholder="備考を入力"
                    />
                </div>
            </SimpleCard>

            <EditButton isEditing={true} onBack={handleBack} onEdit={() => { }} onSave={handleSave} />

        </div>
    );
};

export default StudentCourseEdit;
