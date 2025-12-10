import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, id, icon, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={twMerge(
                        "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900",
                        icon && "pl-10",
                        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <span className="text-sm text-red-500 ml-1">{error}</span>}
        </div>
    );
}
