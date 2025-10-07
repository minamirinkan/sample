import React, { useEffect, useState, ChangeEvent } from 'react';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../../../../firebase';

type StudentCourse = {
    id?: string;
    studentId: string;
    startMonth: string;
    endMonth: string;
    kind?: string;
    classType: string;
    weeklyCount: string;
    time: string;
    season: string;
    notes: string;
    duration?: string;
    startYear?: string;
    subject?: string;
    subjectOther?: string;
    endYear?: string;
};

type Props = {
    studentId: string;
};

const defaultNewCourse: Omit<StudentCourse, 'studentId'> = {
    startMonth: '',
    endMonth: '',
    kind: '',
    classType: '',
    weeklyCount: '',
    duration: '',
    time: '',
    season: '',
    notes: '',
};

const StudentCourseTable: React.FC<Props> = ({ studentId }) => {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [newCourse, setNewCourse] = useState<Omit<StudentCourse, 'studentId'>>(defaultNewCourse);

    useEffect(() => {
        const fetchCourses = async () => {
            const q = collection(db, 'students', studentId, 'courses');
            const snapshot = await getDocs(q);
            const fetched: StudentCourse[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as StudentCourse[];
            setCourses(fetched);
        };
        fetchCourses();
    }, [studentId]);

    const handleAdd = async () => {
        const courseToAdd: Omit<StudentCourse, 'id'> = { ...newCourse, studentId };
        const docRef = await addDoc(collection(db, 'students', studentId, 'courses'), courseToAdd);
        setCourses(prev => [...prev, { id: docRef.id, ...courseToAdd }]);
        setNewCourse(defaultNewCourse);
    };

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, 'students', studentId, 'courses', id));
        setCourses(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">受講情報</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    onClick={() => {
                        console.log('受講情報の登録クリック');
                    }}
                >
                    受講情報の登録
                </button>
            </div>
            <table className="w-full table-auto border">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="border p-2">受講開始月</th>
                        <th className="border p-2">受講終了月</th>
                        <th className="border p-2">授業種別</th>
                        <th className="border p-2">授業形態</th>
                        <th className="border p-2">週回数</th>
                        <th className="border p-2">授業時間</th>
                        <th className="border p-2">備考</th>
                        <th className="border p-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td className="border p-2">
                                {course.startYear && course.startMonth ? `${course.startYear}/${String(course.startMonth).padStart(2, '0')}` : ''}
                            </td>
                            <td className="border p-2">
                                {course.endYear && course.endMonth ? `${course.endYear}/${String(course.endMonth).padStart(2, '0')}` : ''}
                            </td>
                            <td className="border p-2">{course.kind}</td>
                            <td className="border p-2">{course.classType}</td>
                            <td className="border p-2">{course.weeklyCount}</td>
                            <td className="border p-2">{course.duration}</td>
                            <td className="border p-2">{course.notes}</td>
                            <td className="border px-4 py-2">
                                <button className="text-blue-600 hover:underline">詳細</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentCourseTable;
