import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { auth } from '../utils/auth';

// Point to standalone ai-spring service; override via VITE_AI_SERVICE_URL when needed
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8082';
const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'hi', label: 'Hindi' },
];

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your farming assistant. How can I help you today?'
        }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = {
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);
        setInput('');

        try {
            const reply = await sendToAiService(input, language);
            const botResponse = {
                role: 'assistant',
                content: reply
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            const botResponse = {
                role: 'assistant',
                content: error.message || 'Something went wrong while contacting the AI service.'
            };
            setMessages(prev => [...prev, botResponse]);
        } finally {
            setIsSending(false);
        }
    };

    const sendToAiService = async (userInput, selectedLanguage) => {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Please log in to chat.');
        }

        const response = await fetch(`${AI_SERVICE_URL}/ai/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                language: selectedLanguage,
                message: userInput
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text().catch(() => '');
            throw new Error(errorMessage || 'AI service error');
        }

        const data = await response.json();
        return data.reply || 'hi';
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MessageCircle size={20} />
                            <span className="font-semibold">Farming Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-primary-700 rounded-lg p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-200 bg-white">
                        <label className="text-xs text-gray-600">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={clsx(
                                    "flex",
                                    message.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "max-w-[80%] rounded-2xl px-4 py-2",
                                        message.role === 'user'
                                            ? "bg-primary-600 text-white"
                                            : "bg-white text-gray-900 border border-gray-200"
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
                            >
                                {isSending ? '...' : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

