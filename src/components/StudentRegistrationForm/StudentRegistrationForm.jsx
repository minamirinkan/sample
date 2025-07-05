// src/components/StudentRegistrationForm/StudentRegistrationForm.jsx
import { useEffect, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { registerCustomerAndStudent } from '../../utils/firebase/saveCustomerAndStudent';
import { useAuth } from '../../contexts/AuthContext';
import BasicInfoSection from './BasicInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import InternalInfoSection from './InternalInfoSection';
import { generateStudentCode } from './studentCodeGenerator';
import CourseInfoSection from './CourseInfoSection';
import SchoolInfoSection from './SchoolInfoSection';
import AddressInfoSection from './AddressInfoSection';

const StudentRegistrationForm = ({ onCancel }) => {
    const { adminData } = useAuth();
    const classroomCode = adminData?.classroomCode;
    const classroomName = adminData?.classroomName;

    const initialFormData = {
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        birthDate: '',
        gender: '',
        grade: '',
        schoolName: '',
        address: '',
        guardianName: '',
        guardianNameKana: '',
        relationship: '',
        guardianPhone: '',
        guardianEmail: '',
        emergencyContact: '',
        studentId: '',
        status: '在籍中',
        enrollmentDate: '',
        courseClass: '',
        courseSelected: false,
        courseType: '',
        courseStyle: '',
        weeklyCount: '',
        courseTime: '',
        startMonth: '',
        endMonth: '',
        remarks: '',
        locality: '',
        streetAddress: '',
        localityKana: '',
        streetAddressKana: '',
        postalCode: '',
        prefecture: '',
        address2: '',       // 市区町村
        address3: '',       // 番地等
        address2Kana: '',   // 市区町村フリガナ
        address3Kana: '',   // 番地等フリガナ
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [courseFormData, setCourseFormData] = useState([
        { selected: false, classType: '', subject: '', times: '', duration: '', startYear: '', startMonth: '', endYear: '', endMonth: '', note: '' }
    ]);

    useEffect(() => {
        const fetchAndSetStudentId = async () => {
            if (!classroomCode) return;
            const newId = await generateStudentCode(classroomCode);
            setFormData((prev) => ({ ...prev, studentId: newId }));
            setLoading(false);
        };
        fetchAndSetStudentId();
    }, [classroomCode]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (updatedAddress) => {
        setFormData((prev) => ({
            ...prev,
            ...updatedAddress,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lastName || !formData.firstName) {
            alert('氏名を入力してください');
            return;
        }

        const success = await registerCustomerAndStudent({
            uid: formData.studentId,
            customerName: formData.guardianName,
            phoneNumber: formData.guardianPhone,
            isFirstLogin: true,
            studentData: {
                ...formData,
                entryDate: formData.enrollmentDate,
                classroomCode,
                classroomName,
                registrationDate: serverTimestamp(),
            },
        });

        if (success) {
            alert('登録が完了しました');

            const newStudentId = await generateStudentCode(classroomCode);
            setFormData({
                ...initialFormData,
                studentId: newStudentId,
            });
        } else {
            alert('登録に失敗しました');
        }
    };

    const handleCancel = async () => {
        if (!classroomCode) return;
        const newCode = await generateStudentCode(classroomCode);
        setFormData({
            ...initialFormData,
            studentId: newCode,
        });

        if (typeof onCancel === 'function') {
            onCancel();
        }
    };

    if (!adminData || !classroomCode || loading) {
        return <div className="text-center text-gray-500">読み込み中...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 space-y-6 h-adr">
            <h2 className="text-xl font-bold mb-4">生徒新規登録フォーム</h2>

            {/* 左側：内部管理用、生徒基本情報、住所情報 */}
            {/* 右側：学校情報、保護者情報 */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <InternalInfoSection formData={formData} onChange={handleChange} />
                    </div>
                    <div className=
                        "bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <BasicInfoSection formData={formData} onChange={handleChange} />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <AddressInfoSection
                            formData={formData}
                            onChange={(updatedAddress) => setFormData(prev => ({
                                ...prev,
                                ...updatedAddress
                            }))}
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <SchoolInfoSection
                            schoolData={formData.school || {}}
                            onChange={(newSchoolData) =>
                                setFormData((prev) => ({ ...prev, school: newSchoolData }))
                            }
                        />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <GuardianInfoSection formData={formData} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* コース情報（受講情報） */}
            <div className="w-full overflow-x-auto">
                <div className="min-w-[800px] bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <CourseInfoSection
                        formData={courseFormData}
                        onChange={(newData) => setCourseFormData(newData)}
                    />
                </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-center gap-6 mt-8">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    登録する
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                >
                    キャンセル
                </button>
            </div>
        </form>
    );
};

export default StudentRegistrationForm;
