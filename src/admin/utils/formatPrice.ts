const formatPrice = (price?: string) => {
        if (!price) return "";
        const num = Number(price);
        return num.toLocaleString("ja-JP") + "円";
    };

export default formatPrice