import { z } from 'zod';

// 1. Zodスキーマを定義します (これが「設計図」)
export const TeacherSchema = z.object({
    classroomCode: z.string().optional(),
    classroomName: z.string().optional(),
    hireDate: z.date().optional(),
    id: z.string().optional(),
    email: z.string(),
    firstName: z.string(),
    firstNameKana: z.string(),
    gender: z.enum(['男', '女', 'その他']),
    lastName: z.string(),
    lastNameKana: z.string(),
    phone: z.string(),
    transportation: z.number(),
    university: z.string(),
    universityGrade: z.string(),
    code: z.string(),
    fullnameKana: z.string(),
    fullname: z.string().min(1, { message: "名前は必須です" }), // バリデーションルールも追加可能
    status: z.enum(['在職中', '休職中', '退職済']), // 特定の文字列しか許可しない
    registrationDate: z.date(),
    subject: z.string(),
});

// 2. スキーマからTypeScriptの型を自動で生成します
export type Teacher = z.infer<typeof TeacherSchema>;
