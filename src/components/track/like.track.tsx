'use client'
import Chip from '@mui/material/Chip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useState } from 'react';
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleLikeTrackAction } from '@/utils/actions/actions';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLiked, updateCountLike } from "@/store/slices/trackSlice";
import { useLikeSync } from '@/utils/hooks/useLikeSync';

interface IProps {
    track: ITrackTop | null;
}
const LikeTrack = (props: IProps) => {
    const { track } = props;
    const { data: session } = useSession();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLiked: reduxIsLiked, currentTrack } = useAppSelector(state => state.track);
    const { isLiked: hookIsLiked, toggleLike: hookToggleLike } = useLikeSync(track?._id);

    // Use Redux countLike if this is current track, otherwise use track.countLike
    const displayCountLike = track?._id === currentTrack._id 
        ? currentTrack.countLike 
        : track?.countLike || 0;

    const [trackLikes, setTrackLikes] = useState<ITrackLike[] | null>(null);

    const fetchData = async () => {
        if (session?.access_token) {
            const res2 = await sendRequest<IBackendRes<IModelPaginate<ITrackLike>>>({
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
            })
            if (res2?.data?.result)
                setTrackLikes(res2?.data?.result)
        }
    }
    useEffect(() => {
        fetchData();
    }, [session])



    const handleLikeTrack = async () => {
        // If this is the current track, use hook
        if (track?._id === currentTrack._id) {
            await hookToggleLike();
        } else {
            // For other tracks, use original logic
            const id = track?._id;
            const quantity = trackLikes?.some(t => t._id === track?._id) ? -1 : 1;
            await handleLikeTrackAction(id, quantity)
            fetchData();
            
            // Update countLike if this is the current track
            if (track?._id === currentTrack._id) {
                const currentCount = currentTrack.countLike;
                const newCount = trackLikes?.some(t => t._id === track?._id) 
                    ? Math.max(0, currentCount - 1) 
                    : currentCount + 1;
                dispatch(updateCountLike(newCount));
            }
        }
        
        // Revalidate cache để cập nhật trang like
        await sendRequest<IBackendRes<any>>({
            url: `/api/revalidate`,
            method: "POST",
            queryParams: {
                tag: "liked-by-user",
                secret: "justArandomString"
            }
        });
        
        router.refresh();
    }

    // Use hook state if track is current track, otherwise use local state
    const isLiked = track?._id === currentTrack._id 
        ? hookIsLiked 
        : trackLikes?.some(t => t._id === track?._id);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* Like Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleLikeTrack}
                    sx={{
                        background: isLiked 
                            ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
                            : 'rgba(255, 255, 255, 0.1)',
                        color: isLiked ? 'white' : '#F87171',
                        border: isLiked 
                            ? 'none' 
                            : '2px solid rgba(239, 68, 68, 0.3)',
                        '&:hover': {
                            background: isLiked 
                                ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' 
                                : 'rgba(239, 68, 68, 0.2)',
                            transform: 'scale(1.05)',
                            boxShadow: isLiked 
                                ? '0 10px 15px -3px rgba(239, 68, 68, 0.4)' 
                                : '0 5px 15px -3px rgba(239, 68, 68, 0.3)'
                        },
                        transition: 'all 0.3s ease',
                        width: 56,
                        height: 56
                    }}
                >
                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                
                <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                        {isLiked ? 'Liked' : 'Like this track'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {displayCountLike} likes
                    </Typography>
                </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Paper sx={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 2,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <PlayArrowIcon sx={{ color: '#60A5FA', fontSize: 20 }} />
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                            Plays
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#60A5FA', fontWeight: 600 }}>
                            {track?.countPlay || 0}
                        </Typography>
                    </Box>
                </Paper>

                <Paper sx={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 2,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <FavoriteIcon sx={{ color: '#F87171', fontSize: 20 }} />
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                            Likes
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#F87171', fontWeight: 600 }}>
                            {displayCountLike}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    )
}

export default LikeTrack;