'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { useWavesurfer } from "@/utils/customHook";
import { WaveSurferOptions } from 'wavesurfer.js';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import './wave.scss';
import { Tooltip, Box, Typography, Paper, IconButton, Chip } from "@mui/material";
import { useTrackContext } from "@/lib/track.wrapper";
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
    const [duration, setDuration] = useState<string>("0:00");
    const { currentTrack, setCurrentTrack, setWaveControl } = useTrackContext() as ITrackContext & { setWaveControl?: any };
    const [internalSeek, setInternalSeek] = useState(false);

    const wavesurferRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const optionsMemo = useMemo((): Omit<WaveSurferOptions, 'container'> => {
        let gradient, progressGradient;
        if (typeof window !== "undefined") {
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
        }

        return {
            waveColor: gradient,
            progressColor: progressGradient,
            height: 120,
            barWidth: 4,
            barGap: 2,
            url: `/api?audio=${fileName}`,
        }
    }, []);
    const wavesurfer = useWavesurfer(containerRef, optionsMemo);
    useEffect(() => {
        if (wavesurfer) wavesurferRef.current = wavesurfer;
    }, [wavesurfer]);
    // Initialize wavesurfer when the container mounts
    // or any of the props change
    useEffect(() => {
        if (!wavesurfer) return;
        setIsPlaying(false);

        const hover = hoverRef.current!;
        const waveform = containerRef.current!;
            waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`))

        const subscriptions = [
            wavesurfer.on('play', () => setIsPlaying(true)),
            wavesurfer.on('pause', () => setIsPlaying(false)),
            wavesurfer.on('decode', (duration) => {
                setDuration(formatTime(duration));
            }),
            wavesurfer.on('timeupdate', (currentTime) => {
                setTime(formatTime(currentTime));
            }),
            wavesurfer.once('interaction', () => {
                wavesurfer.play()
            })
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
        }
    }, [wavesurfer])

    // Đăng ký callback điều khiển cho AppFooter
    useEffect(() => {
        if (!wavesurfer || !setWaveControl) return;
        setWaveControl({
            play: () => wavesurfer.play(),
            pause: () => wavesurfer.pause(),
            seek: (time: number) => {
                const duration = wavesurfer.getDuration();
                if (duration) wavesurfer.seekTo(time / duration);
            }
        });
        return () => setWaveControl(undefined);
    }, [wavesurfer, setWaveControl]);

    // Helper để so sánh track
    const isTrackStateChanged = (next: IShareTrack, prev: IShareTrack) => {
        return (
            next._id !== prev._id ||
            next.isPlaying !== prev.isPlaying ||
            Math.abs((next.currentTime ?? 0) - (prev.currentTime ?? 0)) > 0.1
        );
    };

    // On play button click: chỉ gọi play/pause, không set isPlaying thủ công
    const onPlayClick = useCallback(() => {
        if (!track || !wavesurferRef.current) return;
        if (!isPlaying) {
            wavesurferRef.current.play();
        } else {
            wavesurferRef.current.pause();
        }
    }, [track, isPlaying]);

    // Lắng nghe sự kiện play/pause thực tế từ wavesurfer để cập nhật isPlaying vào context
    useEffect(() => {
        if (!wavesurferRef.current || !track) return;
        const onPlay = () => {
            if (currentTrack._id === track._id && !currentTrack.isPlaying) {
                setCurrentTrack({ ...currentTrack, isPlaying: true, _source: 'wave' });
            }
        };
        const onPause = () => {
            if (currentTrack._id === track._id && currentTrack.isPlaying) {
                setCurrentTrack({ ...currentTrack, isPlaying: false, _source: 'wave' });
            }
        };
        (wavesurferRef.current.on as any)('play', onPlay);
        (wavesurferRef.current.on as any)('pause', onPause);
        return () => {
            (wavesurferRef.current.un as any)('play', onPlay);
            (wavesurferRef.current.un as any)('pause', onPause);
        };
    }, [currentTrack, setCurrentTrack, track]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secondsRemainder = Math.round(seconds) % 60
        const paddedSeconds = `0${secondsRemainder}`.slice(-2)
        return `${minutes}:${paddedSeconds}`
    }

    const calLeft = (moment: number) => {
        const hardCodeDuration = wavesurfer?.getDuration() ?? 0;
        const percent = (moment / hardCodeDuration) * 100;
        return `${percent}%`
    }

    useEffect(() => {
        if (!wavesurfer || !track) return;
        // Chỉ update UI/audio khi _source !== 'wave'
        if (currentTrack._id === track._id && currentTrack._source !== 'wave') {
            if (currentTrack.isPlaying && !wavesurfer.isPlaying()) {
                wavesurfer.play();
            } else if (!currentTrack.isPlaying && wavesurfer.isPlaying()) {
                wavesurfer.pause();
            }
            // Đồng bộ progress hai chiều
            if (typeof currentTrack.currentTime === 'number' && !isNaN(currentTrack.currentTime)) {
                const duration = wavesurfer.getDuration();
                if (duration && Math.abs(wavesurfer.getCurrentTime() - currentTrack.currentTime) > 0.5 && !internalSeek) {
                    wavesurfer.seekTo(currentTrack.currentTime / duration);
                    setInternalSeek(true);
                }
            }
        } else {
            // Nếu chuyển sang track khác, pause wavesurfer này
            if (wavesurfer.isPlaying()) wavesurfer.pause();
        }
    }, [currentTrack, wavesurfer, track, internalSeek]);

    // Reset cờ sau khi seek xong
    useEffect(() => {
        if (internalSeek) {
            const t = setTimeout(() => setInternalSeek(false), 200);
            return () => clearTimeout(t);
        }
    }, [internalSeek]);

    useEffect(() => {
        if (track?._id && !currentTrack?._id)
            setCurrentTrack({ ...track, isPlaying: false, currentTime: 0 })
    }, [track])

    // Khi tua trên waveform, cập nhật context nếu khác biệt
    useEffect(() => {
        if (!wavesurferRef.current || !track) return;
        const onSeek = () => {
            if (currentTrack._id === track._id) {
                const newTime = wavesurferRef.current.getCurrentTime();
                if (Math.abs(newTime - (currentTrack.currentTime ?? 0)) > 0.1) {
                    setCurrentTrack({ ...currentTrack, currentTime: newTime, _source: 'wave' });
                }
            }
        };
        (wavesurferRef.current.on as any)('seek', onSeek);
        return () => {
            (wavesurferRef.current.un as any)('seek', onSeek);
        };
    }, [currentTrack, setCurrentTrack, track]);

    // Khi sóng chạy (timeupdate), cập nhật currentTime cho context (debounce)
    useEffect(() => {
        if (!wavesurferRef.current || !track) return;
        const onTimeUpdate = (currentTime: number) => {
            if (currentTrack._id === track._id) {
                const now = Date.now();
                if (now - lastUpdate > 200 && Math.abs(currentTime - (currentTrack.currentTime ?? 0)) > 0.1) {
                    setCurrentTrack({ ...currentTrack, currentTime, _source: 'wave' });
                    setLastUpdate(now);
                }
            }
        };
        (wavesurferRef.current.on as any)('timeupdate', onTimeUpdate);
        return () => {
            (wavesurferRef.current.un as any)('timeupdate', onTimeUpdate);
        };
    }, [currentTrack, setCurrentTrack, track, lastUpdate]);

    // Khi nhận context từ player bar, chỉ update wavesurfer nếu _source !== 'wave'
    useEffect(() => {
        if (!wavesurferRef.current || !track) return;
        if (currentTrack._id === track._id && currentTrack._source !== 'wave') {
            if (currentTrack.isPlaying && !wavesurferRef.current.isPlaying()) {
                wavesurferRef.current.play();
            } else if (!currentTrack.isPlaying && wavesurferRef.current.isPlaying()) {
                wavesurferRef.current.pause();
            }
            if (typeof currentTrack.currentTime === 'number' && !isNaN(currentTrack.currentTime)) {
                const duration = wavesurferRef.current.getDuration();
                if (duration && Math.abs(wavesurferRef.current.getCurrentTime() - currentTrack.currentTime) > 0.5) {
                    wavesurferRef.current.seekTo(currentTrack.currentTime / duration);
                }
            }
        }
    }, [currentTrack, track]);

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
                            {isPlaying ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayArrowIcon sx={{ fontSize: 40 }} />}
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
                            }}>{duration}</div>
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
    )
}

export default WaveTrack;