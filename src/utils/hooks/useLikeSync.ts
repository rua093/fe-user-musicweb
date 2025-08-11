import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLiked, updateCountLike } from "@/store/slices/trackSlice";
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";

export const useLikeSync = (trackId?: string) => {
    const dispatch = useAppDispatch();
    const { data: session } = useSession();
    const { currentTrack, isLiked } = useAppSelector(state => state.track);

    // Check if current track is liked
    const checkTrackLikeStatus = async () => {
        if (!session?.access_token || !trackId) return;
        
        try {
            const res = await sendRequest<IBackendRes<IModelPaginate<ITrackLike>>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes`,
                method: "GET",
                queryParams: {
                    current: 1,
                    pageSize: 100,
                    sort: "-createdAt"
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            
            if (res?.data?.result) {
                const isTrackLiked = res.data.result.some(track => track._id === trackId);
                dispatch(setLiked(isTrackLiked));
            }
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    // Toggle like status
    const toggleLike = async () => {
        if (!session?.access_token || !trackId) return;

        try {
            const quantity = isLiked ? -1 : 1;
            const res = await sendRequest<IBackendRes<ITrackLike>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes`,
                method: "POST",
                body: { 
                    track: trackId,
                    quantity: quantity
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (res?.data) {
                dispatch(setLiked(!isLiked));
                
                // Update countLike based on current state
                const currentCount = currentTrack.countLike;
                const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
                dispatch(updateCountLike(newCount));
                
                // Revalidate cache for like page
                try {
                    await sendRequest<IBackendRes<any>>({
                        url: `/api/revalidate`,
                        method: "POST",
                        queryParams: {
                            tag: "liked-by-user",
                            secret: "justArandomString"
                        }
                    });
                } catch (error) {
                    console.error('Error revalidating like cache:', error);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            return false;
        }
    };

    // Check like status when track changes
    useEffect(() => {
        if (trackId === currentTrack._id) {
            checkTrackLikeStatus();
        }
    }, [trackId, currentTrack._id, session?.access_token]);

    return {
        isLiked: trackId === currentTrack._id ? isLiked : false,
        toggleLike,
        checkTrackLikeStatus
    };
};
