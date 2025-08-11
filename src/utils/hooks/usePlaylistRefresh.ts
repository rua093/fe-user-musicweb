import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter, usePathname } from 'next/navigation';
import { setPlaylistModified } from "@/store/slices/trackSlice";

export const usePlaylistRefresh = () => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { playlistModified } = useAppSelector(state => state.track);
    const prevPlaylistModifiedRef = useRef<boolean>(false);

    // Auto refresh playlist page when playlist is modified
    useEffect(() => {
        // Check if we're on a playlist page (pathname contains playlist or is playlist page)
        const isPlaylistPage = pathname.includes('/playlist/') || pathname === '/playlist';
        
        if (isPlaylistPage && playlistModified && !prevPlaylistModifiedRef.current) {
            // Only refresh if playlist was actually modified
            prevPlaylistModifiedRef.current = playlistModified;
            
            // Small delay to ensure the playlist action is completed
            const timer = setTimeout(() => {
                router.refresh();
                // Reset the flag after refresh
                dispatch(setPlaylistModified(false));
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [playlistModified, pathname, router, dispatch]);

    return null;
};
