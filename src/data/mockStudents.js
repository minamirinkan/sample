// src/data/mockStudents.js
// 仮データ（Firestore連携時に削除可）

export const mockStudents = [
    { id: 1, code: '20230001', lastName: '山田', firstName: '太郎', kana: 'ヤマダ タロウ', grade: '中学3年', entryDate: '2024/04/01', billingStatus: '作成済' },
    { id: 2, code: '20230002', lastName: '佐藤', firstName: '花子', kana: 'サトウ ハナコ', grade: '中学2年', entryDate: '2024/04/01', billingStatus: '未請求' },
    { id: 3, code: '20230003', lastName: '鈴木', firstName: '一郎', kana: 'スズキ イチロウ', grade: '中学1年', entryDate: '2024/04/01', billingStatus: '作成済' },
    { id: 4, code: '20230004', lastName: '高橋', firstName: '優子', kana: 'タカハシ ユウコ', grade: '中学3年', entryDate: '2024/05/01', billingStatus: '未請求' },
    { id: 5, code: '20230005', lastName: '伊藤', firstName: '健太', kana: 'イトウ ケンタ', grade: '中学2年', entryDate: '2024/05/01', billingStatus: '作成済' },
    { id: 6, code: '20230006', lastName: '渡辺', firstName: '美咲', kana: 'ワタナベ ミサキ', grade: '中学1年', entryDate: '2024/05/15', billingStatus: '未請求' },
    { id: 7, code: '20230007', lastName: '中村', firstName: '大翔', kana: 'ナカムラ ヒロト', grade: '中学3年', entryDate: '2024/04/10', billingStatus: '作成済' },
    { id: 8, code: '20230008', lastName: '小林', firstName: 'さくら', kana: 'コバヤシ サクラ', grade: '中学2年', entryDate: '2024/04/20', billingStatus: '未請求' },
    { id: 9, code: '20230009', lastName: '加藤', firstName: '悠真', kana: 'カトウ ユウマ', grade: '中学1年', entryDate: '2024/06/01', billingStatus: '作成済' },
    { id: 10, code: '20230010', lastName: '吉田', firstName: '葵', kana: 'ヨシダ アオイ', grade: '中学3年', entryDate: '2024/06/05', billingStatus: '未請求' },
    { id: 11, code: '20230011', lastName: '山本', firstName: '颯太', kana: 'ヤマモト ソウタ', grade: '中学2年', entryDate: '2024/06/10', billingStatus: '作成済' },
    { id: 12, code: '20230012', lastName: '斎藤', firstName: '楓', kana: 'サイトウ カエデ', grade: '中学1年', entryDate: '2024/06/15', billingStatus: '未請求' },
    { id: 13, code: '20230013', lastName: '松本', firstName: '海翔', kana: 'マツモト カイト', grade: '中学3年', entryDate: '2024/07/01', billingStatus: '作成済' },
    { id: 14, code: '20230014', lastName: '井上', firstName: '結衣', kana: 'イノウエ ユイ', grade: '中学2年', entryDate: '2024/07/01', billingStatus: '未請求' },
    { id: 15, code: '20230015', lastName: '木村', firstName: '蓮', kana: 'キムラ レン', grade: '中学1年', entryDate: '2024/07/01', billingStatus: '作成済' },
    { id: 16, code: '20230016', lastName: '林', firstName: '心春', kana: 'ハヤシ コハル', grade: '中学3年', entryDate: '2024/08/01', billingStatus: '未請求' },
    { id: 17, code: '20230017', lastName: '清水', firstName: '陽翔', kana: 'シミズ ハルト', grade: '中学2年', entryDate: '2024/08/10', billingStatus: '作成済' },
    { id: 18, code: '20230018', lastName: '山口', firstName: '莉子', kana: 'ヤマグチ リコ', grade: '中学1年', entryDate: '2024/08/15', billingStatus: '未請求' },
    { id: 19, code: '20230019', lastName: '橋本', firstName: '優太', kana: 'ハシモト ユウタ', grade: '中学3年', entryDate: '2024/09/01', billingStatus: '作成済' },
    { id: 20, code: '20230020', lastName: '青木', firstName: '芽依', kana: 'アオキ メイ', grade: '中学2年', entryDate: '2024/09/05', billingStatus: '未請求' },
];

export default mockStudents; // ✅ default export にする