import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { registerTeacher } from './firebase/saveTeacher';
import { getAuth } from 'firebase/auth';
import { useGenerateTeacherCode } from './components/teacherCodeGenerator';
import BasicInfoSection from './components/BasicInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import EmploymentInfoSection from './components/EmploymentInfoSection';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';
import { TeacherSchema, Teacher } from '../../../schemas';

// Propsの型を定義
interface TeacherRegistrationFormProps {
  onCancel?: () => void;
}

// formDataの型定義
const PartialTeacherSchema = TeacherSchema.pick({
  code: true,
  lastName: true,
  firstName: true,
  fullname: true,
  lastNameKana: true,
  firstNameKana: true,
  fullnameKana: true,
  gender: true,
  university: true,
  universityGrade: true,
  phone: true,
  email: true,
  hireDate: true,
  status: true,
  transportation: true,
}).partial();

export type FormData = z.infer<typeof PartialTeacherSchema>;

const initialFormData: FormData = {
  code: '',
  lastName: '',
  firstName: '',
  fullname: '',
  lastNameKana: '',
  firstNameKana: '',
  fullnameKana: '',
  gender: '男性',           // enum の初期値を設定
  university: '',
  universityGrade: '',
  phone: '',
  email: '',
  hireDate: undefined,    // optional なので undefined でOK
  status: '在職中',       // enum の初期値を設定
  transportation: 0,      // number 型なので0で初期化
};

const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const { classroom } = useAdminData();
  const classroomCode = classroom?.classroom?.code ?? '';

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
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    const setup = async () => {
      const newCode = await generateTeacherCode();
      setFormData((prev) => ({ ...prev, code: newCode }));
    };
    setup();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.lastName || !formData.firstName || !formData.email) {
      alert('氏名とメールアドレスを入力してください');
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

      // TeacherSchema の必須項目をすべて埋める
      const teacherData: Teacher = TeacherSchema.parse({
        code: formData.code!,
        lastName: formData.lastName,
        firstName: formData.firstName,
        fullname: `${formData.lastName} ${formData.firstName}`,
        lastNameKana: formData.lastNameKana || '',
        firstNameKana: formData.firstNameKana || '',
        fullnameKana: `${formData.lastNameKana || ''} ${formData.firstNameKana || ''}`,
        gender: formData.gender || '男',
        university: formData.university || '',
        universityGrade: formData.universityGrade || '',
        phone: formData.phone || '',
        email: formData.email!,
        hireDate: formData.hireDate,
        status: formData.status || '在職中',
        transportation: formData.transportation ?? 0,
        registrationDate: new Date(), // Firestore側で serverTimestamp() に置き換えられる
        subject: '', // 必須項目なので空文字で初期化
        classroomCode: classroom?.classroom?.code ?? '',
        classroomName: classroom?.classroom?.name ?? '',
      });

      const success = await registerTeacher({
        code: formData.code!,
        classroomCode: classroom?.classroom?.code ?? '',
        classroomName: classroom?.classroom?.name ?? '',
        email: formData.email!,
        teacherData,
        idToken,
      });

      if (success) {
        alert('講師登録が完了しました');
        navigate("/admin/teachers/new");
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
          onClick={onCancel ? onCancel : handleCancel}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default TeacherRegistrationForm;
