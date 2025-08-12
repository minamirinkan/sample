import { Teacher } from '../../../types'; // 型をインポート

export const filterTeachers = (teachers: Teacher[], searchTerm: string): Teacher[] => {
    // 検索文字列が空の場合は、全ての教師を返す
    if (!searchTerm.trim()) {
        return teachers;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    // teachersが配列であることを確認
    if (!Array.isArray(teachers)) {
        return [];
    }

    return teachers.filter((t: Teacher) => { // filter内のコールバック引数 't' にも型を定義
        const name = t.name || '';
        const kanafirst = t.kanafirst || '';
        const kanalast = t.kanalast || '';

        return (
            name.toLowerCase().includes(lowercasedSearchTerm) ||
            kanafirst.toLowerCase().includes(lowercasedSearchTerm) ||
            kanalast.toLowerCase().includes(lowercasedSearchTerm)
        );
    });
};
