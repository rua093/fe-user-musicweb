'use client'

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTrack, setPlaying } from "@/store/slices/trackSlice";
import { usePlayContext } from '@/utils/hooks/usePlayContext';
import { useLikeSync } from '@/utils/hooks/useLikeSync';
import { convertSlugUrl } from "@/utils/api";
import { Box, Typography, Avatar, IconButton, Collapse, Button } from "@mui/material";
import Link from "next/link";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

interface IProps {
    tracks: IShareTrack[];
    playlistId?: string;
}

const PlaylistTrackList = (props: IProps) => {
    const { tracks, playlistId } = props;
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, audioControl } = useAppSelector(state => state.track);
    const [expanded, setExpanded] = useState(false);

    // Use play context for playlist
    const { setContextAndLoadQueue } = usePlayContext();
    
    // Use like sync hook for current track
    const { isLiked: hookIsLiked } = useLikeSync(currentTrack._id);



    const displayedTracks = expanded ? tracks : tracks.slice(0, 3);

    return (
        <Box>
            {/* Track List */}
            {displayedTracks.map((track, index) => (
                <Box
                    key={track._id}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: 'rgba(255,255,255,0.05)',
                        }
                    }}
                >
                    {/* Track Number */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                            width: 20,
                            textAlign: 'center',
                            mr: 1
                        }}
                    >
                        {index + 1}
                    </Typography>

                    {/* Album Art */}
                    <Avatar
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks/${track.trackUrl}`}
                        sx={{
                            width: 28,
                            height: 28,
                            mr: 1.5,
                            background: 'linear-gradient(45deg, #667eea, #764ba2)'
                        }}
                    >
                        {track.title?.charAt(0)}
                    </Avatar>

                    {/* Track Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
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
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.7rem'
                            }}
                        >
                            {track.description || 'Unknown Artist'}
                        </Typography>
                    </Box>



                    {/* Like Button */}
                    {track._id === currentTrack._id && (
                        <IconButton
                            size="small"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                mr: 0.5,
                                '&:hover': {
                                    color: '#ff6b6b',
                                    background: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            {hookIsLiked ? (
                                <FavoriteIcon sx={{ fontSize: 14, color: '#ff6b6b' }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 14 }} />
                            )}
                        </IconButton>
                    )}

                    {/* Play/Pause Button */}
                    <IconButton
                        size="small"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': {
                                color: 'white',
                                background: 'rgba(255,255,255,0.1)'
                            }
                        }}
                        onClick={async () => {
                            if (track._id === currentTrack._id && isPlaying) {
                                // Pause current track without resetting currentTime
                                dispatch(setCurrentTrack({ ...currentTrack, isPlaying: false, isSeeking: false, autoPlay: false, _source: 'playlist' }));
                                dispatch(setPlaying(false));
                                // Sử dụng audioControl để pause audio
                                audioControl?.pause && audioControl.pause();
                            } else if (track._id === currentTrack._id && !isPlaying) {
                                // Resume current track without resetting currentTime
                                dispatch(setCurrentTrack({ ...currentTrack, isPlaying: true, isSeeking: false, autoPlay: false, _source: 'playlist' }));
                                dispatch(setPlaying(true));
                                // Sử dụng audioControl để phát audio
                                audioControl?.play && audioControl.play();
                            } else {
                                // Play new track - set context and load queue for playlist
                                await setContextAndLoadQueue({
                                    type: 'playlist',
                                    id: playlistId
                                }, track);
                                
                                dispatch(setCurrentTrack({ ...track, isPlaying: true, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'playlist' }));
                                dispatch(setPlaying(true));
                                // Sử dụng audioControl để phát audio
                                audioControl?.play && audioControl.play();
                            }
                        }}
                    >
                        {(track._id === currentTrack._id && isPlaying) ? (
                            <PauseIcon sx={{ fontSize: 14 }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: 14 }} />
                        )}
                    </IconButton>
                </Box>
            ))}
            
            {/* Expand/Collapse Button */}
            {tracks.length > 3 && (
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Button
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            '&:hover': {
                                color: 'white',
                                background: 'rgba(255,255,255,0.05)'
                            }
                        }}
                        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                        {expanded ? 'Thu gọn' : `Xem thêm ${tracks.length - 3} bài hát`}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PlaylistTrackList;
