// src/components/ui/avatar.tsx
import React from "react";

export const Avatar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {children}
        </div>
    );
};

export const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <span className="text-sm font-bold text-gray-700">{children}</span>
    );
};
