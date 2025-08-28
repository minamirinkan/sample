import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import StudentInfoSection from './StudentInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import ActionButtons from '../../../components/ActionButtons';
import StudentAttendanceTab from './Tabs/StudentAttendanceTab';
import StudentCourseTable from './Tabs/StudentCourseTable';
import StudentGrades from './Tabs/StudentGrades';
import { Student } from '../../../contexts/types/student';
import { Customer } from '../../../contexts/types/customer';
import { useCustomerByStudent } from '../../../contexts/hooks/useCustomerByStudent';

const TABS = ['基本情報', '在籍情報', '受講情報', '授業情報', '請求情報', '成績管理'];

const StudentDetail: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const { customer, loading: customerLoading, error } = useCustomerByStudent(studentId ?? null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('基本情報');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Student | null>(null);
    const [originalData, setOriginalData] = useState<Student | null>(null);

    useEffect(() => {
        if (!studentId) return;

        const fetchData = async () => {
            setLoading(true);
            const db = getFirestore();

            // student を取得
            const studentRef = doc(db, 'students', studentId);
            const studentSnap = await getDoc(studentRef);
            if (!studentSnap.exists()) {
                setStudent(null);
                setLoading(false);
                return;
            }
            const studentData = { id: studentSnap.id, ...(studentSnap.data() as Student) };
            setStudent(studentData);
            setFormData(studentData);
            setOriginalData(studentData);
            setLoading(false);
        };

        fetchData();
    }, [studentId]);

    const onBack = () => navigate(-1);

    if (loading || customerLoading) return <div className="text-center text-gray-500">読み込み中...</div>;
    if (!student) return <div className="text-center text-red-500">生徒データが見つかりません</div>;
    if (error) return <div className="text-center text-red-500">顧客データの取得に失敗しました</div>;

    const handleEditClick = () => {
        setOriginalData(formData);
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : prev);
    };

    const handleDelete = () => {
        console.log('削除ボタンが押されました');
    };

    const renderTabContent = () => {
        if (!formData) return null;
        switch (activeTab) {
            case '基本情報':
                return (
                    <div className="flex gap-6">
                        <StudentInfoSection formData={formData} customer={customer} isEditing={isEditing} onChange={handleChange} />
                        <GuardianInfoSection formData={formData} customer={customer} isEditing={isEditing} onChange={handleChange} />
                    </div>
                );
            case '受講情報':
                return <StudentCourseTable studentId={formData.id ?? ""} customer={customer} />;
            case '授業情報':
                return (
                    <StudentAttendanceTab
                        studentId={formData.id}
                        studentName={`${formData.lastName ?? ''} ${formData.firstName ?? ''}`}
                        classroomCode={formData.classroomCode}
                        customer={customer}
                    />
                );
            case '成績管理':
                return (
                    <StudentGrades
                        studentId={formData.id}
                        studentName={`${formData.lastName ?? ''} ${formData.firstName ?? ''}`}
                        classroomCode={formData.classroomCode}
                        customer={customer}
                    />
                );
            default:
                return <div className="text-gray-500 italic">このセクションは現在準備中です。</div>;
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow-md max-w-5xl mx-auto">
            <div className="flex items-center mb-4 space-x-6">
                <h1 className="text-2xl font-bold text-gray-800">生徒マスタ</h1>
                <span className="text-2xl text-gray-500 font-normal">詳細</span>
            </div>

            <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
                            ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'}
                        `}
                        onClick={() => setActiveTab(tab)}
                        aria-selected={activeTab === tab}
                        role="tab"
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === '基本情報' && (
                <ActionButtons
                    isEditing={isEditing}
                    onBack={onBack}
                    onEdit={handleEditClick}
                    onCancel={handleCancelClick}
                    onSave={handleSaveClick}
                    onDelete={handleDelete}
                />
            )}

            <div className="mt-4">{renderTabContent()}</div>

            {activeTab === '基本情報' && (
                <div className="mt-6">
                    <ActionButtons
                        isEditing={isEditing}
                        onBack={onBack}
                        onEdit={handleEditClick}
                        onCancel={handleCancelClick}
                        onSave={handleSaveClick}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default StudentDetail;
