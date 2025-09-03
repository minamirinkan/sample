import { db } from "../../firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

export type StudentScore = {
    studentId: string;
    gradeNumber: number; // ← 学年 (1,2,3)
    termSystem: number;  // ← 期制 (2 or 3)
    test: string;
    scores: Record<string, number>;
};

export type StudentScoreWithGrade = StudentScore & {
    gradeNumber: number;
};

// 保存
export const saveStudentScores = async (scores: StudentScore[]) => {
    const batchPromises = scores.map(studentScore => {
        const docRef = doc(
            db,
            "students",
            studentScore.studentId,
            "scores",
            `${studentScore.gradeNumber}-${studentScore.test}` // 学年+テスト名
        );
        return setDoc(docRef, studentScore);
    });

    await Promise.all(batchPromises);
};

// 取得
export const getStudentScores = async (
    studentId: string,
    gradeNumber: number,
    test: string
) => {
    const docRef = doc(db, "students", studentId, "scores", `${gradeNumber}-${test}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as StudentScore;
    } else {
        return null;
    }
};

export const getStudentScoresByGrade = async (studentId: string) => {
    const scoresSnap = await getDocs(collection(db, "students", studentId, "scores"));
    const result: Record<string, Record<string, number>> = {};

    scoresSnap.forEach(docSnap => {
        const data = docSnap.data() as StudentScore;
        const [gradeNumber] = docSnap.id.split("-"); // docID = 学年-テスト名
        const semesterName = `${gradeNumber}年${data.test}`;
        result[semesterName] = data.scores;
    });

    return result;
};