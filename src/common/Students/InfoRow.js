// src/components/InfoRow.js
import React from 'react';

const InfoRow = ({ label, value, name, isEditing, readOnly, onChange }) => (
    <div className="flex text-sm border-b border-gray-200 py-1">
        <span className="w-32 text-gray-500">{label}</span>
        {isEditing && !readOnly ? (
            <input
                type="text"
                name={name}
                value={value || ''}
                onChange={onChange}
                className="border border-gray-300 px-2 py-0.5 rounded w-full text-gray-800"
            />
        ) : (
            <span className="text-gray-800 font-medium">{value || '－'}</span>
        )}
    </div>
);

export default InfoRow;
