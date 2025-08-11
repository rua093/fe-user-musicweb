'use client'

import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemButton, 
    Typography, 
    Box,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { sendRequest } from '@/utils/api';
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { setPlaylistModified } from "@/store/slices/trackSlice";
import { useRouter } from "next/navigation";

interface IProps {
    open: boolean;
    onClose: () => void;
    track: IShareTrack | null;
}

const AddToPlaylistModal = (props: IProps) => {
    const { open, onClose, track } = props;
    const { data: session } = useSession();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [loading, setLoading] = useState(false);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

    // Load user playlists
    useEffect(() => {
        if (open && session?.access_token) {
            loadPlaylists();
        }
    }, [open, session?.access_token]);

    // Force refresh when modal closes after successful addition
    useEffect(() => {
        if (!open && !loading) {
            // Small delay to ensure all operations are complete
            const timer = setTimeout(() => {
                router.refresh();
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [open, loading, router]);

    const loadPlaylists = async () => {
        setPlaylistsLoading(true);
        try {
            const res = await sendRequest<IBackendRes<IModelPaginate<IPlaylist>>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/by-user`,
                method: "POST",
                queryParams: {
                    current: 1,
                    pageSize: 100
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (res?.data?.result) {
                setPlaylists(res.data.result);
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách playlist',
                severity: 'error'
            });
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlist: IPlaylist) => {
        if (!track || !session?.access_token) return;

        setLoading(true);
        try {
            // Check if track already exists in playlist
            const trackExists = playlist.tracks?.some(t => t._id === track._id);
            
            if (trackExists) {
                setSnackbar({
                    open: true,
                    message: `🎵 "${track.title}" đã có sẵn trong playlist "${playlist.title}"`,
                    severity: 'info'
                });
                return;
            }

            // Add track to playlist
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists`,
                method: "PATCH",
                body: {
                    id: playlist._id,
                    tracks: [...(playlist.tracks?.map(t => t._id) || []), track._id]
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (res?.statusCode === 200) {
                // Revalidate cache to update UI
                try {
                    await Promise.all([
                        sendRequest<IBackendRes<any>>({
                            url: `/api/revalidate`,
                            method: "POST",
                            queryParams: {
                                tag: "playlist-by-user",
                                secret: "justArandomString"
                            }
                        }),
                        sendRequest<IBackendRes<any>>({
                            url: `/api/revalidate`,
                            method: "POST",
                            queryParams: {
                                tag: "liked-by-user",
                                secret: "justArandomString"
                            }
                        })
                    ]);
                } catch (error) {
                    console.error('Error revalidating cache:', error);
                }

                // Set playlist modified flag to trigger refresh
                dispatch(setPlaylistModified(true));

                setSnackbar({
                    open: true,
                    message: `✅ Đã thêm thành công "${track.title}" vào playlist "${playlist.title}"`,
                    severity: 'success'
                });
                onClose();

                // Force refresh after a short delay
                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } else {
                throw new Error('Failed to add track to playlist');
            }
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            setSnackbar({
                open: true,
                message: '❌ Không thể thêm bài hát vào playlist',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: 'white', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Thêm vào Playlist
                    </Typography>
                    {track && (
                        <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            mt: 1,
                            fontWeight: 500
                        }}>
                            {track.title}
                        </Typography>
                    )}
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {playlistsLoading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            py: 4 
                        }}>
                            <CircularProgress sx={{ color: '#4ecdc4' }} />
                        </Box>
                    ) : playlists.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Bạn chưa có playlist nào. Hãy tạo playlist trước!
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {playlists.map((playlist) => {
                                const trackExists = playlist.tracks?.some(t => t._id === track?._id);
                                return (
                                    <ListItem 
                                        key={playlist._id} 
                                        disablePadding
                                        sx={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => handleAddToPlaylist(playlist)}
                                            disabled={loading || trackExists}
                                            sx={{
                                                '&:hover': {
                                                    background: trackExists 
                                                        ? 'rgba(255, 255, 255, 0.02)' 
                                                        : 'rgba(78, 205, 196, 0.1)'
                                                }
                                            }}
                                        >
                                                                                         <ListItemText
                                                 primary={
                                                     <Typography sx={{ 
                                                         color: trackExists ? 'rgba(255, 255, 255, 0.4)' : 'white',
                                                         fontWeight: 500
                                                     }}>
                                                         {playlist.title}
                                                     </Typography>
                                                 }
                                                 secondary={
                                                     <Typography variant="caption" sx={{ 
                                                         color: trackExists ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'
                                                     }}>
                                                         {trackExists 
                                                             ? '🎵 Bài hát đã có sẵn trong playlist này' 
                                                             : `📝 ${playlist.tracks?.length || 0} bài hát - Click để thêm`
                                                         }
                                                     </Typography>
                                                 }
                                             />
                                             {trackExists && (
                                                 <Typography 
                                                     variant="caption" 
                                                     sx={{ 
                                                         color: '#4ecdc4',
                                                         fontWeight: 600,
                                                         fontSize: '0.75rem',
                                                         background: 'rgba(78, 205, 196, 0.1)',
                                                         px: 1,
                                                         py: 0.5,
                                                         borderRadius: 1,
                                                         border: '1px solid rgba(78, 205, 196, 0.3)'
                                                     }}
                                                 >
                                                     🎵 ĐÃ CÓ
                                                 </Typography>
                                             )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <Button 
                        onClick={onClose}
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ 
                        width: '100%',
                        background: snackbar.severity === 'success' ? '#4caf50' : 
                                   snackbar.severity === 'error' ? '#f44336' : '#2196f3',
                        color: 'white'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AddToPlaylistModal;
