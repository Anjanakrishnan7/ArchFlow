import React, { useState, useRef, useEffect } from 'react';
import {
    FaEllipsisV,
    FaPaintBrush,
    FaFileAlt,
    FaEye,
    FaChartBar,
    FaRegClock
} from 'react-icons/fa';
import '../staffTask.css';

const DropdownActions = ({ onAction, task }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleAction = (actionName) => {
        onAction(actionName, task);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const actions = [
        { name: 'Add Update', icon: <FaPaintBrush />, id: 'add_work_update' },
        { name: 'View Feedback', icon: <FaEye />, id: 'view_updates' },
        { name: 'Add Minutes', icon: <FaFileAlt />, id: 'add_minutes' },
        { name: 'Minutes History', icon: <FaRegClock />, id: 'view_minutes' },
    ];

    return (
        <div className="action-dropdown-container" ref={dropdownRef}>
            <button className="action-toggle-btn" onClick={toggleDropdown}>
                Actions <FaEllipsisV className="action-icon" />
            </button>

            {isOpen && (
                <div className="action-dropdown-menu">
                    {actions.map((action) => (
                        <div
                            key={action.id}
                            className="action-item"
                            onClick={() => handleAction(action.id)}
                        >
                            <span className="item-icon">{action.icon}</span>
                            <span className="item-label">{action.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownActions;
