import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors (client errors)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                return failureCount < 3;
            },
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
}); 