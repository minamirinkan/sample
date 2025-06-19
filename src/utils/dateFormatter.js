export const formatDate = (input) => {
    if (!input) return '－';

    let date;

    try {
        if (typeof input.toDate === 'function') {
            // Firestore Timestamp
            date = input.toDate();
        } else if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string') {
            // Safari対応のため、ハイフンをスラッシュに置換
            date = new Date(input.replace(/-/g, '/'));
        } else if (typeof input === 'number') {
            date = new Date(input);
        } else {
            return '－';
        }

        if (isNaN(date.getTime())) return '－';

        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return '－';
    }
};

// 新しく追加：曜日を返す関数
export const getJapaneseDayOfWeek = (input) => {
    if (!input) return '';

    let date;

    try {
        if (typeof input.toDate === 'function') {
            date = input.toDate();
        } else if (input instanceof Date) {
            date = input;
        } else if (typeof input === 'string') {
            date = new Date(input.replace(/-/g, '/'));
        } else if (typeof input === 'number') {
            date = new Date(input);
        } else {
            return '';
        }

        if (isNaN(date.getTime())) return '';

        const days = ['日', '月', '火', '水', '木', '金', '土'];
        return days[date.getDay()];
    } catch {
        return '';
    }
};

// utils/dateFormatter.js
export const getDayOfWeekFromYyyyMmDd = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDay(); // 0=日曜, 1=月曜...
};

