'use client'
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useToast } from '@/utils/toast';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

const NewPlaylist = (props: any) => {
    const [open, setOpen] = useState(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [title, setTitle] = useState<string>("");
    const toast = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const handleClose = (event: any, reason: any) => {
        if (reason && reason == "backdropClick")
            return;
        setOpen(false);
    };

    const handleSubmit = async () => {
        if (!title) {
            toast.error("Tiêu đề không được để trống!")
            return;
        }
        const res = await sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/empty`,
            method: "POST",
            body: { title, isPublic },
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            }
        })
        if (res.data) {
            toast.success("Tạo mới playlist thành công!");
            setIsPublic(true);
            setTitle("");
            setOpen(false);

            await sendRequest<IBackendRes<any>>({
                url: `/api/revalidate`,
                method: "POST",
                queryParams: {
                    tag: "playlist-by-user",
                    secret: "justArandomString"
                }
            })
            router.refresh();
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.5)',
                    }
                }}
            >
                Tạo Playlist
            </Button>
            
            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth={"sm"} 
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
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tạo playlist mới
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                        Tạo playlist để tổ chức bài hát yêu thích của bạn
                    </Typography>
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: "flex", gap: "30px", flexDirection: "column", width: "100%" }}>
                        <TextField
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            label="Tên playlist"
                            variant="outlined"
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
                        
                        <FormGroup>
                            <FormControlLabel 
                                control={
                                    <Switch
                                        checked={isPublic}
                                        onChange={(event) => setIsPublic(event.target.checked)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#667eea',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#667eea',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {isPublic === true ? "Công khai" : "Riêng tư"}
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setOpen(false)}
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
                        onClick={handleSubmit}
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
                        Tạo Playlist
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default NewPlaylist;