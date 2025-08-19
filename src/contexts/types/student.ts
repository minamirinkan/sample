import { Timestamp } from "firebase/firestore";

export type BasedStudent = {
    id?: string; // FirestoreのドキュメントID
    uid?: string;
    studentId?: string;
    fullname: string;
    fullnameKana: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    gender: string;
    birthDate: string;
    grade: string;
    schoolName: string;
    schoolKana: string;
    schoolLevel: '小学校' | '中学校' | '高等学校' | '';
    schoolType: '国立' | '公立' | '私立' | '通信制' | '';
    schoolingStatus?: '未就学児' | '在学生' | '既卒生' | '';
    classroomCode: string;
    classroomName: string;
    customerUid: string;
    entryDate: string;
    postalCode: string;
    prefecture: string;
    city: string;
    cityKana: string;
    streetAddress: string;
    streetAddressKana: string;
    buildingName: string;
    email?: string;
    phone?: string;
    guardianfullName: string;
    guardianfullNameKana: string;
    guardianLastName: string;
    guardianFirstName: string;
    guardianLastNameKana: string;
    guardianFirstNameKana: string;
    guardianPhone: string;
    guardianEmail: string;
    relationship: string;
    emergencyContact: string;
    remarks?: string;
    status: string;
    registrationDate: Timestamp;
    courses?: any; // courses の詳細わからないので any にしておく。必要なら型定義追加
    courseFormData?: any;
    billingStatus?: string;
    seat?: string;     // 座席番号
    subject?: string;  // 科目
};

export type Student = BasedStudent

export type RowStudent = BasedStudent & {
    originRow: number;
    originPeriod: number;
    seat?: string;     // 座席番号
    subject?: string;  // 科目
};

