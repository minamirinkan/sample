import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import StudentInfoSection from './StudentInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import ActionButtons from '../../../components/ActionButtons';
import StudentAttendanceTab from './Tabs/StudentAttendanceTab';
import StudentCourseTable from './Tabs/StudentCourseTable';
import StudentGrades from './Tabs/StudentGrades';
import { Student } from '../../../contexts/types/student';
import { useCustomerByStudent } from '../../../contexts/hooks/useCustomerByStudent';
import BillingPage from './BillingPage';
import EnrollmentPage from './EnrollmentPage';

const TAB_MAP: Record<string, string> = {
    '基本情報': 'basic',
    '在籍情報': 'enrollment',
    '受講情報': 'course',
    '授業情報': 'attendance',
    '成績管理': 'grades',
    '請求情報': 'bill',
};

const StudentDetail: React.FC = () => {
    const { studentId, section, tab } = useParams<{ studentId: string; section: string; tab?: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const { customer, loading: customerLoading, error } = useCustomerByStudent(studentId ?? null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Student | null>(null);
    const [originalData, setOriginalData] = useState<Student | null>(null);
    // const isAttendanceTab = (value: string | undefined): value is 'regular' | 'monthly' | 'seasonal' => {
    //     return value === 'regular' || value === 'monthly' || value === 'seasonal';
    // };

    useEffect(() => {
        if (!studentId) return;

        const fetchData = async () => {
            setLoading(true);
            const db = getFirestore();
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

    if (loading || customerLoading) return <div className="text-center text-gray-500">読み込み中...</div>;
    if (!student) return <div className="text-center text-red-500">生徒データが見つかりません</div>;
    if (!customer) return <div className="text-center text-red-500">保護者データが見つかりません</div>;
    if (error) return <div className="text-center text-red-500">顧客データの取得に失敗しました</div>;
    if (!section && window.location.pathname.includes('/attendance') === false) {
        return <Navigate to={`/admin/students/${studentId}/basic`} replace />;
    }
    const onBack = () => navigate("/admin/students");

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setFormData(originalData);
        setIsEditing(false);
    };
    const handleSaveClick = () => setIsEditing(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : prev);
    };
    const handleDelete = () => console.log('削除ボタンが押されました');

    const renderTabContent = () => {
        if (!formData) return null;
        console.log('section', section);
        switch (section) {
            case 'basic':
                return (
                    <div className="flex gap-6">
                        <StudentInfoSection formData={formData} isEditing={isEditing} onChange={handleChange} />
                        <GuardianInfoSection formData={formData} customer={customer} isEditing={isEditing} onChange={handleChange} />
                    </div>
                );
            case 'enrollment':
                return <EnrollmentPage studentId={formData.id ?? ""} />;
            case 'course':
                return <StudentCourseTable studentId={formData.id ?? ""} />;
            case 'attendance':
                const initialAttendanceTab: 'regular' | 'monthly' | 'seasonal' =
                    tab === 'regular' || tab === 'monthly' || tab === 'seasonal' ? tab : 'monthly';

                return (
                    <StudentAttendanceTab
                        classroomCode={formData.classroomCode}
                        studentId={studentId!}
                        studentName={`${formData.lastName} ${formData.firstName}`}
                        initialTab={initialAttendanceTab}
                    />
                );
            case 'grades':
                return (
                    <StudentGrades
                        studentId={formData.id ?? ''}
                        studentName={`${formData.lastName ?? ''} ${formData.firstName ?? ''}`}
                        classroomCode={formData.classroomCode}
                    />
                );
            case 'bill':
                return (
                    <BillingPage
                        formData={formData}
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
                <span className="text-1xl text-gray-500 font-normal">{formData?.studentId ?? ''} {formData?.lastName ?? ''} {formData?.firstName ?? ''}</span>
            </div>

            {/* タブナビゲーション */}
            <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t">
                {Object.entries(TAB_MAP).map(([label, key]) => (
                    <Link
                        key={key}
                        to={`/admin/students/${studentId}/${key}`}
                        className={`px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
                            ${section === key ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'}
                        `}
                        aria-selected={section === key}
                        role="tab"
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* 編集ボタン（基本情報タブのみ表示） */}
            {section === 'basic' && (
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

            {section === 'basic' && (
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
