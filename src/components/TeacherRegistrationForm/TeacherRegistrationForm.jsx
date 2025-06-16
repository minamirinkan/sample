import { useState, useEffect } from 'react';
import { registerTeacher } from '../../utils/firebase/saveTeacher';
import { useAuth } from '../../contexts/AuthContext';

import { useGenerateTeacherCode } from './teacherCodeGenerator';
import BasicInfoSection from './BasicInfoSection';
import ContactInfoSection from './ContactInfoSection';
import EmploymentInfoSection from './EmploymentInfoSection';

const TeacherRegistrationForm = () => {
    const { adminData } = useAuth();
    const classroomCode = adminData?.classroomCode || '';

    const initialFormData = {
        code: '',
        lastName: '',
        firstName: '',
        kanalastName: '',
        kanafirstName: '',
        university: '',
        universityGrade: '',
        phone: '',
        email: '',
        hireDate: '',
        status: '在職中',
        transportation: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const generateTeacherCode = useGenerateTeacherCode(classroomCode);

    useEffect(() => {
        const setupCode = async () => {
            const newCode = await generateTeacherCode();
            setFormData((prev) => ({ ...prev, code: newCode }));
        };
        setupCode();
    }, [generateTeacherCode]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.lastName || !formData.firstName) {
            alert('氏名を入力してください');
            return;
        }

        try {
            const success = await registerTeacher({
                code: formData.code,
                teacherName: `${formData.lastName} ${formData.firstName}`, // 任意。使わないなら削除OK
                teacherKanaName: `${formData.kanalastName} ${formData.kanafirstName}`,
                email: formData.email,
                phoneNumber: formData.phone,
                teacherData: {
                    ...formData,
                    classroomCode,
                    registrationDate: new Date(),
                    role: 'teacher',
                    isFirstLogin: true,
                },
            });

            if (success) {
                alert('講師登録が完了しました');
                setFormData(initialFormData);
                const newCode = await generateTeacherCode();
                setFormData((prev) => ({ ...prev, code: newCode }));
            } else {
                alert('講師登録に失敗しました。');
            }
        } catch (error) {
            console.error('登録エラー:', error);
            alert('登録に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded shadow space-y-6">
            <h2 className="text-xl font-bold mb-4">講師新規登録フォーム</h2>
            <BasicInfoSection formData={formData} onChange={handleChange} />
            <ContactInfoSection formData={formData} onChange={handleChange} />
            <EmploymentInfoSection formData={formData} onChange={handleChange} />

            <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                登録する
            </button>
        </form>
    );
};

export default TeacherRegistrationForm;
