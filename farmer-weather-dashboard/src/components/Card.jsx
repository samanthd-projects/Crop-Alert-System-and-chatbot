import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={twMerge("bg-white rounded-2xl shadow-soft border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg", className)}
            {...props}
        >
            {children}
        </div>
    );
}
