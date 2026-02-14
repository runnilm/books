import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            // global default; override per-query as needed
            staleTime: 30_000,
            gcTime: 15 * 60_000,
        },
        mutations: {
            retry: 0,
        },
    },
});
