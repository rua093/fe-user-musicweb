import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQueue, setCurrentTrackIndex } from "@/store/slices/trackSlice";
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";

export const useQueueContext = (track: IShareTrack | null, context: {
  type: 'playlist' | 'like' | 'category' | 'search' | 'detail';
  id?: string;
  category?: string;
}) => {
    const dispatch = useAppDispatch();
    const { data: session } = useSession();
    const { queue } = useAppSelector(state => state.track);

    // Load queue based on context
    const loadQueue = async () => {
        if (!track || !session?.access_token) return;

        try {
            let tracks: IShareTrack[] = [];
            let source: 'playlist' | 'like' | 'category' | 'search' = 'category';
            let sourceId: string | undefined;

            switch (context.type) {
                case 'playlist':
                    if (context.id) {
                        const res = await sendRequest<IBackendRes<IPlaylist>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/${context.id}`,
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        if (res?.data?.tracks) {
                            tracks = res.data.tracks;
                            source = 'playlist';
                            sourceId = context.id;
                        }
                    }
                    break;

                case 'like':
                    const likeRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
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
                    if (likeRes?.data?.result) {
                        tracks = likeRes.data.result;
                        source = 'like';
                    }
                    break;

                case 'category':
                    if (context.category) {
                        const categoryRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
                            method: "GET",
                            queryParams: {
                                current: 1,
                                pageSize: 100,
                                category: context.category,
                                sort: "-createdAt"
                            },
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        if (categoryRes?.data?.result) {
                            tracks = categoryRes.data.result;
                            source = 'category';
                            sourceId = context.category;
                        }
                    }
                    break;

                case 'search':
                    // For search, we'll use the current track's category as fallback
                    if (track.category) {
                        const searchRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
                            method: "GET",
                            queryParams: {
                                current: 1,
                                pageSize: 100,
                                category: track.category,
                                sort: "-createdAt"
                            },
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        if (searchRes?.data?.result) {
                            tracks = searchRes.data.result;
                            source = 'search';
                            sourceId = track.category;
                        }
                    }
                    break;

                case 'detail':
                    // For detail page, use same category tracks
                    if (track.category) {
                        const detailRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
                            method: "GET",
                            queryParams: {
                                current: 1,
                                pageSize: 100,
                                category: track.category,
                                sort: "-createdAt"
                            },
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        if (detailRes?.data?.result) {
                            tracks = detailRes.data.result;
                            source = 'category';
                            sourceId = track.category;
                        }
                    }
                    break;
            }

            // Set queue if we have tracks
            if (tracks.length > 0) {
                dispatch(setQueue({ tracks, source, sourceId }));
                
                // Find current track index
                const currentIndex = tracks.findIndex(t => t._id === track._id);
                if (currentIndex !== -1) {
                    dispatch(setCurrentTrackIndex(currentIndex));
                }
            }
        } catch (error) {
            console.error('Error loading queue:', error);
        }
    };

    // Load queue when track or context changes
    useEffect(() => {
        loadQueue();
    }, [track?._id, context.type, context.id, context.category, session?.access_token]);

    return {
        queue,
        loadQueue
    };
};
