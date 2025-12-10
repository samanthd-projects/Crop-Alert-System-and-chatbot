import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Bell,
    Sprout,
    User,
    Menu,
    X,
    CloudSun
} from 'lucide-react';
import { clsx } from 'clsx';
import { Chatbot } from './Chatbot';
import { auth } from '../utils/auth';

export function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const user = auth.getUser();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Alerts History', href: '/alerts', icon: Bell },
        { name: 'Crop Management', href: '/crops', icon: Sprout },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-soft transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-20 flex items-center px-8 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-xl">
                            <CloudSun className="w-8 h-8 text-primary-600" />
                        </div>
                        <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">AgriAlert</span>
                    </div>
                    <button
                        className="ml-auto lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
                    </div>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || 
                            (item.href !== '/' && location.pathname.startsWith(item.href));
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary-50 text-primary-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={clsx(
                                    "mr-3 h-5 w-5 transition-colors",
                                    isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                                )} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    {user ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                                        {user.name || user.email}
                                    </p>
                                    <p className="text-xs text-gray-500">Logged in</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    auth.clear();
                                    navigate('/login');
                                }}
                                className="text-xs font-medium text-red-500 hover:text-red-600"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 text-sm font-medium text-center text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-colors"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 text-lg font-display font-semibold text-gray-900">AgriAlert</span>
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
            
            {/* Chatbot */}
            <Chatbot />
        </div>
    );
}
