export const formatDate = (timestamp) => {
    if (!timestamp) return '－';
    try {
        return timestamp.toDate().toLocaleDateString();
    } catch {
        return '－';
    }
};
