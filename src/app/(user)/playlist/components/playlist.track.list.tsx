'use client'

import { useTrackContext } from "@/lib/track.wrapper";
import { convertSlugUrl } from "@/utils/api";
import { Box, Typography, Avatar, IconButton, Collapse, Button } from "@mui/material";
import Link from "next/link";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

interface IProps {
    tracks: IShareTrack[];
}

const PlaylistTrackList = (props: IProps) => {
    const { tracks } = props;
    const { currentTrack, setCurrentTrack } = useTrackContext() as ITrackContext;
    const [expanded, setExpanded] = useState(false);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

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

                    {/* Duration */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.7rem',
                            mr: 1
                        }}
                    >
                        {formatTime(track.duration || 0)}
                    </Typography>

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
                        onClick={() => {
                            if (track._id === currentTrack._id && currentTrack.isPlaying) {
                                setCurrentTrack({ ...currentTrack, isPlaying: false });
                            } else {
                                setCurrentTrack({ ...track, isPlaying: true });
                            }
                        }}
                    >
                        {(track._id === currentTrack._id && currentTrack.isPlaying) ? (
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
