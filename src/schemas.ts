import { z } from 'zod';

// 1. Zodスキーマを定義します (これが「設計図」)
export const TeacherSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: "名前は必須です" }), // バリデーションルールも追加可能
    kanalast: z.string().min(1, { message: "姓(カナ)は必須です" }),
    kanafirst: z.string().min(1, { message: "名(カナ)は必須です" }),
    // classroomCodeはオプショナル(存在しなくても良い)
    classroomCode: z.string().optional(),
    status: z.enum(['在職中', '休職中', '退職済']), // 特定の文字列しか許可しない
});

// 2. スキーマからTypeScriptの型を自動で生成します
export type Teacher = z.infer<typeof TeacherSchema>;
