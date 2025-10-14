import React, { useEffect, useState } from 'react';
import {
    collection,
    getDocs,
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import { FiFilePlus } from 'react-icons/fi';
import { Student } from '../../../../contexts/types/student';
import { Customer } from '../../../../contexts/types/customer';

type StudentCourse = {
    id?: string;
    studentId: string;
    startMonth: string;
    endMonth: string;
    lessonType?: string;
    classType: string;
    weeklyCount: string;
    time: string;
    season?: string;
    notes: string;
    duration?: string;
    startYear?: string;
    subject?: string;
    subjectOther?: string;
    endYear?: string;
};

type Props = {
    customer: Customer;
    formData: Student;
};

const StudentCourseTable: React.FC<Props> = ({ customer, formData }) => {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    useEffect(() => {
        const fetchCourses = async () => {
            if (!formData?.studentId || !customer?.uid) return;

            try {
                const contractsRef = collection(db, 'customers', customer.uid, 'contracts');
                const snapshot = await getDocs(contractsRef);

                const fetched: StudentCourse[] = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((d: any) => d.studentId === formData.studentId)
                    .map((d: any) => ({
                        id: d.id,
                        studentId: d.studentId,
                        startYear: d.startYear,
                        startMonth: d.startMonth,
                        endYear: d.endYear,
                        endMonth: d.endMonth,
                        lessonType: d.lessonType,        // lessonType → kind
                        classType: d.classType,
                        weeklyCount: d.times,      // times → weeklyCount
                        duration: d.duration,
                        time: d.lecturePeriod || '',
                        notes: d.note || '',        // note → notes
                        feeCode: d.feeCode,
                        grade: d.grade,
                    }));

                setCourses(fetched);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCourses();
    }, [formData?.studentId, customer?.uid]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex justify-between items-center">
                受講情報
                <button
                    className="inline-flex items-center gap-1.5 bg-orange-400 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                    onClick={() => {
                        console.log('受講情報の登録クリック');
                    }}
                >
                    <FiFilePlus className="w-4 h-4" />
                    受講情報の登録
                </button>
            </h2>
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
                            <td className="border p-2 text-right">
                                {course.startYear && course.startMonth ? `${course.startYear}/${String(course.startMonth).padStart(2, '0')}` : ''}
                            </td>
                            <td className="border p-2 text-right">
                                {course.endYear && course.endMonth ? `${course.endYear}/${String(course.endMonth).padStart(2, '0')}` : ''}
                            </td>
                            <td className="border p-2">{course.lessonType}</td>
                            <td className="border p-2">{course.classType}</td>
                            <td className="border p-2 text-right">{course.weeklyCount}回</td>
                            <td className="border p-2 text-right">{course.duration}分</td>
                            <td className="border p-2">{course.season}</td>
                            <td className="border p-2">{course.notes}</td>
                            <td className="border px-3 py-2 text-center">
                                <button
                                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                        onClick={(console.log)}
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
};

export default StudentCourseTable;
