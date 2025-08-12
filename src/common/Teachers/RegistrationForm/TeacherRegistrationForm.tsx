import React, { useState, useEffect } from 'react';
import { registerTeacher } from './firebase/saveTeacher';
import { getAuth } from 'firebase/auth';

import { useGenerateTeacherCode } from './components/teacherCodeGenerator';
import BasicInfoSection from './components/BasicInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import EmploymentInfoSection from './components/EmploymentInfoSection';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';

// ★ 修正: 不要なインポートを削除
// import { EmploymentFormData } from './components/EmploymentInfoSection';

// Propsの型定義
interface TeacherRegistrationFormProps {
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
}

// formDataの型定義
interface FormData {
  code: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  gender: string;
  university: string;
  universityGrade: string;
  phone: string;
  email: string;
  hireDate: string;
  status: "在職中" | "退職済"; // この型定義が重要
  transportation: string;
}

const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({ onCancel, onSubmitSuccess }) => {
  const { classroom } = useAdminData();
  const classroomCode = classroom?.classroom?.code ?? '';
  const classroomName = classroom?.classroom?.name ?? '';

  const initialFormData: FormData = {
    code: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    gender: '',
    university: '',
    universityGrade: '',
    phone: '',
    email: '',
    hireDate: '',
    status: '在職中',
    transportation: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const generateTeacherCode = useGenerateTeacherCode(classroomCode);

  useEffect(() => {
    const setupCode = async () => {
      const newCode = await generateTeacherCode();
      setFormData((prev) => ({ ...prev, code: newCode }));
    };
    setupCode();
  }, [generateTeacherCode]);

  // ★ 修正: handleChangeをシンプルに
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.lastName || !formData.firstName) {
      alert('氏名を入力してください');
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert('ログイン情報が確認できません。再ログインしてください。');
        return;
      }

      const idToken = await currentUser.getIdToken();

      const success = await registerTeacher({
        code: formData.code,
        fullName: `${formData.lastName} ${formData.firstName}`,
        fullNameKana: `${formData.lastNameKana} ${formData.firstNameKana}`,
        email: formData.email,
        teacherData: {
          ...formData,
          classroomCode,
          classroomName,
          registrationDate: new Date(),
        },
        idToken,
      });

      if (success) {
        alert('講師登録が完了しました');
        if (onSubmitSuccess) onSubmitSuccess();
        const newCode = await generateTeacherCode();
        setFormData({
          ...initialFormData,
          code: newCode,
        });
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

      <div className="flex justify-center gap-6 mt-8">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          登録する
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData(initialFormData);
            const setup = async () => {
              const newCode = await generateTeacherCode();
              setFormData((prev) => ({ ...prev, code: newCode }));
            };
            setup();

            if (typeof onCancel === 'function') {
              onCancel();
            }
          }}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default TeacherRegistrationForm;
