// src/components/SuperAdminStudents.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // ✅ 追加
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import StudentSearchForm from './components/StudentSearchForm';
import Breadcrumb from './components/Breadcrumb';
import StudentTable from './components/StudentTable';
import { filterStudents } from './components/filterStudents';
import StudentDetail from './Detail/StudentDetail';
import { Student } from '../../contexts/types/student';
import { Customer } from '../../contexts/types/customer';

type SuperAdminStudentsProps = {
    onAddNewStudent: () => void;
};

type ViewMode = 'list' | 'detail' | 'form';

const SuperAdminStudents: React.FC<SuperAdminStudentsProps> = ({ onAddNewStudent }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [view, setView] = useState<ViewMode>('list');
    const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
        student: Student;
        customer: Customer | null;
    } | null>(null);

    const breadcrumbItems: string[] = ['生徒マスタ', '一覧'];

    const { userData } = useAuth() as { userData: { classroomCode: string } };
    const classroomCode = userData?.classroomCode || '';

    useEffect(() => {
        const fetchData = async () => {
            if (!classroomCode) return;

            try {
                const q = query(
                    collection(db, 'students'),
                    where('classroomCode', '==', classroomCode)
                );
                const snapshot = await getDocs(q);
                const studentData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                    } as Student;
                });
                setStudents(studentData);
            } catch (error) {
                console.error('データ取得エラー:', error);
            }
        };

        fetchData();
    }, [classroomCode]);

    useEffect(() => {
        setFilteredStudents(filterStudents(students, searchTerm));
    }, [searchTerm, students]);

    const handleShowDetail = async (student: Student) => {
        console.log('選択されたstudent:', student);
        try {
            let customerData: Customer | null = null;

            if (student.customerUid) {
                const customerRef = doc(db, 'customers', student.customerUid);
                const customerSnap = await getDoc(customerRef);
                if (customerSnap.exists()) {
                    customerData = customerSnap.data() as Customer;
                }
            }

            setSelectedStudentDetail({ student, customer: customerData });
            setView('detail');
        } catch (error) {
            console.error('詳細取得エラー:', error);
        }
    };

    const handleBackToList = () => {
        setSelectedStudentDetail(null);
        setView('list');
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    return (
        <>
            {view === 'list' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">
                            生徒マスタ <span className="text-lg font-normal ml-1">一覧</span>
                        </h1>
                        <Breadcrumb items={breadcrumbItems} />
                        <button onClick={onAddNewStudent} className="btn-primary">
                            新規登録
                        </button>
                    </div>

                    <StudentSearchForm onSearch={handleSearch} />
                    <StudentTable students={filteredStudents} onShowDetail={handleShowDetail} />
                </div>
            )}

            {view === 'detail' && selectedStudentDetail && (
                <StudentDetail
                    student={selectedStudentDetail.student}
                    customer={selectedStudentDetail.customer}
                    classroomCode={classroomCode}
                    onBack={handleBackToList}
                />
            )}
        </>
    );
};

export default SuperAdminStudents;