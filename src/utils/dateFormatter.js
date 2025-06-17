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
