import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    fallbackSrc?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export default function OptimizedImage({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    fallbackSrc,
    onLoad,
    onError
}: OptimizedImageProps) {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setImageSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        if (fallbackSrc && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
            setHasError(false);
        }
        onError?.();
    };

    return (
        <div className={`relative inline-block ${className}`}>
            {isLoading && (
                <div
                    className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                    style={{ width, height }}
                />
            )}
            <img
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
                width={width}
                height={height}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    maxWidth: '100%',
                    height: 'auto'
                }}
            />
            {hasError && !fallbackSrc && (
                <div
                    className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm"
                    style={{ width, height }}
                >
                    Failed to load image
                </div>
            )}
        </div>
    );
} 