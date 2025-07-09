import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const defaultNewCourse = {
    startMonth: '',
    endMonth: '',
    courseType: '',
    classStyle: '',
    weeklyCount: '',
    time: '',
    season: '',
    notes: '',
};

export default function StudentCourseTable({ studentId }) {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState(defaultNewCourse);

    useEffect(() => {
        const fetchCourses = async () => {
            const q = query(collection(db, 'studentCourses'), where('studentId', '==', studentId));
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(fetched);
        };
        fetchCourses();
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        const courseToAdd = { ...newCourse, studentId };
        const docRef = await addDoc(collection(db, 'studentCourses'), courseToAdd);
        setCourses(prev => [...prev, { id: docRef.id, ...courseToAdd }]);
        setNewCourse(defaultNewCourse);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'studentCourses', id));
        setCourses(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">受講情報</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    onClick={() => {
                        // 必要ならここにクリック処理を書く
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
                        <th className="border p-2">講習時期</th>
                        <th className="border p-2">備考</th>
                        <th className="border p-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td className="border p-2">{course.startMonth}</td>
                            <td className="border p-2">{course.endMonth}</td>
                            <td className="border p-2">{course.courseType}</td>
                            <td className="border p-2">{course.classStyle}</td>
                            <td className="border p-2">{course.weeklyCount}</td>
                            <td className="border p-2">{course.time}</td>
                            <td className="border p-2">{course.season}</td>
                            <td className="border p-2">{course.notes}</td>
                            <td className="border px-4 py-2">
                                <button
                                    className="text-blue-600 hover:underline"
                                >
                                    詳細
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
