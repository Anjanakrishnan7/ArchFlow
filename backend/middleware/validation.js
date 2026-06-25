/**
 * Centralized validation middleware for common checks.
 */

/**
 * Validates email format.
 * @param {string} email 
 * @returns {boolean}
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength.
 * Minimum 8 characters, at least one letter and one number.
 * @param {string} password 
 * @returns {boolean}
 */
exports.isStrongPassword = (password) => {
    if (!password || password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
};

/**
 * Checks if a value is a positive number.
 * @param {any} value 
 * @returns {boolean}
 */
exports.isPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
};

/**
 * Validates date ranges.
 * @param {string|Date} start 
 * @param {string|Date} end 
 * @returns {boolean}
 */
exports.isValidDateRange = (start, end) => {
    if (!start || !end) return true; // Optional fields
    return new Date(end) >= new Date(start);
};
