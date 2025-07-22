import { Timestamp } from "firebase/firestore";

export type Student = {
    id: string; // FirestoreのドキュメントID
    studentId: string;
    name: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    gender: string;
    birthDate: string;
    grade: string;
    schoolName: string;
    schoolKana: string;
    schoolLevel: string;
    schoolType: string;
    schoolingStatus: string;
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
    guardianName: string;
    guardianLastName: string;
    guardianFirstName: string;
    guardianKanaLastName: string;
    guardianKanaFirstName: string;
    guardianPhone: string;
    guardianEmail: string;
    relationship: string;
    emergencyContact: string;
    remarks?: string;
    status: string;
    registrationDate: Timestamp;
    courses?: any; // courses の詳細わからないので any にしておく。必要なら型定義追加
};
