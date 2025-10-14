// src/components/StudentRegistrationForm/StudentRegistrationForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverTimestamp, addDoc, collection, getFirestore, Timestamp } from 'firebase/firestore';
import { registerCustomerAndStudent } from '../firebase/saveCustomerAndStudent';
import { useAuth } from '../../../contexts/AuthContext';
import BasicInfoSection from './components/BasicInfoSection';
import GuardianInfoSection from './components/GuardianInfoSection';
import InternalInfoSection from './components/InternalInfoSection';
import { generateStudentCode } from './firebase/studentCodeGenerator';
import CourseInfoSection from './components/CourseInfoSection';
import SchoolInfoSection from './components/SchoolInfoSection';
import AddressInfoSection from './components/AddressInfoSection';
import { Student } from '../../../contexts/types/student';
import { SchoolDataItem } from '../../../contexts/types/schoolData';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { toast } from 'react-toastify';

interface StudentRegistrationFormProps {
    onCancel?: () => void;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ onCancel }) => {
    const { user, loading } = useAuth();
    const currentAdminUid = user?.uid;
    const { userData, loading: adminLoading } = useAdminData() ?? { userData: null, loading: true };
    const navigate = useNavigate();
    const classroomCode = userData?.classroomCode ?? '';
    const classroomName = userData?.name ?? '';

    const initialFormData: Partial<Student> = {
        studentId: '',
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        guardianLastName: '',
        guardianFirstName: '',
        guardianLastNameKana: '',
        guardianFirstNameKana: '',
        guardianPhone: '',
        guardianEmail: '',
        courses: [],
        registrationDate: serverTimestamp() as Timestamp,
        classroomCode: '',
        classroomName: '',
        fullname: '',
        fullnameKana: '',
        guardianfullName: '',
        guardianfullNameKana: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [courseFormData, setCourseFormData] = useState<SchoolDataItem[]>([]);
    const [lessonType, setLessonType] = useState<'regular' | 'nonRegular'>('regular');
    const [submitting, setSubmitting] = useState(false);

    // モーダル用
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [ignoreAuthCheck, setIgnoreAuthCheck] = useState(false);

    useEffect(() => {
        const fetchAndSetStudentId = async () => {
            if (!classroomCode) return;
            const newId = await generateStudentCode(classroomCode);
            setFormData(prev => ({ ...prev, studentId: newId }));
        };
        fetchAndSetStudentId();
    }, [classroomCode]);

    useEffect(() => {
        if (!loading && !user && !ignoreAuthCheck) {
            const pathname = window.location.pathname;
            if (!pathname.includes("-login") && pathname !== '/admin/students/new') navigate("/");
        }
    }, [user, loading, ignoreAuthCheck, navigate]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLessonTypeChange = (value: 'regular' | 'nonRegular') => {
        setLessonType(value);
        if (value === 'nonRegular') setCourseFormData([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lastName || !formData.firstName) {
            toast.error('氏名を入力してください');
            return;
        }
        // パスワードモーダルを表示
        setShowPasswordModal(true);
    };

    const handleConfirmPassword = async () => {
        if (!adminPassword) {
            toast.error("パスワードを入力してください");
            return;
        }

        setShowPasswordModal(false);
        setIgnoreAuthCheck(true);
        setSubmitting(true);

        try {
            const success = await registerCustomerAndStudent({
                uid: formData.studentId ?? "",
                phoneNumber: formData.guardianPhone ?? "",
                studentData: {
                    ...(formData as Student),
                    classroomCode,
                    classroomName,
                    fullname: `${formData.lastName} ${formData.firstName}`,
                    fullnameKana: `${formData.lastNameKana} ${formData.firstNameKana}`,
                    guardianfullName: `${formData.guardianLastName} ${formData.guardianFirstName}`,
                    guardianfullNameKana: `${formData.guardianLastNameKana} ${formData.guardianFirstNameKana}`,
                    registrationDate: Timestamp.fromDate(new Date()),
                    courses: courseFormData ?? [],
                },
                userPassword: adminPassword, // ← 管理者パスワード
                setLoading: setSubmitting,
            });

            if (success) {
                const db = getFirestore();
                await addDoc(collection(db, "logs"), {
                    adminUid: currentAdminUid,
                    action: "生徒新規登録",
                    target: `${formData.lastName} ${formData.firstName}`,
                    detail: `教室: ${classroomName} / 氏名: ${formData.lastName} ${formData.firstName}`,
                    timestamp: serverTimestamp(),
                });

                const newStudentId = await generateStudentCode(classroomCode);
                setFormData({ ...initialFormData, studentId: newStudentId });

                toast.success("登録が完了しました！");
                navigate("/admin/students/new");
            } else {
                toast.error("登録に失敗しました");
            }
        } catch (error) {
            console.error(error);
            toast.error("予期せぬエラーが発生しました");
        } finally {
            setSubmitting(false);
            setIgnoreAuthCheck(false);
            setAdminPassword("");
        }
    };

    const handleCancel = async () => {
        if (!classroomCode) return;
        const newCode = await generateStudentCode(classroomCode);
        setFormData({ ...initialFormData, studentId: newCode });
    };

    if (adminLoading) return <LoadingSpinner />;
    if (!userData) return <div className="text-red-500 text-center">ユーザーデータが見つかりません</div>;
    if (!classroomCode) return <div className="text-gray-500 text-center">読み込み中...</div>;

    return (
        <>
            {/* ローディングオーバーレイ */}
            {submitting && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <LoadingSpinner />
                </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 space-y-6 h-adr">
                <h2 className="text-xl font-bold mb-4">生徒新規登録フォーム</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <InternalInfoSection
                                lessonType={lessonType}
                                formData={formData}
                                onChange={handleChange}
                                onLessonTypeChange={handleLessonTypeChange}
                                courseData={courseFormData}
                                setCourseData={setCourseFormData}
                            />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <BasicInfoSection formData={formData} onChange={handleChange} />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <AddressInfoSection
                                formData={formData}
                                onChange={updatedAddress => setFormData(prev => ({ ...prev, ...updatedAddress }))}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <SchoolInfoSection
                                schoolData={{
                                    schoolingStatus: formData.schoolingStatus || undefined,
                                    schoolType: formData.schoolType || undefined,
                                    schoolLevel: formData.schoolLevel || undefined,
                                    schoolName: formData.schoolName,
                                    schoolKana: formData.schoolKana,
                                    grade: formData.grade,
                                }}
                                onChange={updatedSchoolData => setFormData(prev => ({ ...prev, ...updatedSchoolData }))}
                            />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <GuardianInfoSection formData={formData} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <CourseInfoSection
                            lessonType={lessonType}
                            formData={courseFormData || []}
                            onChange={setCourseFormData}
                            setLessonType={setLessonType}
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-6 mt-8">
                    {submitting && <LoadingSpinner />}
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        登録する
                    </button>
                    <button
                        type="button"
                        onClick={onCancel ? onCancel : handleCancel}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                    >
                        キャンセル
                    </button>
                </div>
            </form>

            {/* 管理者パスワードモーダル */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h3 className="text-lg font-bold mb-4">管理者パスワードを入力してください</h3>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 mb-4"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                キャンセル
                            </button>
                            <button onClick={handleConfirmPassword} className="px-4 py-2 bg-blue-600 text-white rounded">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentRegistrationForm;
