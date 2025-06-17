// src/components/SuperAdminTeachers.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext'; // ← これを使う
import TeacherSearchForm from './TeacherSearchForm';
import Breadcrumb from './Breadcrumb';
import TeacherTable from './TeacherTable';
import { filterTeachers } from '../utils/filterTeachers';

const SuperAdminTeachers = ({ onAddNewTeacher }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const { adminData, loading } = useAuth(); // ← classroomCode を含む

    const breadcrumbItems = ['講師マスタ', '一覧'];

    useEffect(() => {
        const fetchTeachers = async () => {
            if (!adminData?.classroomCode) return;

            try {
                const q = query(
                    collection(db, 'teachers'),
                    where('classroomCode', '==', adminData.classroomCode)
                );
                const snapshot = await getDocs(q);
                const teacherData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        entryDate: data.entryDate?.seconds
                            ? new Date(data.entryDate.seconds * 1000).toLocaleDateString()
                            : '－',
                    };
                });
                setTeachers(teacherData);
            } catch (error) {
                console.error('講師データ取得エラー:', error);
            }
        };

        if (!loading) {
            fetchTeachers();
        }
    }, [adminData, loading]);

    useEffect(() => {
        setFilteredTeachers(filterTeachers(teachers, searchTerm));
    }, [searchTerm, teachers]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    講師マスタ <span className="text-lg font-normal ml-1">一覧</span>
                </h1>
                <Breadcrumb items={breadcrumbItems} />
                <button onClick={onAddNewTeacher} className="btn-primary">
                    新規登録
                </button>
            </div>

            <TeacherSearchForm onSearch={handleSearch} />
            <TeacherTable teachers={filteredTeachers} />
        </div>
    );
};

export default SuperAdminTeachers;
