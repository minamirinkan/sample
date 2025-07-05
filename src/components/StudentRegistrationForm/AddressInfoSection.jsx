import React, { useEffect, useRef } from 'react';

const AddressInfoSection = ({ formData, onChange }) => {
    const prefectureRef = useRef(null);
    const cityRef = useRef(null);
    const streetRef = useRef(null);

    const handleChange = (field, value) => {
        onChange({
            ...formData,
            [field]: value,
        });
    };

    // 郵便番号補完による自動入力 → formData へ反映
    useEffect(() => {
        const interval = setInterval(() => {
            const newData = {
                prefecture: prefectureRef.current?.value || '',
                address2: cityRef.current?.value || '',
                address3: streetRef.current?.value || '',
            };

            const hasChanged =
                newData.prefecture !== formData.prefecture ||
                newData.address2 !== formData.address2 ||
                newData.address3 !== formData.address3;

            if (hasChanged) {
                onChange({
                    ...formData,
                    ...newData,
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [formData, onChange]);

    return (
        <div className="p-4 yubinbango">
            <span className="p-country-name" style={{ display: 'none' }}>Japan</span>

            {/* 郵便番号 */}
            <label className="block mb-2 font-bold" htmlFor="postalCode">郵便番号</label>
            <input
                type="text"
                name="postal-code"
                className="postal-code"
                id="postalCode"
                maxLength={7}
                value={formData.postalCode || ''}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                pattern="\d{3}-?\d{4}"
                placeholder="例: 1234567"
            />

            {/* 都道府県 */}
            <label className="block mt-4 mb-2 font-bold" htmlFor="prefecture">都道府県</label>
            <input
                type="text"
                name="address1"
                className="p-region address1"
                id="prefecture"
                value={formData.prefecture || ''}
                onChange={(e) => handleChange('prefecture', e.target.value)}
                ref={prefectureRef}
                placeholder="例: 東京都"
            />

            {/* 市区町村 */}
            <label className="block mt-4 mb-2 font-bold" htmlFor="city">市区町村</label>
            <input
                type="text"
                name="address2"
                className="p-locality address2"
                id="city"
                value={formData.address2 || ''}
                onChange={(e) => handleChange('address2', e.target.value)}
                ref={cityRef}
            />

            {/* 番地等 */}
            <label className="block mt-4 mb-2 font-bold" htmlFor="street">番地等</label>
            <input
                type="text"
                name="address3"
                className="p-street-address address3"
                id="street"
                value={formData.address3 || ''}
                onChange={(e) => handleChange('address3', e.target.value)}
                ref={streetRef}
            />

            {/* 市区町村フリガナ */}
            <label className="block mt-4 mb-2 font-bold" htmlFor="cityKana">市区町村（フリガナ）</label>
            <input
                type="text"
                id="cityKana"
                value={formData.address2Kana || ''}
                onChange={(e) => handleChange('address2Kana', e.target.value)}
                placeholder="カタカナで入力"
            />

            {/* 番地等フリガナ */}
            <label className="block mt-4 mb-2 font-bold" htmlFor="streetKana">番地等（フリガナ）</label>
            <input
                type="text"
                id="streetKana"
                value={formData.address3Kana || ''}
                onChange={(e) => handleChange('address3Kana', e.target.value)}
                placeholder="カタカナで入力"
            />
        </div>
    );
};

export default AddressInfoSection;
