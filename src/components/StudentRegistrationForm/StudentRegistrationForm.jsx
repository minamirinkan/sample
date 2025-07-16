// src/components/StudentRegistrationForm/StudentRegistrationForm.jsx
import { useEffect, useState } from 'react';
import { serverTimestamp, addDoc, collection, getFirestore } from 'firebase/firestore';
import { registerCustomerAndStudent } from '../../utils/firebase/saveCustomerAndStudent';
import { useAuth } from '../../contexts/AuthContext.tsx';
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
        entryDate: '',
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        name: '',
        birthDate: '',
        gender: '',
        grade: '',
        guardianLastName: '',
        guardianFirstName: '',
        guardianKanaLastName: '',
        guardianKanaFirstName: '',
        guardianName: '',
        relationship: '',
        guardianPhone: '',
        guardianEmail: '',
        emergencyContact: '',
        studentId: '',
        registrationDate: '',
        remarks: '',
        postalCode: '',
        prefecture: '',
        city: '',       // 市区町村
        streetAddress: '',       // 番地等
        buildingName: '',       // 建物名・部屋番号
        cityKana: '',   // 市区町村フリガナ
        streetAddressKana: '',   // 番地等フリガナ
    };

    const initialCourseFormData = {
        kind: '通常',         // コース種別（講習・通常など）
        subject: '',   // 科目など
        classType: '',  // スタイル（1:1、集団）
        times: '',  // 週回数
        duration: '',   // 時間帯
        startMonth: '',   // 開始月
        endMonth: '',     // 終了月
        startYear: '',    // 年（←保存に必要）
        endYear: '',
        note: '',         // 備考
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [lessonType, setLessonType] = useState('');
    const [courseFormData, setCourseFormData] = useState([]);

    console.log('保存するデータ:', courseFormData);
    useEffect(() => {
        if (lessonType === 'regular') {
            if (courseFormData.length === 0) {
                setCourseFormData([initialCourseFormData]);
            }
        } else {
            if (courseFormData.length > 0) {
                setCourseFormData([]);
            }
        }
    }, [lessonType]);

    useEffect(() => {
        if (formData.schoolLevel) {
            setCourseFormData((prev) =>
                prev.map((row) => ({ ...row, subject: '' }))
            );
        }
    }, [formData.schoolLevel]);

    const handleLessonTypeChange = (value) => {
        setLessonType(value);
        setCourseFormData([]); // レギュラー/非レギュラー切り替え時に初期化！
    };

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

    const { user } = useAuth();
    const currentAdminUid = user?.uid;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lastName || !formData.firstName) {
            alert('氏名を入力してください');
            return;
        }

        const success = await registerCustomerAndStudent({
            uid: formData.studentId,
            customerName: `${formData.guardianLastName} ${formData.guardianFirstName}`,
            phoneNumber: formData.guardianPhone,
            isFirstLogin: true,
            studentData: {
                ...formData,
                classroomCode,
                classroomName,
                name: `${formData.lastName} ${formData.firstName}`,
                registrationDate: serverTimestamp(),
                courseFormData: courseFormData.map((course) => {
                    const updated = { ...course };
                    if (updated.subject === 'その他') {
                        updated.subject = updated.subjectOther || '';
                    }
                    delete updated.subjectOther;
                    return updated;
                }),
            },
        });

        if (success) {
            const db = getFirestore();
            await addDoc(collection(db, 'logs'), {
                adminUid: currentAdminUid, // ログイン中のadmin UID
                action: '生徒新規登録',
                target: `${formData.lastName} ${formData.firstName}`,
                detail: `教室: ${classroomName} / 氏名: ${formData.lastName} ${formData.firstName}`,
                timestamp: serverTimestamp(),
            });
            alert('登録が完了しました');

            setLessonType("");

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
                        <InternalInfoSection
                            lessonType={lessonType}
                            formData={formData}
                            onChange={handleChange}
                            onLessonTypeChange={handleLessonTypeChange}
                        />
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
                            schoolData={{
                                schoolingStatus: formData.schoolingStatus,
                                schoolType: formData.schoolType,
                                schoolLevel: formData.schoolLevel,
                                schoolName: formData.schoolName,
                                schoolKana: formData.schoolKana,
                                grade: formData.grade, // ← ここでトップレベルの grade を渡す
                            }}
                            onChange={(updatedSchoolData) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    ...updatedSchoolData, // ← grade もここでトップレベルに入る
                                }));
                            }}
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
                        lessonType={lessonType}
                        formData={courseFormData || []}
                        onChange={setCourseFormData}
                        setLessonType={setLessonType}
                        schoolLevel={formData.schoolLevel}
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
