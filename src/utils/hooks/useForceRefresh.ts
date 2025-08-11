import { useEffect, useRef } from 'react';
import { useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from 'next/navigation';

export const useForceRefresh = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { playlistModified } = useAppSelector(state => state.track);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Force refresh when playlist is modified
    useEffect(() => {
        if (playlistModified) {
            // Clear any existing timeout
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            // Set new timeout for refresh
            refreshTimeoutRef.current = setTimeout(() => {
                router.refresh();
            }, 1000);
        }

        // Cleanup on unmount
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [playlistModified, router]);

    return null;
};
