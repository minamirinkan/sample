// src/components/SuperAdminTeachers.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TeacherSearchForm from './TeacherSearchForm';
import Breadcrumb from './Breadcrumb';
import TeacherTable from './TeacherTable';
import { filterTeachers } from '../utils/filterTeachers'; // ← 新しく作成するフィルター関数

const SuperAdminTeachers = ({ onAddNewTeacher }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const breadcrumbItems = ['講師マスタ', '一覧'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'teachers'));
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
        fetchData();
    }, []);

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
                <button
                    onClick={() => {
                        onAddNewTeacher();
                    }}
                    className="btn-primary"
                >
                    新規登録
                </button>
            </div>

            <TeacherSearchForm onSearch={handleSearch} />
            <TeacherTable teachers={filteredTeachers} />
        </div>
    );
};

export default SuperAdminTeachers;
