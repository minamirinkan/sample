export interface Teacher {
    id: number;
    name: string;
    kanalast: string;
    kanafirst: string;
    // 以下、teacherオブジェクトに含まれる可能性のあるプロパティを追記できます
    [key: string]: any;
}
