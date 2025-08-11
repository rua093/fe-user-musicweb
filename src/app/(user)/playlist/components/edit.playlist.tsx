'use client'
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useToast } from '@/utils/toast';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { convertSlugUrl } from "@/utils/api";
import Link from "next/link";
import DeletePlaylist from './delete.playlist';

interface IProps {
    playlist: IPlaylist;
}

const EditPlaylist = (props: IProps) => {
    const { playlist } = props;
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
    const [title, setTitle] = useState(playlist.title);
    const [isPublic, setIsPublic] = useState(playlist.isPublic);
    const [tracks, setTracks] = useState(playlist.tracks || []);
    
    const toast = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const handleOpen = () => {
        setOpen(true);
        setEditMode('view');
        setTitle(playlist.title);
        setIsPublic(playlist.isPublic);
        setTracks(playlist.tracks || []);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode('view');
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Tên playlist không được để trống!");
            return;
        }

        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists`,
                method: "PATCH",
                body: {
                    id: playlist._id,
                    title: title.trim(),
                    isPublic: isPublic,
                    tracks: tracks.map(track => track._id)
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                }
            });

            if (res.data) {
                toast.success("Cập nhật playlist thành công!");
                await sendRequest<IBackendRes<any>>({
                    url: `/api/revalidate`,
                    method: "POST",
                    queryParams: {
                        tag: "playlist-by-user",
                        secret: "justArandomString"
                    }
                });
                handleClose();
                router.refresh();
            } else {
                toast.error(res.message || "Có lỗi xảy ra!");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật playlist!");
        }
    };

    const handleDeleteTrack = (trackId: string) => {
        setTracks(prev => prev.filter(track => track._id !== trackId));
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: 'rgba(255,255,255,0.6)',
                    '&:hover': {
                        color: 'white',
                        background: 'rgba(255,255,255,0.1)'
                    }
                }}
            >
                <EditIcon />
            </IconButton>

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        background: '#1a1a1a',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {editMode === 'view' ? 'Chi tiết Playlist' : 'Chỉnh sửa Playlist'}
                        </Typography>
                        {editMode === 'view' && (
                            <Button
                                onClick={() => setEditMode('edit')}
                                variant="outlined"
                                size="small"
                                sx={{
                                    color: '#667eea',
                                    borderColor: '#667eea',
                                    '&:hover': {
                                        borderColor: '#5a6fd8',
                                        background: 'rgba(102, 126, 234, 0.1)'
                                    }
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                        )}
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Thông tin cơ bản */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                                Thông tin cơ bản
                            </Typography>
                            
                            {editMode === 'view' ? (
                                <Box sx={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    borderRadius: 2, 
                                    p: 2,
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                                        <strong>Tên:</strong> {playlist.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        <strong>Trạng thái:</strong> {playlist.isPublic ? 'Công khai' : 'Riêng tư'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        <strong>Số bài hát:</strong> {tracks.length}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Tên playlist"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                                '&.Mui-focused': {
                                                    color: '#667eea',
                                                },
                                            },
                                        }}
                                    />
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                            style={{ accentColor: '#667eea' }}
                                        />
                                        <label htmlFor="isPublic" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                            Công khai
                                        </label>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Danh sách tracks */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                                Danh sách bài hát ({tracks.length})
                            </Typography>
                            
                            {tracks.length === 0 ? (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    py: 4,
                                    color: 'rgba(255,255,255,0.5)'
                                }}>
                                    <Typography variant="body2">
                                        Chưa có bài hát nào trong playlist
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    maxHeight: 400, 
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '3px',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,0.5)',
                                        },
                                    },
                                }}>
                                    {tracks.map((track, index) => (
                                        <Box
                                            key={track._id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                py: 1.5,
                                                px: 2,
                                                borderRadius: 1,
                                                mb: 1,
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    background: 'rgba(255,255,255,0.05)',
                                                }
                                            }}
                                        >
                                            {/* Số thứ tự */}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'rgba(255,255,255,0.5)',
                                                    width: 30,
                                                    textAlign: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                {index + 1}
                                            </Typography>

                                            {/* Thông tin track */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'white',
                                                        fontWeight: 500,
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
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {track.description || 'Unknown Artist'}
                                                </Typography>
                                            </Box>

                                            

                                            {/* Nút xóa (chỉ hiển thị khi đang edit) */}
                                            {editMode === 'edit' && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteTrack(track._id)}
                                                    sx={{
                                                        color: '#ff6b6b',
                                                        '&:hover': {
                                                            background: 'rgba(255, 107, 107, 0.1)',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box>
                            {editMode === 'view' && <DeletePlaylist playlist={playlist} />}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                onClick={handleClose}
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    '&:hover': {
                                        color: 'white',
                                        background: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                {editMode === 'view' ? 'Đóng' : 'Hủy'}
                            </Button>
                            
                            {editMode === 'edit' && (
                                <Button 
                                    onClick={handleSave}
                                    variant="contained"
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        px: 3,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        }
                                    }}
                                >
                                    Lưu thay đổi
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditPlaylist;
