import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
    error?: string;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className }) => {
    if (!error) return null;

    return (
        <p className={cn("text-sm text-destructive mt-1", className)}>
            {error}
        </p>
    );
};

interface GeneralErrorProps {
    error?: string;
    className?: string;
}

export const GeneralError: React.FC<GeneralErrorProps> = ({ error, className }) => {
    if (!error) return null;

    return (
        <div className={cn("bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4", className)}>
            <ErrorMessage error={error} className="mt-0" />
        </div>
    );
};

export default ErrorMessage; 