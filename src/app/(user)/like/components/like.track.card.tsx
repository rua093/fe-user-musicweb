'use client'

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTrack, setPlaying } from "@/store/slices/trackSlice";
import { usePlayContext } from '@/utils/hooks/usePlayContext';
import { useLikeSync } from '@/utils/hooks/useLikeSync';
import { convertSlugUrl } from "@/utils/api";
import { Box, Typography, Card, CardContent, CardMedia, IconButton, Chip } from "@mui/material";
import Link from "next/link";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

interface IProps {
    track: ITrackTop;
    index: number;
}

const LikeTrackCard = (props: IProps) => {
    const { track, index } = props;
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, audioControl } = useAppSelector(state => state.track);
    const [isHovered, setIsHovered] = useState(false);

    // Use play context for like tracks
    const { setContextAndLoadQueue } = usePlayContext();
    
    // Use like sync hook for current track
    const { isLiked: hookIsLiked } = useLikeSync(track._id);
    
    // Use Redux countLike if this is current track, otherwise use track.countLike
    const displayCountLike = track._id === currentTrack._id 
        ? currentTrack.countLike 
        : track.countLike || 0;



    const getCosmicGradient = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple nebula
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue galaxy
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink star
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green comet
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Magenta planet
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint cosmic
        ];
        return gradients[index % gradients.length];
    };

    return (
        <Card 
            sx={{ 
                background: '#0a0a0a',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.03)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Album Art với Play Button Overlay */}
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${track.imgUrl}`}
                    alt={track.title}
                    sx={{
                        background: getCosmicGradient(index),
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        }
                    }}
                />
                
                {/* Play Button Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: isHovered ? 1 : 0,
                        transition: 'all 0.3s ease',
                        zIndex: 2
                    }}
                >
                    <IconButton
                        sx={{
                            background: 'rgba(255,255,255,0.95)',
                            color: '#000',
                            width: 56,
                            height: 56,
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                background: 'white',
                                transform: 'scale(1.1)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                            }
                        }}
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (track._id === currentTrack._id && isPlaying) {
                                // Pause current track without resetting currentTime
                                dispatch(setCurrentTrack({ ...currentTrack, isPlaying: false, isSeeking: false, autoPlay: false, _source: 'like' }));
                                dispatch(setPlaying(false));
                                // Sử dụng audioControl để pause audio
                                audioControl?.pause && audioControl.pause();
                            } else if (track._id === currentTrack._id && !isPlaying) {
                                // Resume current track without resetting currentTime
                                dispatch(setCurrentTrack({ ...currentTrack, isPlaying: true, isSeeking: false, autoPlay: false, _source: 'like' }));
                                dispatch(setPlaying(true));
                                // Sử dụng audioControl để phát audio
                                audioControl?.play && audioControl.play();
                            } else {
                                // Play new track - set context and load queue for like tracks
                                await setContextAndLoadQueue({
                                    type: 'like'
                                }, track);
                                
                                dispatch(setCurrentTrack({ ...track, isPlaying: true, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'like' }));
                                dispatch(setPlaying(true));
                                // Sử dụng audioControl để phát audio
                                audioControl?.play && audioControl.play();
                            }
                        }}
                    >
                        {(track._id === currentTrack._id && isPlaying) ? (
                            <PauseIcon sx={{ fontSize: 24 }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: 24 }} />
                        )}
                    </IconButton>
                </Box>

                {/* Like Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    <FavoriteIcon sx={{ color: '#ff6b6b', fontSize: 20 }} />
                </Box>


            </Box>

            {/* Track Info */}
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3,
                                mb: 0.5
                            }}
                        >
                            <Link
                                style={{ 
                                    textDecoration: "none", 
                                    color: "inherit" 
                                }}
                                href={`/track/${convertSlugUrl(track.title)}-${track._id}.html?audio=${track.trackUrl}`}
                            >
                                {track.title}
                            </Link>
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.85rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 400
                            }}
                        >
                            {track.description || 'Unknown Artist'}
                        </Typography>
                    </Box>
                    <IconButton 
                        size="small"
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            '&:hover': {
                                color: 'white',
                                background: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip
                        label={`${track.countPlay} lượt nghe`}
                        size="small"
                        sx={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.7rem',
                            height: 24,
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    />
                    <Chip
                        label={`${displayCountLike} lượt thích`}
                        size="small"
                        sx={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '0.7rem',
                            height: 24,
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default LikeTrackCard;
