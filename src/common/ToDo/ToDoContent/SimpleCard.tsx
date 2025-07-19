import React from 'react';

type CardProps = {
    title: React.ReactNode;
    children?: React.ReactNode;
};

const SimpleCard: React.FC<CardProps> = ({ title, children }) => (
    <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm w-full">
        <h2 className="text-lg font-semibold mb-3 text-blue-600">{title}</h2>
        {children}
    </div>
);

export default SimpleCard;
