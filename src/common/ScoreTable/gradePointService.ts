import { db } from "../../firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

export interface StudentGradePoint {
    studentId: string;
    gradeNumber: number;   // 例: "中3"
    termSystem: number; 
    term: string;          // 例: "1学期", "2学期", "学年末"
    scores: Record<string, number>; // { 国語: 4, 数学: 3, ... }
}

export type StudentGradePointWithGrade = StudentGradePoint & {
    gradeNumber: number;
};

export const saveStudentGradePoints = async (gradePoints: StudentGradePoint[]) => {
    const batchPromises = gradePoints.map(gp => {
        const docRef = doc(
            db,
            "students",
            gp.studentId,
            "gradePoints",
            `${gp.gradeNumber}-${gp.term}` // 学年 + 学期
        );
        return setDoc(docRef, gp);
    });

    await Promise.all(batchPromises);
};

export const getStudentGradePoints = async (studentId: string, gradeNumber: number, term: string) => {
    const docRef = doc(db, "students", studentId, "gradePoints", `${gradeNumber}-${term}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
};

export const getStudentGradePointsByGrade = async (studentId: string) => {
    const scoresSnap = await getDocs(collection(db, "students", studentId, "gradePoints"));
    const result: Record<string, Record<string, number>> = {};

    scoresSnap.forEach(docSnap => {
        const data = docSnap.data() as StudentGradePointWithGrade;
        const [gradeNumber] = docSnap.id.split("-"); // docID = 学年-テスト名
        const semesterName = `${gradeNumber}年${data.term}`;
        result[semesterName] = data.scores;
    });

    return result;
};