import React from 'react';

type CardProps = {
    title: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

const SimpleCard: React.FC<CardProps> = ({ title, children, className  }) => (
    <div className={`p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm w-full ${className || ''}`}>
        <h2 className="text-lg font-semibold mb-3 text-blue-600">{title}</h2>
        {children}
    </div>
);

export default SimpleCard;
