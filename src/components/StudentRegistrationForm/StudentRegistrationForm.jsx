// src/components/StudentRegistrationForm/StudentRegistrationForm.jsx
import { useEffect, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { registerCustomerAndStudent } from '../../utils/firebase/saveCustomerAndStudent';
import { useAuth } from '../../contexts/AuthContext';
import BasicInfoSection from './BasicInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import InternalInfoSection from './InternalInfoSection';
import EnrollmentInfosection from './EnrollmentInfoSection';
import { generateStudentCode } from './studentCodeGenerator';

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
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);

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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded shadow space-y-6">
            <h2 className="text-xl font-bold mb-4">生徒新規登録フォーム</h2>
            <BasicInfoSection formData={formData} onChange={handleChange} />
            <GuardianInfoSection formData={formData} onChange={handleChange} />
            <InternalInfoSection formData={formData} onChange={handleChange} />
            <EnrollmentInfosection formData={formData} onChange={handleChange} />

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
