// src/components/SuperAdminStudents.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // ✅ 追加
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import StudentSearchForm from './components/StudentSearchForm.js';
import Breadcrumb from './components/Breadcrumb';
import StudentTable from '../../common/Students/components/StudentTable.js';
import { filterStudents } from '../../common/Students/components/filterStudents.js';
import StudentDetail from '../../common/Students/Detail/StudentDetail.js';


const SuperAdminStudents = ({ onAddNewStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const breadcrumbItems = ['生徒マスタ', '一覧'];
    const { adminData } = useAuth();
    const classroomCode = adminData?.classroomCode || '';
    const [view, setView] = useState('list'); // 'list', 'detail', 'form'
    const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

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
                    };
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
    }, [searchTerm, students]); // ← フィルター専用

    const handleShowDetail = async (student) => {
        console.log('選択されたstudent:', student); // ← ここで表示！
        try {
            let customerData = null;

            if (student.customerUid) {
                const customerRef = doc(db, 'customers', student.customerUid);
                const customerSnap = await getDoc(customerRef);
                if (customerSnap.exists()) {
                    customerData = { id: customerSnap.id, ...customerSnap.data() };
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

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        console.log('superstudents:', filteredStudents),
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
                    classroomCode={classroomCode} // ← ここで渡す！
                    onBack={handleBackToList}
                />
            )}
        </>
    );
};

export default SuperAdminStudents;