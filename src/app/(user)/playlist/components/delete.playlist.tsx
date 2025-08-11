'use client'
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useToast } from '@/utils/toast';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface IProps {
    playlist: IPlaylist;
}

const DeletePlaylist = (props: IProps) => {
    const { playlist } = props;
    const [open, setOpen] = useState(false);
    
    const toast = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/${playlist._id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                }
            });

            if (res.data) {
                toast.success("Xóa playlist thành công!");
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
            toast.error("Có lỗi xảy ra khi xóa playlist!");
        }
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: '#ff6b6b',
                    '&:hover': {
                        background: 'rgba(255, 107, 107, 0.1)',
                    }
                }}
            >
                <DeleteIcon />
            </IconButton>

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="sm" 
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WarningIcon sx={{ color: '#ff6b6b', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Xóa Playlist
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                        Bạn có chắc chắn muốn xóa playlist <strong>"{playlist.title}"</strong>?
                    </Typography>
                    
                    <Box sx={{ 
                        background: 'rgba(255, 107, 107, 0.1)', 
                        borderRadius: 2, 
                        p: 2,
                        border: '1px solid rgba(255, 107, 107, 0.3)'
                    }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Tất cả bài hát trong playlist sẽ bị xóa khỏi danh sách của bạn.
                        </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            <strong>Thông tin playlist:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', ml: 2 }}>
                            • Tên: {playlist.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', ml: 2 }}>
                            • Số bài hát: {playlist.tracks?.length || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', ml: 2 }}>
                            • Trạng thái: {playlist.isPublic ? 'Công khai' : 'Riêng tư'}
                        </Typography>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, pt: 1 }}>
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
                        Hủy
                    </Button>
                    
                    <Button 
                        onClick={handleDelete}
                        variant="contained"
                        sx={{
                            background: '#ff6b6b',
                            color: 'white',
                            px: 3,
                            '&:hover': {
                                background: '#ff5252',
                            }
                        }}
                    >
                        Xóa Playlist
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeletePlaylist;

