// src/components/ui/avatar.tsx
import React from "react";

type AvatarProps = {
    children: React.ReactNode;
    className?: string; // 追加
};

export const Avatar: React.FC<AvatarProps> = ({ children, className }) => {
    return (
        <div
            className={`w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
        >
            {children}
        </div>
    );
};

type AvatarFallbackProps = {
    children: React.ReactNode;
    className?: string;
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className }) => {
    return <span className={`text-sm font-bold text-gray-700 ${className}`}>{children}</span>;
};
