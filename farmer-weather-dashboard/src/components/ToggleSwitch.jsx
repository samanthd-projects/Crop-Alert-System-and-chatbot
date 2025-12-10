import React from 'react';
import { clsx } from 'clsx';

export function ToggleSwitch({ checked, onChange, label }) {
    return (
        <label className="flex items-center cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={clsx(
                    "w-11 h-6 rounded-full shadow-inner transition-colors duration-300 ease-in-out",
                    checked ? "bg-primary-500" : "bg-gray-200 group-hover:bg-gray-300"
                )}></div>
                <div className={clsx(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 cubic-bezier(0.4, 0.0, 0.2, 1)",
                    checked ? "translate-x-5" : "translate-x-0"
                )}></div>
            </div>
            {label && <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>}
        </label>
    );
}
