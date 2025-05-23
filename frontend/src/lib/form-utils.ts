// Form validation and error handling utilities

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}

export interface FormErrors {
    [key: string]: string;
}

// Extract field errors from backend response
export const extractFieldErrors = (error: any): FormErrors => {
    const fieldErrors: FormErrors = {};

    if (error?.response?.data?.errors) {
        // Handle validation errors array (Zod/Express-validator format)
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
            errors.forEach((err: any) => {
                if (err.path || err.field) {
                    const field = err.path || err.field;
                    fieldErrors[field] = err.message || err.msg;
                }
            });
        }
    } else if (error?.response?.data?.message) {
        // Handle single error message
        fieldErrors.general = error.response.data.message;
    } else if (error?.message) {
        fieldErrors.general = error.message;
    } else {
        fieldErrors.general = 'An error occurred';
    }

    return fieldErrors;
};

// Validate a single field based on rules
export const validateField = (value: string, rules: ValidationRule): string | null => {
    if (rules.required && !value.trim()) {
        return 'This field is required';
    }

    if (value && rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
    }

    if (value && rules.custom) {
        return rules.custom(value);
    }

    return null;
};

// Validate form data against schema
export const validateForm = (data: Record<string, any>, schema: ValidationSchema): FormErrors => {
    const errors: FormErrors = {};

    Object.keys(schema).forEach(field => {
        const value = data[field] || '';
        const rules = schema[field];
        const error = validateField(value, rules);

        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};

// Common validation patterns
export const ValidationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/, // At least 6 chars with letter and number
    username: /^[a-zA-Z0-9_]{3,20}$/,
    phone: /^\+?[\d\s\-\(\)]{10,}$/,
};

// Common validation schemas
export const CommonValidationSchemas = {
    email: {
        required: true,
        pattern: ValidationPatterns.email,
    },
    password: {
        required: true,
        minLength: 6,
    },
    confirmPassword: (originalPassword: string) => ({
        required: true,
        custom: (value: string) => {
            if (value !== originalPassword) {
                return 'Passwords do not match';
            }
            return null;
        },
    }),
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: ValidationPatterns.username,
    },
};

// Error message component props
export interface ErrorMessageProps {
    error?: string;
    className?: string;
}

// Custom validation functions
export const customValidations = {
    confirmEmail: (email: string, confirmEmail: string) => {
        if (email !== confirmEmail) {
            return 'Email addresses do not match';
        }
        return null;
    },

    strongPassword: (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    },
}; 