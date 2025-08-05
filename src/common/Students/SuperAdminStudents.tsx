// src/components/SuperAdminStudents.js
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import StudentSearchForm from './components/StudentSearchForm';
import Breadcrumb from './components/Breadcrumb';
import StudentTable from './components/StudentTable';
import { filterStudents } from './components/filterStudents';
import StudentDetail from './Detail/StudentDetail';
import { Student } from '../../contexts/types/student';
import { Customer } from '../../contexts/types/customer';
import { useAdminData } from '../../contexts/providers/AdminDataProvider';

type SuperAdminStudentsProps = {
    onAddNewStudent: () => void;
};

type ViewMode = 'list' | 'detail' | 'form';

const SuperAdminStudents: React.FC<SuperAdminStudentsProps> = ({ onAddNewStudent }) => {
    const { userData, students } = useAdminData();
    console.log('students:', students);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [view, setView] = useState<ViewMode>('list');
    const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
        student: Student;
        customer: Customer | null;
    } | null>(null);

    const breadcrumbItems: string[] = ['生徒マスタ', '一覧'];
    const classroomCode = userData?.classroomCode || '';

    const filteredStudents = filterStudents(students.students ?? [], searchTerm);

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