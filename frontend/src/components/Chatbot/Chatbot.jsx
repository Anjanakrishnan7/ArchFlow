import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { IoCloseOutline, IoSend } from 'react-icons/io5';
import { RiRobot2Fill } from 'react-icons/ri';
import './Chatbot.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your ArchFlow Assistant. How can I help you today?", isBot: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => {
        try {
            return crypto.randomUUID();
        } catch (e) {
            return Math.random().toString(36).substring(2, 11);
        }
    });

    const location = useLocation();
    const allowedPaths = ['/', '/about', '/services', '/projects', '/contact'];

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
        setIsLoading(true);

        // Format history (exclude the message we are currently sending)
        const history = messages.map(msg => ({
            text: msg.text,
            isBot: msg.isBot
        }));

        try {
            const response = await axios.post(`${API_BASE_URL}/chat`, {
                message: userMessage,
                sessionId: sessionId,
                history: history
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    text: response.data.data.fulfillmentText,
                    isBot: true
                }]);
            } else {
                setMessages(prev => [...prev, {
                    text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                    isBot: true
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = error.response?.data?.message || "I'm having trouble reaching my brain. Is the server running?";
            setMessages(prev => [...prev, {
                text: errorMessage,
                isBot: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!allowedPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <div className="chatbot-container">
            {/* Floating Button */}
            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <IoCloseOutline size={30} /> : <RiRobot2Fill size={30} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>ArchFlow Assistant</h3>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <IoCloseOutline size={24} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chatbot-send"
                            disabled={!message.trim() || isLoading}
                        >
                            <IoSend size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
