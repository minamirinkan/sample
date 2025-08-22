import { collection, query, where, onSnapshot, getDocs, DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import shortGrade from "../../common/timetable/utils/shortGrade";

// 学年の並び順
const gradeOrder = [
    "小1", "小2", "小3", "小4", "小5", "小6",
    "中1", "中2", "中3",
    "高1", "高2", "高3", "既卒",
] as const;

// courses サブコレクションの型
interface Course {
    kind: string;
    classType?: string;
    duration?: string;
    subject?: string;
}

// Student 型
export interface Student {
    id: string;
    lastName: string;
    firstName: string;
    grade: string;
    classroomCode: string;

    classType?: string;
    duration?: string;
    subject?: string;

    [key: string]: unknown; // Firestore の他フィールドも許容
}

interface UseFilteredStudentsReturn {
    filteredStudents: Student[];
    existingGrades: typeof gradeOrder[number][];
}

export default function useFilteredStudents(
    searchKeyword: string,
    gradeFilter: string,
    classroomCode?: string
): UseFilteredStudentsReturn {
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (!classroomCode) return;

        const q = query(
            collection(db, "students"),
            where("classroomCode", "==", classroomCode)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetched = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data() as DocumentData;

                    // 必須フィールドを型安全に取り出す
                    const student: Student = {
                        id: docSnap.id,
                        lastName: data.lastName as string ?? "",
                        firstName: data.firstName as string ?? "",
                        grade: data.grade as string ?? "",
                        classroomCode: data.classroomCode as string ?? "",
                    };

                    // courses サブコレクションを取得
                    const courseSnap = await getDocs(
                        collection(db, "students", docSnap.id, "courses")
                    );

                    const courseData = courseSnap.docs
                        .map((d) => d.data() as Course)
                        .find((course) => course.kind === "通常");

                    if (courseData) {
                        student.classType = courseData.classType ?? "";
                        student.duration = courseData.duration ?? "";
                        student.subject = courseData.subject ?? "";
                    }

                    return student;
                })
            );

            setStudents(fetched);
        });

        return () => unsubscribe();
    }, [classroomCode]);

    const filteredStudents = students.filter((s) => {
        const name = `${s.lastName} ${s.firstName}`;
        const short = shortGrade(s.grade);
        return (
            name.includes(searchKeyword) &&
            (gradeFilter === "" || short === gradeFilter)
        );
    });

    const existingGrades = gradeOrder.filter((g) =>
        students.some((s) => shortGrade(s.grade) === g)
    );

    return { filteredStudents, existingGrades };
}
