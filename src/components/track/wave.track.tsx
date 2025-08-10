'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { useWavesurfer } from "@/utils/customHook";
import { WaveSurferOptions } from 'wavesurfer.js';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import './wave.scss';
import { Tooltip, Box, Typography, Paper, IconButton, Chip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  setCurrentTrack, 
  setPlaying, 
  setCurrentTime, 
  setDuration, 
  setSeeking, 
  setSource 
} from "@/store/slices/trackSlice";
import { fetchDefaultImages, sendRequest } from "@/utils/api";
import CommentTrack from "./comment.track";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon2 from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import StarIcon from '@mui/icons-material/Star';

import LikeTrack from "./like.track";

interface IProps {
    track: ITrackTop | null;
    comments: ITrackComment[]
}

const WaveTrack = (props: IProps) => {
    const { track, comments } = props;
    const router = useRouter();
    const firstViewRef = useRef(true);

    const searchParams = useSearchParams()
    const fileName = searchParams.get('audio');
    const containerRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef<HTMLDivElement>(null);
    const [time, setTime] = useState<string>("0:00");
    const [localDuration, setLocalDuration] = useState<string>("0:00");
    
    // Redux hooks
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, currentTime, duration, isSeeking, autoPlay, source } = useAppSelector(state => state.track);

    const wavesurferRef = useRef<any>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(0);
    const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const optionsMemo = useMemo((): Omit<WaveSurferOptions, 'container'> => {
        if (!isClient) {
            return {
                waveColor: '#8B5CF6',
                progressColor: '#F59E0B',
                height: 120,
                barWidth: 4,
                barGap: 2,
                backend: 'MediaElement',
                mediaControls: false,
                interact: true,
                hideScrollbar: true,
                autoplay: false,
                normalize: false,
            };
        }

        let gradient, progressGradient;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        // Define the waveform gradient - Milkyway theme
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35);
        gradient.addColorStop(0, '#8B5CF6') // Purple top
        gradient.addColorStop((canvas.height * 0.7) / canvas.height, '#8B5CF6') // Purple top
        gradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#E0E7FF') // Light purple line
        gradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#E0E7FF') // Light purple line
        gradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#6366F1') // Indigo bottom
        gradient.addColorStop(1, '#6366F1') // Indigo bottom

        // Define the progress gradient - Milkyway theme
        progressGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 1.35)
        progressGradient.addColorStop(0, '#F59E0B') // Amber top
        progressGradient.addColorStop((canvas.height * 0.7) / canvas.height, '#F59E0B') // Amber top
        progressGradient.addColorStop((canvas.height * 0.7 + 1) / canvas.height, '#FEF3C7') // Light amber line
        progressGradient.addColorStop((canvas.height * 0.7 + 2) / canvas.height, '#FEF3C7') // Light amber line
        progressGradient.addColorStop((canvas.height * 0.7 + 3) / canvas.height, '#F97316') // Orange bottom
        progressGradient.addColorStop(1, '#F97316') // Orange bottom

        return {
            waveColor: gradient,
            progressColor: progressGradient,
            height: 120,
            barWidth: 4,
            barGap: 2,
            // Sử dụng WebAudio backend để decode audio data
            backend: 'WebAudio',
            // Load audio URL trực tiếp để tạo waveform
            url: track?.trackUrl ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks/${track.trackUrl}` : undefined,
            // Disable audio playback - chỉ dùng để tạo waveform
            mediaControls: false,
            interact: true,
            hideScrollbar: true,
            autoplay: false,
            normalize: false,
        }
    }, [isClient, track?.trackUrl]); // Thêm trackUrl vào dependencies

    const wavesurfer = useWavesurfer(containerRef, optionsMemo);
    
    useEffect(() => {
        if (wavesurfer) wavesurferRef.current = wavesurfer;
    }, [wavesurfer]);

    // Initialize wavesurfer when the container mounts
    useEffect(() => {
        if (!wavesurfer) return;

        // Debug WaveSurfer state
        if (wavesurfer) {
            console.log('🔍 DEBUG: WaveSurfer state:', {
                getDuration: wavesurfer.getDuration(),
                getCurrentTime: wavesurfer.getCurrentTime()
            });
        }

        const hover = hoverRef.current!;
        const waveform = containerRef.current!;
        waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`))

        const subscriptions = [
            wavesurfer.on('decode', (duration) => {
                console.log('🔍 DEBUG: WaveSurfer decoded audio, duration:', duration);
                setLocalDuration(formatTime(duration));
                // Cập nhật duration vào store chỉ khi đây là track đang phát
                if (currentTrack._id === track?._id) {
                    dispatch(setDuration(duration));
                }
            }),
            wavesurfer.on('ready', () => {
                console.log('🔍 DEBUG: WaveSurfer is ready');
            }),

            wavesurfer.on('interaction', () => {
                // Khi user tương tác với waveform
                const currentWavesurferTime = wavesurfer.getCurrentTime();
                const wavesurferDuration = wavesurfer.getDuration();
                
                if (track && currentTrack._id === track._id) {
                    // Nếu đây là track đang phát, chỉ cập nhật thời gian
                    dispatch(setCurrentTime(currentWavesurferTime));
                    dispatch(setSeeking(false));
                    dispatch(setSource('wave'));
                    
                    // Chỉ cập nhật duration nếu chưa có hoặc khác biệt
                    if (wavesurferDuration > 0 && Math.abs(wavesurferDuration - (currentTrack.duration || 0)) > 0.1) {
                        dispatch(setDuration(wavesurferDuration));
                    }
                    
                    // Play audio thông qua audio element có sẵn
                    const audioElement = document.getElementById('main-audio-player') as HTMLAudioElement;
                    if (audioElement) {
                        audioElement.currentTime = currentWavesurferTime;
                        audioElement.play();
                        dispatch(setPlaying(true));
                    }
                } else if (track && !currentTrack._id) {
                    // Nếu đây là track đầu tiên, set làm track mới
                    dispatch(setCurrentTrack({ 
                        ...track, 
                        isPlaying: true, 
                        currentTime: currentWavesurferTime, 
                        isSeeking: false,
                        autoPlay: false,
                        duration: wavesurferDuration > 0 ? wavesurferDuration : (track.duration || 0),
                        _source: 'wave' 
                    }));
                    dispatch(setPlaying(true));
                } else if (track) {
                    // Nếu đây là track khác, set làm track mới
                    dispatch(setCurrentTrack({ 
                        ...track, 
                        isPlaying: true, 
                        currentTime: currentWavesurferTime, 
                        isSeeking: false,
                        autoPlay: false,
                        duration: wavesurferDuration > 0 ? wavesurferDuration : (track.duration || 0),
                        _source: 'wave' 
                    }));
                    dispatch(setPlaying(true));
                }
            }),
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
            // Clear seek timeout on cleanup
            if (seekTimeoutRef.current) {
                clearTimeout(seekTimeoutRef.current);
            }
        }
    }, [wavesurfer, currentTrack, track, dispatch])

    // Sync waveform progress with audio playback
    useEffect(() => {
        if (!wavesurfer || !track) return;
        
        const updateProgress = () => {
            // Chỉ cập nhật progress nếu đây là track đang phát
            if (currentTrack._id === track._id && duration > 0 && currentTime >= 0) {
                const progress = currentTime / duration;
                wavesurfer.seekTo(progress);
            }
        };
        
        updateProgress();
    }, [wavesurfer, currentTime, duration, currentTrack._id, track?._id]);

    // Reset waveform khi track thay đổi
    useEffect(() => {
        if (!wavesurfer || !track) return;
        
        // Nếu đây là track mới (khác với track đang phát), reset về đầu
        if (currentTrack._id !== track._id) {
            wavesurfer.seekTo(0);
            // Reset local duration khi track thay đổi
            setLocalDuration("0:00");
        }
    }, [wavesurfer, currentTrack._id, track?._id]);

    // On play button click: chỉ cập nhật store, không gọi wavesurfer play
    const onPlayClick = useCallback(() => {
        if (!track) return;
        
        // Nếu đây là track khác với track đang phát, set làm track mới
        if (currentTrack._id !== track._id) {
            dispatch(setCurrentTrack({ 
                ...track, 
                isPlaying: true, 
                currentTime: 0, 
                isSeeking: false,
                autoPlay: false,
                duration: track.duration || 0,
                _source: 'wave' 
            }));
        } else {
            // Nếu đây là track đang phát, chỉ toggle play/pause
            dispatch(setPlaying(!isPlaying));
            dispatch(setSource('wave'));
        }
        
    }, [track, currentTrack._id, isPlaying, dispatch]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secondsRemainder = Math.round(seconds) % 60
        const paddedSeconds = `0${secondsRemainder}`.slice(-2)
        return `${minutes}:${paddedSeconds}`
    }

    const calLeft = (moment: number) => {
        // Sử dụng duration từ store thay vì wavesurfer để đảm bảo chính xác
        const storeDuration = currentTrack.duration || track?.duration || 0;
        const wavesurferDuration = wavesurfer?.getDuration() ?? 0;
        const duration = storeDuration > 0 ? storeDuration : wavesurferDuration;
        
        if (duration <= 0) return '0%';
        const percent = (moment / duration) * 100;
        return `${percent}%`
    }

    // Đồng bộ với store khi currentTrack thay đổi
    useEffect(() => {
        if (!wavesurfer || !track) return;
        
        // Nếu đây là track đang phát và source không phải từ wave
        if (currentTrack._id === track._id && source !== 'wave') {
            // Sync progress với audio element
            if (duration > 0) {
                const progress = currentTime / duration;
                wavesurfer.seekTo(progress);
            }
        } else if (currentTrack._id !== track._id) {
            // Nếu đây không phải track đang phát, reset về đầu
            wavesurfer.seekTo(0);
        }
    }, [wavesurfer, currentTrack._id, track?._id, currentTime, duration, source]);

    // Khi track mới được load
    useEffect(() => {
        if (track?._id && !currentTrack?._id) {
            // Khởi tạo track với duration từ track data, không reset currentTime
            dispatch(setCurrentTrack({ 
                ...track, 
                isPlaying: false, 
                currentTime: 0, 
                isSeeking: false,
                autoPlay: false,
                duration: track.duration || 0,
                _source: undefined
            }));
        }
    }, [track, currentTrack, dispatch]);

    // Khi track mới được load và autoPlay = true
    useEffect(() => {
        if (track?._id && currentTrack?._id === track._id && autoPlay && !isPlaying && wavesurfer) {
            wavesurfer.play();
        }
    }, [autoPlay, track, currentTrack, wavesurfer, isPlaying]);



    // Logic chính:
    // 1. Mỗi WaveSurfer chỉ hiển thị track của trang hiện tại
    // 2. Khi user click vào WaveSurfer, track đó sẽ trở thành track đang phát
    // 3. Player bar sẽ phát track đang được set trong store
    // 4. Progress bar sẽ đồng bộ với track đang phát
    // 5. Khi chuyển sang track khác, WaveSurfer sẽ reset về đầu

    const handleIncreaseView = async () => {
        if (firstViewRef.current) {
            await sendRequest<IBackendRes<IModelPaginate<ITrackLike>>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/increase-view`,
                method: "POST",
                body: {
                    trackId: track?._id
                }
            })

            await sendRequest<IBackendRes<any>>({
                url: `/api/revalidate`,
                method: "POST",
                queryParams: {
                    tag: "track-by-id",
                    secret: "justArandomString"
                }
            })
            router.refresh();
            firstViewRef.current = false;
        }
    }

    return (
        <>
            <Box sx={{ 
                marginTop: 3, 
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #475569 75%, #64748B 100%)',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                {/* Milkyway background effect */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
                
                <Box sx={{
                    position: 'relative',
                    zIndex: 1,
                    padding: 4,
                    display: 'flex',
                    gap: 4,
                    minHeight: 500
                }}>
                    {/* Left Section - Track Info & Waveform */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}>
                        {/* Track Header */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: 3,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {/* Play Button */}
                            <IconButton
                                onClick={onPlayClick}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.4)'
                                    },
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)'
                                }}
                            >
                                {isPlaying && currentTrack._id === track?._id ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayArrowIcon sx={{ fontSize: 40 }} />}
                            </IconButton>

                            {/* Track Info */}
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 700,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                        marginBottom: 1,
                                        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    {track?.title}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '1.1rem',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    {track?.description}
                                </Typography>
                            </Box>
                                
                            {/* Stats */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                alignItems: 'center'
                            }}>
                                <Chip 
                                    icon={<PlayArrowIcon2 />}
                                    label={track?.countPlay || 0}
                                    sx={{
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        color: '#60A5FA',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        '& .MuiChip-icon': { color: '#60A5FA' }
                                    }}
                                />
                                <Chip 
                                    icon={<FavoriteIcon />} 
                                    label={track?.countLike || 0}
                                    sx={{
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#F87171',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        '& .MuiChip-icon': { color: '#F87171' }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Waveform Container */}
                        <Paper sx={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderRadius: 3,
                            padding: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box ref={containerRef} className="wave-form-container" sx={{ position: 'relative' }}>
                                {!isClient && (
                                    <Box sx={{
                                        height: 120,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: 1,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 10
                                    }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            Loading waveform...
                                        </Typography>
                                    </Box>
                                )}
                                <div className="time" style={{
                                    position: "absolute",
                                    zIndex: 11,
                                    top: 10,
                                    left: 10,
                                    fontSize: "14px",
                                    background: "rgba(0, 0, 0, 0.8)",
                                    padding: "8px 12px",
                                    color: "#F59E0B",
                                    borderRadius: "20px",
                                    fontWeight: "bold"
                                }}>{time}</div>
                                <div className="duration" style={{
                                    position: "absolute",
                                    zIndex: 11,
                                    top: 10,
                                    right: 10,
                                    fontSize: "14px",
                                    background: "rgba(0, 0, 0, 0.8)",
                                    padding: "8px 12px",
                                    color: "#F59E0B",
                                    borderRadius: "20px",
                                    fontWeight: "bold"
                                }}>{localDuration}</div>
                                <div ref={hoverRef} className="hover-wave"></div>
                                <div className="overlay"
                                    style={{
                                        position: "absolute",
                                        height: "30px",
                                        width: "100%",
                                        bottom: "0",
                                        backdropFilter: "brightness(0.3)"
                                    }}
                                ></div>
                                <div className="comments"
                                    style={{ position: "relative" }}
                                >
                                    {
                                        comments?.map(item => {
                                            return (
                                                <Tooltip title={item.content} arrow key={item._id}>
                                                    <Image
                                                        onPointerMove={(e) => {
                                                            const hover = hoverRef.current!;
                                                            hover.style.width = calLeft(item.moment)
                                                        }}
                                                        src={fetchDefaultImages(item.user.type)}
                                                        alt="user comment"
                                                        height={24}
                                                        width={24}
                                                        style={{
                                                            position: "absolute",
                                                            top: 91,
                                                            zIndex: 20,
                                                            left: calLeft(item.moment),
                                                            borderRadius: '50%',
                                                            border: '2px solid #F59E0B',
                                                            boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
                                                        }}
                                                    />
                                                </Tooltip>
                                            )
                                        })
                                    }
                                </div>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Right Section - Album Art */}
                    <Box sx={{
                        width: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        {/* Album Art */}
                        <Paper sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 4,
                            padding: 2,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {track?.imgUrl ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${track?.imgUrl}`}
                                    width={280}
                                    height={280}
                                    alt="album cover"
                                    style={{
                                        borderRadius: '16px',
                                        objectFit: 'cover',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                />
                            ) : (
                                <Box sx={{
                                    width: 280,
                                    height: 280,
                                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}>
                                    <MusicNoteIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.7)' }} />
                                </Box>
                            )}
                            
                            {/* Floating stars effect */}
                            <Box sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                animation: 'twinkle 2s ease-in-out infinite'
                            }}>
                                <StarIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
                            </Box>
                            <Box sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: 15,
                                animation: 'twinkle 2s ease-in-out infinite 0.5s'
                            }}>
                                <StarIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
                            </Box>
                        </Paper>

                        {/* Uploader Info */}
                        <Paper sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
                            padding: 2,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            width: '100%',
                            textAlign: 'center'
                        }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: 1 }}>
                                Uploaded by
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                {track?.uploader?.email}
                            </Typography>
                        </Paper>
                    </Box>
                </Box>

                {/* Like Track Section */}
                <Box sx={{ padding: 3, background: 'rgba(15, 23, 42, 0.9)' }}>
                    <LikeTrack track={track} />
                </Box>

                {/* Comments Section */}
                <Box sx={{ padding: 3, background: 'rgba(15, 23, 42, 0.7)' }}>
                    <CommentTrack
                        comments={comments}
                        track={track}
                        wavesurfer={wavesurfer}
                    />
                </Box>
            </Box>
        </>
    )
}

export default WaveTrack;
