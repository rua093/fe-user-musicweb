'use client'

import { useAppSelector } from "@/store/hooks";
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { setCurrentTrack, setPlaying, setCurrentTrackIndex, setAutoPlay } from "@/store/slices/trackSlice";
import { useAppDispatch } from "@/store/hooks";

interface IProps {
    open: boolean;
    onClose: () => void;
}

const QueueDisplay = (props: IProps) => {
    const { open, onClose } = props;
    const dispatch = useAppDispatch();
    const { queue, currentTrack } = useAppSelector(state => state.track);
    


    const handlePlayTrack = (track: IShareTrack, index: number) => {
        dispatch(setCurrentTrackIndex(index));
        dispatch(setCurrentTrack(track));
        dispatch(setPlaying(true));
        dispatch(setAutoPlay(true));
        onClose();
    };

    const getQueueTitle = () => {
        switch (queue.source) {
            case 'playlist':
                return `Playlist Queue`;
            case 'like':
                return `Liked Tracks Queue`;
            case 'category':
                return `${queue.sourceId} Queue`;
            case 'search':
                return `Search Results Queue`;
            default:
                return `Now Playing Queue`;
        }
    };

    if (!open) return null;

    return (
        <Paper
            sx={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                width: 350,
                maxHeight: 400,
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)'
            }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {getQueueTitle()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                    {queue.tracks.length} tracks
                </Typography>
            </Box>

            {/* Queue List */}
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                {queue.tracks.map((track, index) => (
                    <ListItem
                        key={track._id}
                        sx={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                            },
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onClick={() => handlePlayTrack(track, index)}
                    >
                        {/* Current Track Indicator */}
                        {track._id === currentTrack._id && (
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                background: 'linear-gradient(135deg, #8a2be2, #ff6b6b)',
                                borderRadius: '0 2px 2px 0'
                            }} />
                        )}

                        {/* Track Number */}
                        <Typography
                            variant="caption"
                            sx={{
                                color: track._id === currentTrack._id ? '#8a2be2' : 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.75rem',
                                width: 30,
                                textAlign: 'center',
                                mr: 1,
                                fontWeight: track._id === currentTrack._id ? 600 : 400
                            }}
                        >
                            {index + 1}
                        </Typography>

                        {/* Album Art */}
                        <ListItemAvatar>
                            <Avatar
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${track.imgUrl}`}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)'
                                }}
                            >
                                {track.title?.charAt(0)}
                            </Avatar>
                        </ListItemAvatar>

                        {/* Track Info */}
                        <ListItemText
                            primary={
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: track._id === currentTrack._id ? 'white' : 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: track._id === currentTrack._id ? 600 : 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {track.title}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {track.uploader?.name || track.uploader?.email || 'Unknown Artist'}
                                </Typography>
                            }
                        />

                        {/* Play Button */}
                        <IconButton
                            size="small"
                            sx={{
                                color: track._id === currentTrack._id ? '#8a2be2' : 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    color: '#8a2be2',
                                    background: 'rgba(138, 43, 226, 0.1)'
                                }
                            }}
                        >
                            <PlayArrowIcon fontSize="small" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            {/* Empty State */}
            {queue.tracks.length === 0 && (
                <Box sx={{
                    p: 3,
                    textAlign: 'center'
                }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        No tracks in queue
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default QueueDisplay;
