import { useEffect, useRef } from 'react';
import { useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from 'next/navigation';

export const useLikeRefresh = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isLiked } = useAppSelector(state => state.track);
    const prevIsLikedRef = useRef<boolean | undefined>(undefined);

    // Auto refresh like page when like status changes
    useEffect(() => {
        if (pathname === '/like' && isLiked !== undefined && prevIsLikedRef.current !== isLiked) {
            // Only refresh if like status actually changed
            prevIsLikedRef.current = isLiked;
            
            // Small delay to ensure the like action is completed
            const timer = setTimeout(() => {
                router.refresh();
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [isLiked, pathname, router]);

    return null;
};
