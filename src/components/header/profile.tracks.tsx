'use client'

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTrack, setPlaying } from '@/store/slices/trackSlice';
import Link from 'next/link';
import { convertSlugUrl } from '@/utils/api';

interface IProps {
    data: ITrackTop
}

const ProfileTracks = (props: IProps) => {
    const { data } = props;
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, audioControl } = useAppSelector(state => state.track);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatNumber = (num: number | undefined) => {
        const value = num || 0;
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toString();
    };

    return (
        <Card 
            sx={{ 
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                }
            }}
        >
            {/* Image Section */}
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    sx={{ 
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
                    }}
                    image={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${data.imgUrl}`}
                    alt={data.title || 'Track cover'}
                />
                
                {/* Play Button Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '.MuiCard-root:hover &': {
                            opacity: 1
                        }
                    }}
                >
                    <IconButton
                        sx={{
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            width: 60,
                            height: 60,
                            '&:hover': {
                                background: 'rgba(0,0,0,0.8)',
                                transform: 'scale(1.1)'
                            }
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (data._id !== currentTrack._id || 
                                (data._id === currentTrack._id && !isPlaying)) {
                                dispatch(setCurrentTrack({ ...data, isPlaying: true, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'profile' }));
                                dispatch(setPlaying(true));
                                // Sử dụng audioControl để phát audio
                                audioControl?.play && audioControl.play();
                            } else {
                                dispatch(setCurrentTrack({ ...data, isPlaying: false, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'profile' }));
                                dispatch(setPlaying(false));
                                // Sử dụng audioControl để pause audio
                                audioControl?.pause && audioControl.pause();
                            }
                        }}
                    >
                        {(data._id === currentTrack._id && isPlaying === true) ? (
                            <PauseIcon sx={{ fontSize: 28 }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: 28 }} />
                        )}
                    </IconButton>
                </Box>

                {/* Duration Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500
                    }}
                >
                    {formatDuration(data.duration || 0)}
                </Box>
            </Box>

            {/* Content Section */}
            <CardContent sx={{ p: 3 }}>
                <Link
                    style={{
                        textDecoration: "none",
                        color: "unset"
                    }}
                    href={`/track/${convertSlugUrl(data.title)}-${data._id}.html?audio=${data.trackUrl}`}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            mb: 1,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {data.title || 'Untitled Track'}
                    </Typography>
                </Link>

                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {data.description || 'No description available'}
                </Typography>

                {/* Stats Row */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 'auto'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlaylistPlayIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {formatNumber(data.countPlay)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {formatNumber(data.countLike)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Category Badge */}
                    <Box
                        sx={{
                            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}
                    >
                        {data.category || 'Unknown'}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ProfileTracks;