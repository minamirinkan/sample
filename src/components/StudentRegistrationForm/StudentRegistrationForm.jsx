import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { serverTimestamp } from 'firebase/firestore';
import { registerCustomerAndStudent } from '../../utils/firebase/saveCustomerAndStudent';
import { useAuth } from '../../contexts/AuthContext';
import BasicInfoSection from './BasicInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import InternalInfoSection from './InternalInfoSection';
import EnrollmentInfosection from './EnrollmentInfoSection';

const StudentRegistrationForm = ({ onSubmit }) => {
    const { adminData } = useAuth();
    const classroomCode = adminData?.classroomCode || '';

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

    const generateStudentId = useCallback(async () => {
        if (!classroomCode) return;

        const q = query(
            collection(db, 'students'),
            where('studentId', '>=', `s${classroomCode}`),
            where('studentId', '<', `s${classroomCode}9999`)
        );

        const snapshot = await getDocs(q);

        let maxNumber = 0;
        snapshot.forEach((doc) => {
            const id = doc.data().studentId;
            const num = parseInt(id?.slice(4), 10);
            if (!isNaN(num) && num > maxNumber) maxNumber = num;
        });

        const newNumber = String(maxNumber + 1).padStart(4, '0');
        const newId = `s${classroomCode}${newNumber}`;
        setFormData((prev) => ({ ...prev, studentId: newId }));
    }, [classroomCode]);

    useEffect(() => {
        generateStudentId();
    }, [generateStudentId]);

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
                registrationDate: serverTimestamp(),
            },
        });

        if (success) {
            alert('登録が完了しました');
            setFormData(initialFormData); // 登録後リセット
        } else {
            alert('登録に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded shadow space-y-6">
            <h2 className="text-xl font-bold mb-4">生徒新規登録フォーム</h2>
            <BasicInfoSection formData={formData} onChange={handleChange} />
            <GuardianInfoSection formData={formData} onChange={handleChange} />
            <InternalInfoSection formData={formData} onChange={handleChange} />
            <EnrollmentInfosection formData={formData} onChange={handleChange} />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                登録する
            </button>
        </form>
    );
};

export default StudentRegistrationForm;
