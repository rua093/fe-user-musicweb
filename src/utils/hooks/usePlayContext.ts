import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlayContext, setQueue, setCurrentTrackIndex } from "@/store/slices/trackSlice";
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";

export const usePlayContext = () => {
    const dispatch = useAppDispatch();
    const { data: session, status } = useSession();
    const { playContext, currentTrack } = useAppSelector(state => state.track);

    // Set play context and load queue
    const setContextAndLoadQueue = async (
        context: { type: 'playlist' | 'like' | 'category' | 'detail'; id?: string },
        track: IShareTrack
    ) => {
        dispatch(setPlayContext(context));

        // Wait for session to be loaded
        if (status === 'loading') {
            // If session is still loading, wait a bit and try again
            setTimeout(() => {
                setContextAndLoadQueue(context, track);
            }, 100);
            return;
        }

        // If not authenticated, still try to load tracks (for public access)
        if (!session?.access_token) {
            // For detail context, we can still load tracks without authentication
            if (context.type === 'detail' && track.category) {
                try {
                    const detailRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
                        method: "GET",
                        queryParams: {
                            current: 1,
                            pageSize: 100
                        },
                    });
                    if (detailRes?.data?.result) {
                        // Filter tracks by category on frontend
                        const tracks = detailRes.data.result.filter(t => t.category === track.category);
                        if (tracks.length > 0) {
                            dispatch(setQueue({ 
                                tracks, 
                                source: 'category', 
                                sourceId: track.category 
                            }));
                            
                            // Find current track index
                            const currentIndex = tracks.findIndex(t => {
                                const trackId = typeof track._id === 'string' ? track._id : String(track._id);
                                const tId = typeof t._id === 'string' ? t._id : String(t._id);
                                return tId === trackId;
                            });
                            if (currentIndex !== -1) {
                                dispatch(setCurrentTrackIndex(currentIndex));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error loading queue for context:', error);
                }
            }
            return;
        }

        try {
            let tracks: IShareTrack[] = [];
            let source: 'playlist' | 'like' | 'category' | 'search';

            switch (context.type) {
                case 'playlist':
                    if (context.id) {
                        // Use by-user endpoint to get playlist with tracks
                        const res = await sendRequest<IBackendRes<IModelPaginate<IPlaylist>>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/by-user`,
                            method: "POST",
                            queryParams: {
                                current: 1,
                                pageSize: 100
                            },
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        
                        if (res?.data?.result) {
                            // Find the specific playlist by ID
                            const playlist = res.data.result.find(p => p._id === context.id);
                            if (playlist?.tracks) {
                                tracks = playlist.tracks;
                                source = 'playlist';
                            }
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
                        nextOption: {
                            next: { 
                                tags: ['liked-by-user'],
                                revalidate: 0 // Disable cache để luôn fetch fresh data
                            }
                        }
                    });
                    if (likeRes?.data?.result) {
                        tracks = likeRes.data.result;
                        source = 'like';
                    }
                    break;

                case 'category':
                    if (track.category) {
                        const categoryRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
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
                        if (categoryRes?.data?.result) {
                            tracks = categoryRes.data.result;
                            source = 'category';
                        }
                    }
                    break;

                case 'detail':
                    if (track.category) {
                        const detailRes = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
                            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
                            method: "GET",
                            queryParams: {
                                current: 1,
                                pageSize: 100
                            },
                            headers: {
                                Authorization: `Bearer ${session?.access_token}`,
                            },
                        });
                        if (detailRes?.data?.result) {
                            // Filter tracks by category on frontend
                            tracks = detailRes.data.result.filter(t => t.category === track.category);
                            source = 'category';
                        }
                    }
                    break;
            }

            // Set queue if we have tracks
            if (tracks.length > 0) {
                dispatch(setQueue({ 
                    tracks, 
                    source, 
                    sourceId: context.id || track.category 
                }));
                
                // Find current track index - handle both string and number IDs
                const currentIndex = tracks.findIndex(t => {
                    const trackId = typeof track._id === 'string' ? track._id : String(track._id);
                    const tId = typeof t._id === 'string' ? t._id : String(t._id);
                    return tId === trackId;
                });
                if (currentIndex !== -1) {
                    dispatch(setCurrentTrackIndex(currentIndex));
                }
            }
        } catch (error) {
            console.error('Error loading queue for context:', error);
        }
    };

    return {
        playContext,
        setContextAndLoadQueue
    };
};
