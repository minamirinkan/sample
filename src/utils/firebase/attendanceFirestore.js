//utils/firebase/attendanceFirestore.js
import { doc, getDoc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';

export const buildWeeklyDocId = (classroomCode, date) => {
    const d = new Date(date);
    const weekday = d.getDay();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${classroomCode}_${year}-${month}_${weekday}`;
};

export const getPeriodKey = (periodLabels, label) => {
    const index = periodLabels.findIndex(p => p.label === label);
    return `period${index + 1}`;
};

export async function fetchScheduleDoc(collection, docId) {
    const db = getFirestore();
    const docRef = doc(db, collection, docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
}

export async function createScheduleFromWeeklyTemplate(collection, docId, weeklyRefId, initialData) {
    const db = getFirestore();
    const docRef = doc(db, collection, docId);
    await setDoc(docRef, {
        ...initialData,
        createdFromWeeklyTemplate: weeklyRefId,
        updatedAt: serverTimestamp(),
    }, { merge: true });
    return await fetchScheduleDoc(collection, docId);
}

export async function saveScheduleDoc(collection, docId, data) {
    const db = getFirestore();
    const docRef = doc(db, collection, docId);
    await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function saveMakeupLesson(studentId, docId, lessonData) {
    const db = getFirestore();
    const docRef = doc(db, 'students', studentId, 'makeupLessons', docId);

    // 既存データの取得
    const docSnap = await getDoc(docRef);
    let existingLessons = [];

    if (docSnap.exists()) {
        const data = docSnap.data();
        existingLessons = data.lessons || [];
    }

    // `student` フィールドがネストされたままなら、lessonData.student を展開
    const lesson = {
        grade: lessonData.student.grade || '',
        name: lessonData.student.name || '',
        period: parseInt(lessonData.periodKey.replace('period', ''), 10), // 例: period2 → 2
        seat: lessonData.student.seat || '',
        status: lessonData.status || '',
        studentId: lessonData.student.studentId || '',
        subject: lessonData.student.subject || '',
    };

    // 配列に追加
    const updatedLessons = [...existingLessons, lesson];

    // 保存
    await setDoc(docRef, {
        lessons: updatedLessons,
    }, { merge: true });
}

export async function fetchMakeupLessonDoc(studentId, docId) {
    const db = getFirestore();
    const docRef = doc(db, 'students', studentId, 'makeupLessons', docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
}