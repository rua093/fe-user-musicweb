'use client'
import { useTrackContext } from '@/lib/track.wrapper';
import { useHasMounted } from '@/utils/customHook';
import { Container, Box, Typography, Avatar, IconButton, Tooltip, Stack, Slider } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import 'react-h5-audio-player/lib/styles.css';

const AppFooter = () => {
    const hasMounted = useHasMounted();
    const playerRef = useRef<any>(null);
    const { currentTrack, setCurrentTrack, waveControl } = useTrackContext() as ITrackContext;
    const [internalSeek, setInternalSeek] = useState(false);
    const [volume, setVolume] = useState(50);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    // Khi user thao tác play/pause/seek trên player bar, chỉ gửi lệnh tới waveControl, không gọi setCurrentTrack
    const handlePlay = () => {
        if (!currentTrack.isPlaying) {
            waveControl?.play && waveControl.play();
        }
    };
    const handlePause = () => {
        if (currentTrack.isPlaying) {
            waveControl?.pause && waveControl.pause();
        }
    };
    const handleSeek = (time: number) => {
        if (Math.abs((currentTrack.currentTime ?? 0) - time) > 0.1) {
            waveControl?.seek && waveControl.seek(time);
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

    const getVolumeIcon = () => {
        if (volume === 0) return <VolumeMuteIcon />;
        if (volume < 50) return <VolumeDownIcon />;
        return <VolumeUpIcon />;
    };

    // Khi nhận currentTime mới từ context, chỉ update UI nếu khác biệt, không update context lại
    useEffect(() => {
        if (!playerRef.current?.audio?.current) return;
        const audio = playerRef.current.audio.current;
        if (typeof currentTrack.currentTime === 'number' && Math.abs(audio.currentTime - currentTrack.currentTime) > 0.1) {
            audio.currentTime = currentTrack.currentTime;
        }
        if (currentTrack._source !== 'bar') {
            if (currentTrack?.isPlaying === false) {
                audio.pause();
            }
            if (currentTrack?.isPlaying === true) {
                audio.play();
            }
        }
    }, [currentTrack.currentTime, currentTrack.isPlaying, currentTrack._source]);

    // Reset cờ sau khi seek xong
    useEffect(() => {
        if (internalSeek) {
            const t = setTimeout(() => setInternalSeek(false), 200);
            return () => clearTimeout(t);
        }
    }, [internalSeek]);

    // Helper để so sánh track
    const isTrackStateChanged = (next: IShareTrack, prev: IShareTrack) => {
        return (
            next._id !== prev._id ||
            next.isPlaying !== prev.isPlaying ||
            Math.abs((next.currentTime ?? 0) - (prev.currentTime ?? 0)) > 0.1
        );
    };

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
                    <Container maxWidth="lg" disableGutters
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            minHeight: 100,
                            height: 100,
                            px: { xs: 2, sm: 3 },
                            position: 'relative',
                        }}>
                        {/* Info bên trái */}
                        <Stack direction="row" alignItems="center" spacing={3} sx={{ minWidth: 220, maxWidth: 320, flexShrink: 0 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    variant="rounded"
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${currentTrack.imgUrl}`}
                                    alt={currentTrack.title}
                                    sx={{ 
                                        width: 60, 
                                        height: 60, 
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
                                {/* Hiệu ứng ánh sáng xung quanh avatar */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: -5,
                                    left: -5,
                                    right: -5,
                                    bottom: -5,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #8a2be2, #ff6b6b, #4ecdc4, #45b7d1)',
                                    backgroundSize: '400% 400%',
                                    animation: 'milkyway-glow 3s ease-in-out infinite',
                                    opacity: 0.3,
                                    zIndex: -1,
                                }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontSize: 14,
                                        fontWeight: 600,
                                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 10px rgba(255, 107, 107, 0.3)',
                                        mb: 0.5
                                    }}
                                    noWrap
                                >
                                    {currentTrack.uploader?.name || currentTrack.uploader?.email || 'Unknown Artist'}
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    fontWeight={700} 
                                    noWrap 
                                    sx={{ 
                                        fontSize: 16,
                                        color: '#fff',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {currentTrack.title}
                                </Typography>
                            </Box>
                        </Stack>
                        
                        {/* Player giữa với controls */}
                        <Box sx={{ flex: 1, minWidth: 0, px: { xs: 1, sm: 3 } }}>
                            <AudioPlayer
                                ref={playerRef}
                                layout="horizontal"
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks/${currentTrack.trackUrl}`}
                                volume={volume / 100}
                                style={{
                                    boxShadow: 'unset',
                                    background: 'transparent',
                                    color: '#fff',
                                    width: '100%',
                                    minHeight: 100,
                                    height: 100,
                                }}
                                className="milkyway-player"
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onSeeked={e => {
                                    const audio = playerRef.current?.audio?.current;
                                    if (audio) {
                                        handleSeek(audio.currentTime);
                                    }
                                }}
                                onListen={() => {/* không update context ở đây */}}
                                showJumpControls={false}
                                showDownloadProgress={false}
                                customAdditionalControls={[
                                    <Tooltip key="prev" title="Bài trước" arrow>
                                        <IconButton
                                            onClick={handlePrevious}
                                            sx={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                transition: 'all 0.3s ease',
                                                margin: '0 4px',
                                                '&:hover': {
                                                    background: 'rgba(138, 43, 226, 0.3)',
                                                    border: '1px solid rgba(138, 43, 226, 0.6)',
                                                    transform: 'translateY(-2px) scale(1.05)',
                                                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
                                                }
                                            }}
                                        >
                                            <SkipPreviousIcon />
                                        </IconButton>
                                    </Tooltip>,
                                    <Tooltip key="next" title="Bài tiếp theo" arrow>
                                        <IconButton
                                            onClick={handleNext}
                                            sx={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                transition: 'all 0.3s ease',
                                                margin: '0 4px',
                                                '&:hover': {
                                                    background: 'rgba(138, 43, 226, 0.3)',
                                                    border: '1px solid rgba(138, 43, 226, 0.6)',
                                                    transform: 'translateY(-2px) scale(1.05)',
                                                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
                                                }
                                            }}
                                        >
                                            <SkipNextIcon />
                                        </IconButton>
                                    </Tooltip>
                                ]}
                                customVolumeControls={[]}
                            />
                        </Box>
                        
                        {/* Controls bên phải */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 160, flexShrink: 0 }}>
                            <Tooltip title="Yêu thích" arrow>
                                <IconButton 
                                    color="inherit" 
                                    size="large"
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(255, 107, 107, 0.2)',
                                            border: '1px solid rgba(255, 107, 107, 0.5)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)',
                                        }
                                    }}
                                >
                                    <FavoriteBorderIcon fontSize="medium" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Thêm vào playlist" arrow>
                                <IconButton 
                                    color="inherit" 
                                    size="large"
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(78, 205, 196, 0.2)',
                                            border: '1px solid rgba(78, 205, 196, 0.5)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(78, 205, 196, 0.3)',
                                        }
                                    }}
                                >
                                    <PlaylistAddIcon fontSize="medium" />
                                </IconButton>
                            </Tooltip>
                            
                            {/* Volume Control */}
                            <Box sx={{ position: 'relative' }}>
                                <Tooltip title="Âm lượng" arrow>
                                    <IconButton 
                                        color="inherit" 
                                        size="large"
                                        onMouseEnter={() => setShowVolumeSlider(true)}
                                        onMouseLeave={() => setShowVolumeSlider(false)}
                                        sx={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'rgba(138, 43, 226, 0.2)',
                                                border: '1px solid rgba(138, 43, 226, 0.5)',
                                                transform: 'translateY(-2px) scale(1.05)',
                                                boxShadow: '0 8px 20px rgba(138, 43, 226, 0.3)',
                                            }
                                        }}
                                    >
                                        {getVolumeIcon()}
                                    </IconButton>
                                </Tooltip>
                                
                                {/* Volume Slider */}
                                {showVolumeSlider && (
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: '60px',
                                        right: '0',
                                        background: 'rgba(0, 0, 0, 0.9)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(138, 43, 226, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px 12px',
                                        minWidth: '120px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                                        zIndex: 1400,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '-8px',
                                            right: '20px',
                                            width: '0',
                                            height: '0',
                                            borderLeft: '8px solid transparent',
                                            borderRight: '8px solid transparent',
                                            borderTop: '8px solid rgba(0, 0, 0, 0.9)',
                                        }
                                    }}>
                                        <Slider
                                            orientation="vertical"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            min={0}
                                            max={100}
                                            sx={{
                                                height: '100px',
                                                '& .MuiSlider-track': {
                                                    background: 'linear-gradient(180deg, #8a2be2, #ff6b6b, #4ecdc4)',
                                                    border: 'none',
                                                },
                                                '& .MuiSlider-rail': {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                },
                                                '& .MuiSlider-thumb': {
                                                    background: 'linear-gradient(45deg, #8a2be2, #ff6b6b)',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 0 10px rgba(138, 43, 226, 0.5)',
                                                    '&:hover': {
                                                        boxShadow: '0 0 20px rgba(138, 43, 226, 0.8)',
                                                        transform: 'scale(1.2)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Container>
                    
                    {/* Hiệu ứng particles */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        '&::before, &::after': {
                            content: '""',
                            position: 'absolute',
                            width: '2px',
                            height: '2px',
                            background: '#fff',
                            borderRadius: '50%',
                            animation: 'milkyway-float 6s infinite linear',
                        },
                        '&::before': {
                            left: '10%',
                            animationDelay: '0s',
                        },
                        '&::after': {
                            left: '90%',
                            animationDelay: '3s',
                        }
                    }} />
                    
                    <style jsx global>{`
                        @keyframes milkyway-glow {
                            0%, 100% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                        }
                        
                        @keyframes milkyway-float {
                            0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { transform: translateY(-20px) rotate(360deg); opacity: 0; }
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

export default AppFooter;