// src/components/SuperAdminStudents.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ✅ 追加
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import StudentSearchForm from './StudentSearchForm';
import Breadcrumb from './Breadcrumb';
import StudentTable from './StudentTable';
import { filterStudents } from '../utils/filterStudents';

const SuperAdminStudents = ({ onAddNewStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const breadcrumbItems = ['生徒マスタ', '一覧'];
    const { adminData } = useAuth();
    const classroomCode = adminData?.classroomCode || '';

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
                        entryDate: data.entryDate?.seconds
                            ? new Date(data.entryDate.seconds * 1000).toLocaleDateString()
                            : '－',
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


    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
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
            <StudentTable students={filteredStudents} />
        </div>
    );
};

export default SuperAdminStudents;
