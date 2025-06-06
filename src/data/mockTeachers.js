// src/data/mockStudents.js
// 仮データ（Firestore連携時に削除可）
export const mockTeachers = [
    { id: 1, code: 'T20230001', lastName: '田中', firstName: '一郎', subject: '数学', kana: 'タナカ イチロウ', hireDate: '2023/04/01', status: '在籍' },
    { id: 2, code: 'T20230002', lastName: '中村', firstName: 'さくら', subject: '英語', kana: 'ナカムラ サクラ', hireDate: '2022/04/01', status: '未登録' },
    { id: 3, code: 'T20230003', lastName: '高橋', firstName: '健太', subject: '理科', kana: 'タカハシ ケンタ', hireDate: '2021/04/01', status: '在籍' },
    { id: 4, code: 'T20230004', lastName: '佐藤', firstName: '真由美', subject: '国語', kana: 'サトウ マユミ', hireDate: '2020/04/01', status: '在籍' },
    { id: 5, code: 'T20230005', lastName: '伊藤', firstName: '翔太', subject: '社会', kana: 'イトウ ショウタ', hireDate: '2023/10/01', status: '未登録' },
    { id: 6, code: 'T20230006', lastName: '山本', firstName: '花子', subject: '英語', kana: 'ヤマモト ハナコ', hireDate: '2022/06/15', status: '在籍' },
    { id: 7, code: 'T20230007', lastName: '加藤', firstName: '大輔', subject: '数学', kana: 'カトウ ダイスケ', hireDate: '2019/09/01', status: '在籍' },
    { id: 8, code: 'T20230008', lastName: '小林', firstName: '彩', subject: '理科', kana: 'コバヤシ アヤ', hireDate: '2021/11/01', status: '未登録' },
    { id: 9, code: 'T20230009', lastName: '渡辺', firstName: '悠斗', subject: '社会', kana: 'ワタナベ ユウト', hireDate: '2023/01/01', status: '在籍' },
    { id: 10, code: 'T20230010', lastName: '斎藤', firstName: '美咲', subject: '国語', kana: 'サイトウ ミサキ', hireDate: '2020/03/01', status: '在籍' },
];

export default mockTeachers; // ✅ default export にする