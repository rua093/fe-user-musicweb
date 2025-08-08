'use client'
import { fetchDefaultImages, sendRequest } from '@/utils/api';
import { Box, TextField, Typography, Paper, Avatar, Chip, Divider } from '@mui/material';
import { useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from 'dayjs';
import WaveSurfer from "wavesurfer.js";
import relativeTime from 'dayjs/plugin/relativeTime';
import { useHasMounted } from '@/utils/customHook';
import Image from 'next/image';
import CommentIcon from '@mui/icons-material/Comment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

dayjs.extend(relativeTime)

interface IProps {
    comments: ITrackComment[];
    track: ITrackTop | null;
    wavesurfer: WaveSurfer | null;
}

const CommentTrack = (props: IProps) => {
    const router = useRouter();
    const hasMounted = useHasMounted();

    const { comments, track, wavesurfer } = props;
    const [yourComment, setYourComment] = useState("");
    const { data: session } = useSession();


    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secondsRemainder = Math.round(seconds) % 60
        const paddedSeconds = `0${secondsRemainder}`.slice(-2)
        return `${minutes}:${paddedSeconds}`
    }

    const handleSubmit = async () => {

        const res = await sendRequest<IBackendRes<ITrackComment>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
            method: "POST",
            body: {
                content: yourComment,
                moment: Math.round(wavesurfer?.getCurrentTime() ?? 0),
                track: track?._id
            },

            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },

        })
        if (res.data) {
            setYourComment("");

            await sendRequest<IBackendRes<any>>({
                url: `/api/revalidate`,
                method: "POST",
                queryParams: {
                    tag: "track-comment",
                    secret: "justArandomString"
                }
            })
            router.refresh();
        }
    }

    const handleJumpTrack = (moment: number) => {
        if (wavesurfer) {
            const duration = wavesurfer.getDuration();
            wavesurfer.seekTo(moment / duration);
            wavesurfer.play();
        }
    }
    return (
        <Box sx={{ marginTop: 4 }}>
            {/* Comments Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                marginBottom: 3,
                padding: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <CommentIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                    Comments ({comments?.length || 0})
                </Typography>
            </Box>

            {/* Add Comment Section */}
            {session?.user && (
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 3,
                    padding: 3,
                    marginBottom: 4,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Typography variant="h6" sx={{ color: 'white', marginBottom: 2, fontWeight: 600 }}>
                        Add a comment
                    </Typography>
                    <TextField
                        value={yourComment}
                        onChange={(e) => setYourComment(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share your thoughts about this track..."
                        variant="outlined"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit()
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(245, 158, 11, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#F59E0B',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    opacity: 1,
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }}
                    />
                </Paper>
            )}

            {/* Track Uploader Info */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                padding: 3,
                marginBottom: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                gap: 3,
                alignItems: 'center'
            }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        border: '3px solid rgba(245, 158, 11, 0.3)',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
                    }}
                >
                    <Image
                        alt="uploader avatar"
                        src={fetchDefaultImages(track?.uploader?.type!)}
                        width={80}
                        height={80}
                        style={{ borderRadius: '50%' }}
                    />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, marginBottom: 1 }}>
                        {track?.uploader?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Track Creator
                    </Typography>
                </Box>
            </Paper>

            {/* Comments List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments?.map((comment, index) => (
                    <Paper
                        key={comment._id}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
                            padding: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            {/* User Avatar */}
                            <Avatar
                                sx={{
                                    width: 50,
                                    height: 50,
                                    border: '2px solid rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                <Image
                                    alt='commenter avatar'
                                    width={50}
                                    height={50}
                                    src={fetchDefaultImages(comment.user.type)}
                                    style={{ borderRadius: '50%' }}
                                />
                            </Avatar>

                            {/* Comment Content */}
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                        {comment?.user?.name ?? comment?.user?.email}
                                    </Typography>
                                    
                                    <Chip
                                        icon={<AccessTimeIcon />}
                                        label={formatTime(comment.moment)}
                                        onClick={() => handleJumpTrack(comment.moment)}
                                        sx={{
                                            background: 'rgba(245, 158, 11, 0.2)',
                                            color: '#F59E0B',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                background: 'rgba(245, 158, 11, 0.3)',
                                                transform: 'scale(1.05)'
                                            },
                                            transition: 'all 0.2s ease',
                                            '& .MuiChip-icon': { color: '#F59E0B' }
                                        }}
                                    />
                                </Box>
                                
                                <Typography variant="body1" sx={{ 
                                    color: 'rgba(255, 255, 255, 0.9)', 
                                    lineHeight: 1.6,
                                    marginBottom: 1
                                }}>
                                    {comment.content}
                                </Typography>
                                
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    {hasMounted && dayjs(comment.createdAt).fromNow()}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                ))}

                {comments?.length === 0 && (
                    <Paper sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                        padding: 4,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center'
                    }}>
                        <CommentIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 2 }} />
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: 1 }}>
                            No comments yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            Be the first to share your thoughts about this track!
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    )
}

export default CommentTrack;