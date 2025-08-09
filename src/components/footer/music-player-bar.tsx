'use client'
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  setCurrentTrack, 
  setPlaying, 
  setCurrentTime, 
  setDuration, 
  setSeeking, 
  setSource,
  playTrack,
  pauseTrack,
  seekTrack
} from "@/store/slices/trackSlice";
import { useHasMounted } from '@/utils/customHook';
import { Container, Box, Typography, Avatar, IconButton, Tooltip, Stack, Slider, Chip, Divider } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import 'react-h5-audio-player/lib/styles.css';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const MusicPlayerBar = () => {
    const hasMounted = useHasMounted();
    const playerRef = useRef<any>(null);
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, currentTime, duration, isSeeking, autoPlay, source, waveControl } = useAppSelector(state => state.track);
    const [volume, setVolume] = useState(50);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
    const [isShuffled, setIsShuffled] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Khi user thao tác play/pause trên player bar
    const handlePlay = () => {
        if (!isPlaying) {
            // Cập nhật store trước
            dispatch(setPlaying(true));
            dispatch(setSource('bar'));
            // Sau đó gọi wavesurfer
            waveControl?.play && waveControl.play();
        }
    };

    const handlePause = () => {
        if (isPlaying) {
            // Cập nhật store trước
            dispatch(setPlaying(false));
            dispatch(setSource('bar'));
            // Sau đó gọi wavesurfer
            waveControl?.pause && waveControl.pause();
        }
    };

    // Handler cho seek từ player bar
    const handleSeek = (time: number) => {
        if (Math.abs((currentTime ?? 0) - time) > 0.1) {
            // Clear any existing seek timeout
            if (seekTimeoutRef.current) {
                clearTimeout(seekTimeoutRef.current);
            }
            
            // Set isSeeking = true trước khi seek
            dispatch(setSeeking(true));
            dispatch(setSource('bar'));
            // Cập nhật currentTime ngay lập tức để UI phản hồi
            dispatch(setCurrentTime(time));
            
            // Debounce the actual seek operation
            seekTimeoutRef.current = setTimeout(() => {
            // Gọi wavesurfer seek
            waveControl?.seek && waveControl.seek(time);
            }, 50);
        }
    };

    // Handler cho chuyển bài
    const handlePrevious = () => {
        // TODO: Implement previous track logic
        console.log('Previous track');
    };

    const handleNext = () => {
        // TODO: Implement next track logic
        console.log('Next track');
    };

    // Handler cho âm lượng
    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        const newVolume = newValue as number;
        setVolume(newVolume);
        if (playerRef.current?.audio?.current) {
            playerRef.current.audio.current.volume = newVolume / 100;
        }
    };

    // Handler cho repeat mode
    const handleRepeatToggle = () => {
        setRepeatMode(prev => {
            if (prev === 'none') return 'all';
            if (prev === 'all') return 'one';
            return 'none';
        });
    };

    // Handler cho shuffle
    const handleShuffleToggle = () => {
        setIsShuffled(prev => !prev);
    };

    // Handler cho like
    const handleLikeToggle = () => {
        setIsLiked(prev => !prev);
    };

    const getVolumeIcon = () => {
        if (volume === 0) return <VolumeMuteIcon />;
        if (volume < 50) return <VolumeDownIcon />;
        return <VolumeUpIcon />;
    };

    const getRepeatIcon = () => {
        if (repeatMode === 'one') return <RepeatOneIcon />;
        return <RepeatIcon />;
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Đồng bộ với store khi currentTrack thay đổi
    useEffect(() => {
        if (!playerRef.current?.audio?.current) return;
        const audio = playerRef.current.audio.current;
        
        // Sync currentTime (chỉ khi không đang seeking từ player bar)
        if (typeof currentTime === 'number' && source !== 'bar' && Math.abs(audio.currentTime - currentTime) > 0.1) {
            audio.currentTime = currentTime;
        }
        
        // Sync isPlaying
        if (source !== 'bar') {
            if (isPlaying === false && !audio.paused) {
                audio.pause();
            }
            if (isPlaying === true && audio.paused) {
                audio.play();
            }
        }
    }, [currentTrack, currentTime, isPlaying, source]);

    // Reset isSeeking flag khi seek xong
    useEffect(() => {
        if (isSeeking) {
            const timer = setTimeout(() => {
                // Chỉ reset nếu vẫn đang seeking và không có thay đổi mới
                dispatch(setSeeking(false));
            }, 300); // Tăng thời gian để đảm bảo seek hoàn thành
            return () => clearTimeout(timer);
        }
    }, [isSeeking, dispatch]);

    // Cleanup seek timeout on unmount
    useEffect(() => {
        return () => {
            if (seekTimeoutRef.current) {
                clearTimeout(seekTimeoutRef.current);
            }
        };
    }, []);

    // Nếu đổi bài hát (track._id khác), cập nhật context để đồng bộ info
    useEffect(() => {
        if (!playerRef.current?.audio?.current) return;
        if (currentTrack._id && currentTrack._id !== playerRef.current?.audio?.current.dataset.trackId) {
            // Cập nhật info cho player bar nếu cần
            playerRef.current.audio.current.dataset.trackId = currentTrack._id;
        }
    }, [currentTrack._id]);

    if (!hasMounted) return (<></>)

    return (
        <>
            {currentTrack._id &&
                <AppBar position="fixed"
                    sx={{
                        top: 'auto', bottom: 0,
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
                        color: '#fff',
                        boxShadow: '0 -8px 32px rgba(138, 43, 226, 0.3), 0 -4px 16px rgba(255, 255, 255, 0.1)',
                        zIndex: 1300,
                        py: 0,
                        minHeight: 100,
                        height: 100,
                        borderTop: '1px solid rgba(138, 43, 226, 0.3)',
                        backdropFilter: 'blur(20px)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
                            pointerEvents: 'none',
                        }
                    }}
                >
                    <Container maxWidth="xl" disableGutters
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            minHeight: 100,
                            height: 100,
                            px: { xs: 2, sm: 3, md: 4 },
                            position: 'relative',
                        }}>
                        
                        {/* LEFT SECTION - Track Info & Album Art */}
                        <Box sx={{ 
                            minWidth: { xs: 200, sm: 280, md: 320 }, 
                            maxWidth: { xs: 200, sm: 280, md: 320 }, 
                            flexShrink: 0 
                        }}>
                            <Stack direction="row" alignItems="center" spacing={3}>
                                {/* Album Art with Glow Effect */}
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    variant="rounded"
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${currentTrack.imgUrl}`}
                                    alt={currentTrack.title}
                                    sx={{ 
                                            width: 70, 
                                            height: 70, 
                                        bgcolor: 'rgba(138, 43, 226, 0.2)',
                                        border: '2px solid rgba(138, 43, 226, 0.5)',
                                        boxShadow: '0 4px 20px rgba(138, 43, 226, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 8px 30px rgba(138, 43, 226, 0.5)',
                                        }
                                    }}
                                />
                                    {/* Glow Effect */}
                                <Box sx={{
                                    position: 'absolute',
                                        top: -8,
                                        left: -8,
                                        right: -8,
                                        bottom: -8,
                                        borderRadius: '16px',
                                    background: 'linear-gradient(45deg, #8a2be2, #ff6b6b, #4ecdc4, #45b7d1)',
                                    backgroundSize: '400% 400%',
                                    animation: 'milkyway-glow 3s ease-in-out infinite',
                                    opacity: 0.3,
                                    zIndex: -1,
                                }} />
                            </Box>

                                {/* Track Details */}
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography 
                                        variant="subtitle1" 
                                    sx={{ 
                                            fontSize: { xs: 13, sm: 14, md: 15 },
                                            fontWeight: 700,
                                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
                                            mb: 0.5,
                                            lineHeight: 1.2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                    }}
                                >
                                    {currentTrack.title}
                                </Typography>
                                    
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            fontSize: { xs: 11, sm: 12 },
                                            display: 'block',
                                            mb: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {currentTrack.uploader?.email}
                                    </Typography>

                                    {/* Track Tags */}
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        {currentTrack.genre && (
                                            <Chip 
                                                label={currentTrack.genre} 
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: 10,
                                                    background: 'rgba(138, 43, 226, 0.2)',
                                                    color: '#8a2be2',
                                                    border: '1px solid rgba(138, 43, 226, 0.3)',
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        )}
                                        {currentTrack.language && (
                                            <Chip 
                                                label={currentTrack.language} 
                                                size="small"
                                            sx={{
                                                    height: 20,
                                                    fontSize: 10,
                                                    background: 'rgba(255, 107, 107, 0.2)',
                                                    color: '#ff6b6b',
                                                    border: '1px solid rgba(255, 107, 107, 0.3)',
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        {/* CENTER SECTION - Main Controls & Progress */}
                        <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            px: { xs: 1, sm: 2, md: 3 },
                            height: '100%'
                        }}>
                            {/* Main Playback Controls */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: { xs: 1, sm: 2 },
                                mb: 1
                            }}>
                                {/* Shuffle Button */}
                                <Tooltip title="Shuffle">
                                        <IconButton
                                        onClick={handleShuffleToggle}
                                            sx={{
                                            color: isShuffled ? '#4ecdc4' : 'rgba(255, 255, 255, 0.7)',
                                                '&:hover': {
                                                color: '#4ecdc4',
                                                transform: 'scale(1.1)',
                                                background: 'rgba(78, 205, 196, 0.1)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <ShuffleIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                        
                                {/* Previous Button */}
                                <IconButton 
                                    onClick={handlePrevious}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            color: '#4ecdc4',
                                            transform: 'scale(1.1)',
                                            background: 'rgba(78, 205, 196, 0.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <SkipPreviousIcon />
                                </IconButton>

                                {/* Play/Pause Button */}
                                <IconButton 
                                    onClick={isPlaying ? handlePause : handlePlay}
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        background: 'linear-gradient(135deg, #8a2be2 0%, #ff6b6b 100%)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #ff6b6b 0%, #8a2be2 100%)',
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 10px 25px rgba(138, 43, 226, 0.4)'
                                        },
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 5px 15px rgba(138, 43, 226, 0.3)',
                                        mx: 1
                                    }}
                                >
                                    {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
                                </IconButton>

                                {/* Next Button */}
                                <IconButton
                                    onClick={handleNext}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            color: '#4ecdc4',
                                            transform: 'scale(1.1)',
                                            background: 'rgba(78, 205, 196, 0.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <SkipNextIcon />
                                </IconButton>
                            
                                {/* Repeat Button */}
                                <Tooltip title={`Repeat ${repeatMode === 'one' ? 'One' : repeatMode === 'all' ? 'All' : 'Off'}`}>
                                    <IconButton 
                                        onClick={handleRepeatToggle}
                                        sx={{
                                            color: repeatMode !== 'none' ? '#4ecdc4' : 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                color: '#4ecdc4',
                                                transform: 'scale(1.1)',
                                                background: 'rgba(78, 205, 196, 0.1)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {getRepeatIcon()}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ width: '100%', maxWidth: 700, mb: 1 }}>
                                <Slider
                                    value={currentTime || 0}
                                    max={duration || 0}
                                    onChange={(_, value) => handleSeek(value as number)}
                                    sx={{
                                        color: '#8a2be2',
                                        height: 10,
                                        '& .MuiSlider-thumb': {
                                            width: 20,
                                            height: 20,
                                            background: 'linear-gradient(45deg, #8a2be2, #ff6b6b)',
                                            border: '2px solid #fff',
                                            boxShadow: '0 0 15px rgba(138, 43, 226, 0.6)',
                                            '&:hover': {
                                                transform: 'scale(1.3)',
                                                boxShadow: '0 0 25px rgba(138, 43, 226, 0.8)'
                                            }
                                        },
                                        '& .MuiSlider-track': {
                                            background: 'linear-gradient(90deg, #8a2be2, #ff6b6b, #4ecdc4)',
                                            backgroundSize: '200% 100%',
                                            animation: 'milkyway-progress 3s ease-in-out infinite',
                                            height: 6,
                                            borderRadius: 3
                                        },
                                        '& .MuiSlider-rail': {
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            height: 6,
                                            borderRadius: 3
                                        }
                                    }}
                                />
                            </Box>

                            {/* Time Display */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 3,
                                color: 'rgba(255, 255, 255, 0.8)',
                                mt: 0.5
                            }}>
                                <Typography variant="caption" sx={{ 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    minWidth: 40,
                                    fontSize: 12,
                                    fontWeight: 600
                                }}>
                                    {formatTime(currentTime || 0)}
                                </Typography>
                                
                                <Typography variant="caption" sx={{ 
                                    color: 'rgba(255, 255, 255, 0.6)', 
                                    fontSize: 11
                                }}>
                                    /
                                </Typography>
                                
                                <Typography variant="caption" sx={{ 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    minWidth: 40,
                                    fontSize: 12,
                                    fontWeight: 600
                                }}>
                                    {formatTime(duration || 0)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* RIGHT SECTION - Volume, Actions & Queue */}
                        <Box sx={{ 
                            minWidth: { xs: 180, sm: 220, md: 250 }, 
                            maxWidth: { xs: 180, sm: 220, md: 250 }, 
                            flexShrink: 0 
                        }}>
                            <Stack direction="row" alignItems="center" spacing={2} justifyContent="flex-end">
                                {/* Volume Control */}
                                <Box sx={{ position: 'relative' }}>
                                    <Tooltip title={`Volume: ${volume}%`}>
                                        <IconButton
                                            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': {
                                                    color: '#8a2be2',
                                                    transform: 'scale(1.1)',
                                                    background: 'rgba(138, 43, 226, 0.1)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {getVolumeIcon()}
                                        </IconButton>
                                    </Tooltip>
                                    
                                {showVolumeSlider && (
                                    <Box sx={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            mb: 2,
                                            p: 2,
                                            background: 'rgba(0, 0, 0, 0.95)',
                                            borderRadius: 2,
                                            backdropFilter: 'blur(15px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                                    }}>
                                        <Slider
                                            orientation="vertical"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            sx={{
                                                    height: 120,
                                                    color: '#8a2be2',
                                                '& .MuiSlider-thumb': {
                                                    background: 'linear-gradient(45deg, #8a2be2, #ff6b6b)',
                                                    border: '2px solid #fff',
                                                        width: 18,
                                                        height: 18
                                                    },
                                                    '& .MuiSlider-track': {
                                                        background: 'linear-gradient(180deg, #8a2be2, #ff6b6b)',
                                                        width: 6
                                                    },
                                                    '& .MuiSlider-rail': {
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        width: 6
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>

                                {/* Like Button */}
                                <Tooltip title={isLiked ? "Remove from favorites" : "Add to favorites"}>
                                    <IconButton
                                        onClick={handleLikeToggle}
                                        sx={{
                                            color: isLiked ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                color: '#ff6b6b',
                                                transform: 'scale(1.1)',
                                                background: 'rgba(255, 107, 107, 0.1)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Tooltip>

                                {/* Add to Playlist */}
                                <Tooltip title="Add to playlist">
                                    <IconButton
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                color: '#4ecdc4',
                                                transform: 'scale(1.1)',
                                                background: 'rgba(78, 205, 196, 0.1)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <PlaylistAddIcon />
                                    </IconButton>
                                </Tooltip>

                                {/* Queue Button */}
                                <Tooltip title="Show queue">
                                    <IconButton
                                        onClick={() => setShowQueue(!showQueue)}
                                        sx={{
                                            color: showQueue ? '#4ecdc4' : 'rgba(255, 255, 255, 0.7)',
                                            '&:hover': {
                                                color: '#4ecdc4',
                                                transform: 'scale(1.1)',
                                                background: 'rgba(78, 205, 196, 0.1)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <QueueMusicIcon />
                                    </IconButton>
                                </Tooltip>
                        </Stack>

                            {/* Volume Bar (Horizontal) */}
                            <Box sx={{ mt: 2, px: 1 }}>
                                <Slider
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    size="small"
                                    sx={{
                                        color: '#8a2be2',
                                        height: 4,
                                        '& .MuiSlider-thumb': {
                                            width: 12,
                                            height: 12,
                                            background: 'linear-gradient(45deg, #8a2be2, #ff6b6b)',
                                            border: '2px solid #fff',
                                            boxShadow: '0 0 8px rgba(138, 43, 226, 0.4)'
                                        },
                                        '& .MuiSlider-track': {
                                            background: 'linear-gradient(90deg, #8a2be2, #ff6b6b)',
                                            height: 4,
                                            borderRadius: 2
                                        },
                                        '& .MuiSlider-rail': {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            height: 4,
                                            borderRadius: 2
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Container>
                    
                    {/* Custom CSS cho Milkyway theme */}
                    <style jsx>{`
                        @keyframes milkyway-glow {
                            0%, 100% { 
                                background-position: 0% 50%; 
                                opacity: 0.3;
                            }
                            50% { 
                                background-position: 100% 50%; 
                                opacity: 0.6;
                            }
                        }
                        
                        @keyframes twinkle {
                            0%, 100% { opacity: 0.3; transform: scale(1); }
                            50% { opacity: 1; transform: scale(1.1); }
                        }
                        
                        .milkyway-player .rhap_container {
                            background: transparent !important;
                            color: #fff !important;
                            min-height: 100px !important;
                            height: 100px !important;
                            padding: 20px 0 !important;
                        }
                        
                        .milkyway-player .rhap_time, 
                        .milkyway-player .rhap_current-time, 
                        .milkyway-player .rhap_total-time {
                            color: #fff !important;
                            font-size: 14px !important;
                            font-weight: 600 !important;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
                        }
                        
                        .milkyway-player .rhap_progress-bar-show-download, 
                        .milkyway-player .rhap_progress-bar {
                            background: rgba(255, 255, 255, 0.1) !important;
                            height: 8px !important;
                            border-radius: 10px !important;
                            backdrop-filter: blur(10px) !important;
                            border: 1px solid rgba(255, 255, 255, 0.1) !important;
                        }
                        
                        .milkyway-player .rhap_progress-filled {
                            background: linear-gradient(90deg, #8a2be2, #ff6b6b, #4ecdc4) !important;
                            background-size: 200% 100% !important;
                            animation: milkyway-progress 3s ease-in-out infinite !important;
                            border-radius: 10px !important;
                            box-shadow: 0 0 20px rgba(138, 43, 226, 0.5) !important;
                        }
                        
                        @keyframes milkyway-progress {
                            0%, 100% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                        }
                        
                        .milkyway-player .rhap_main-controls button {
                            color: #fff !important;
                            font-size: 2rem !important;
                            background: rgba(255, 255, 255, 0.1) !important;
                            backdrop-filter: blur(10px) !important;
                            border: 1px solid rgba(255, 255, 255, 0.2) !important;
                            border-radius: 50% !important;
                            margin: 0 8px !important;
                            transition: all 0.3s ease !important;
                            min-width: 50px !important;
                            min-height: 50px !important;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
                        }
                        
                        .milkyway-player .rhap_main-controls button:hover {
                            background: rgba(138, 43, 226, 0.3) !important;
                            border: 1px solid rgba(138, 43, 226, 0.6) !important;
                            transform: translateY(-2px) scale(1.05) !important;
                            box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4) !important;
                        }
                        
                        .milkyway-player .rhap_volume-bar {
                            background: rgba(255, 255, 255, 0.1) !important;
                            border-radius: 10px !important;
                        }
                        
                        .milkyway-player .rhap_volume-indicator {
                            background: linear-gradient(45deg, #8a2be2, #ff6b6b) !important;
                            border-radius: 50% !important;
                            box-shadow: 0 0 10px rgba(138, 43, 226, 0.5) !important;
                        }
                        
                        .milkyway-player .rhap_download-progress {
                            background: rgba(255, 255, 255, 0.05) !important;
                            border-radius: 10px !important;
                        }
                        
                        .milkyway-player .rhap_progress-indicator {
                            background: #fff !important;
                            border-radius: 50% !important;
                            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
                            transition: all 0.3s ease !important;
                        }
                        
                        .milkyway-player .rhap_progress-indicator:hover {
                            transform: scale(1.2) !important;
                            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
                        }
                    `}</style>
                </AppBar>
            }
        </>
    )
}

export default MusicPlayerBar;
