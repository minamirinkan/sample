import React, { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { flattenDailySchedule } from "./flatLessons";
import { FlatLesson } from "./flatLesson";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const periods = [
    { label: "1限", time: "9:00-10:20" },
    { label: "2限", time: "10:30-11:50" },
    { label: "3限", time: "12:00-13:20" },
    { label: "4限", time: "13:30-14:50" },
    { label: "5限", time: "15:00-16:20" },
    { label: "6限", time: "16:30-17:50" },
    { label: "7限", time: "18:00-19:20" },
    { label: "8限", time: "19:30-20:50" }
];

type TimetableByTeacher = Record<string, Record<number, FlatLesson[]>>;

const TimetableDragDrop: React.FC = () => {
    const [flatLessons, setFlatLessons] = useState<FlatLesson[]>([]);
    const [timetableByTeacher, setTimetableByTeacher] = useState<TimetableByTeacher>({});
    const [teacherCodes, setTeacherCodes] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    const fetchSchedule = async (date: string) => {
        const dateObj = new Date(selectedDate);
        console.log('date', dateObj)
        const weekday = dateObj.getDay(); // 0:日, 1:月, … 6:土
        const docId = `047_${selectedDate}_${weekday}`;
        console.log('docId', docId)
        const docRef = doc(db, "dailySchedules", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const flattened = flattenDailySchedule({ ...docSnap.data(), id: docSnap.id });
            setFlatLessons(flattened);

            const grouped: TimetableByTeacher = {};
            flattened.forEach((lesson) => {
                if (!grouped[lesson.teacherCode]) grouped[lesson.teacherCode] = {};
                if (!grouped[lesson.teacherCode][lesson.period]) grouped[lesson.teacherCode][lesson.period] = [];
                grouped[lesson.teacherCode][lesson.period].push(lesson);
            });
            setTimetableByTeacher(grouped);
            setTeacherCodes(Object.keys(grouped));
        } else {
            setFlatLessons([]);
            setTimetableByTeacher({});
            setTeacherCodes([]);
        }
    };

    useEffect(() => {
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId, type } = result;
        if (!destination) return;

        if (type === "ROW") {
            const newTeacherCodes = Array.from(teacherCodes);
            const [moved] = newTeacherCodes.splice(source.index, 1);
            newTeacherCodes.splice(destination.index, 0, moved);
            setTeacherCodes(newTeacherCodes);
            return;
        }

        const [srcTeacher, srcPeriodStr] = source.droppableId.split("-");
        const [destTeacher, destPeriodStr] = destination.droppableId.split("-");
        const srcPeriod = Number(srcPeriodStr);
        const destPeriod = Number(destPeriodStr);

        setTimetableByTeacher((prev) => {
            const copy = JSON.parse(JSON.stringify(prev)) as TimetableByTeacher;
            const srcLessons = copy[srcTeacher][srcPeriod];
            const lessonIndex = srcLessons.findIndex((l) => l.studentId === draggableId);
            const [movingLesson] = srcLessons.splice(lessonIndex, 1);
            if (!copy[destTeacher][destPeriod]) copy[destTeacher][destPeriod] = [];
            copy[destTeacher][destPeriod].splice(destination.index, 0, movingLesson);
            return copy;
        });
    };

    return (
        <div className="overflow-auto">
            <h2 className="text-xl mb-4">ドラッグ可能時間割</h2>
            <div className="mb-4">
                <label>
                    日付選択:{" "}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border p-1 rounded"
                    />
                </label>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="teachers" type="ROW">
                    {(provided) => (
                        <table
                            className="table-auto border-collapse border border-gray-300 w-full text-sm"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <thead className="bg-gray-100 sticky top-0 z-20">
                                <tr>
                                    <th className="border p-2 sticky left-0 z-30">講師</th>
                                    {periods.map((p, idx) => (
                                        <th key={idx} className="border p-2 text-center bg-gray-100">
                                            {p.label}<br />{p.time}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teacherCodes.map((teacherCode, rowIndex) => (
                                    <Draggable key={teacherCode} draggableId={teacherCode} index={rowIndex}>
                                        {(provided) => (
                                            <tr ref={provided.innerRef} {...provided.draggableProps}>
                                                <td
                                                    {...provided.dragHandleProps}
                                                    className="border p-2 bg-gray-50 sticky left-0 z-10 cursor-move"
                                                >
                                                    {teacherCode}
                                                </td>
                                                {periods.map((_, idx) => (
                                                    <Droppable
                                                        key={idx}
                                                        droppableId={`${teacherCode}-${idx + 1}`}
                                                        type="STUDENT"
                                                    >
                                                        {(provided) => (
                                                            <td
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className="border p-2 align-top min-w-[120px] h-[80px]"
                                                            >
                                                                {(timetableByTeacher[teacherCode][idx + 1] || []).map(
                                                                    (lesson, index) => (
                                                                        <Draggable
                                                                            key={lesson.studentId}
                                                                            draggableId={lesson.studentId}
                                                                            index={index}
                                                                        >
                                                                            {(provided) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    className="bg-blue-200 rounded px-2 py-1 mb-1 cursor-move text-xs"
                                                                                >
                                                                                    {lesson.studentName} ({lesson.subject})
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    )
                                                                )}
                                                                {provided.placeholder}
                                                            </td>
                                                        )}
                                                    </Droppable>
                                                ))}
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default TimetableDragDrop;
