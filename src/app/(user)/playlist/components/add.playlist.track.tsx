'use client'
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useToast } from '@/utils/toast';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface IProps {
    playlists: IPlaylist[];
    tracks: ITrackTop[];
}

const AddPlaylistTrack = (props: IProps) => {
    const { playlists, tracks } = props;

    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const [playlistId, setPlaylistId] = useState('');
    const [tracksId, setTracksId] = useState<string[]>([]);

    const theme = useTheme();

    const handleClose = (event: any, reason: any) => {
        if (reason && reason == "backdropClick")
            return;
        setOpen(false);
        setPlaylistId("");
        setTracksId([]);
    };

    const getStyles = (name: string, tracksId: readonly string[], theme: Theme) => {
        return {
            fontWeight:
                tracksId.indexOf(name) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }

    const handleSubmit = async () => {
        if (!playlistId) {
            toast.error("Vui lòng chọn playlist!")
            return;
        }
        if (!tracksId.length) {
            toast.error("Vui lòng chọn tracks!")
            return;
        }

        const chosenPlaylist = playlists.find(i => i._id === playlistId);
        let tracks = tracksId?.map(item => item?.split("###")?.[1]);

        //remove null/undefined/empty
        tracks = tracks?.filter((item) => item);
        if (chosenPlaylist) {
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists`,
                method: "PATCH",
                body: {
                    "id": chosenPlaylist._id,
                    "title": chosenPlaylist.title,
                    "isPublic": chosenPlaylist.isPublic,
                    "tracks": tracks
                },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                }
            })

            if (res.data) {
                toast.success("Thêm track vào playlist thành công!");
                await sendRequest<IBackendRes<any>>({
                    url: `/api/revalidate`,
                    method: "POST",
                    queryParams: {
                        tag: "playlist-by-user",
                        secret: "justArandomString"
                    }
                })
                handleClose("", "");
                router.refresh();
            } else {
                toast.error(res.message)
            }
        }
    }

    return (
        <>
            <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                onClick={() => setOpen(true)}
                sx={{
                    background: 'rgba(255,255,255,0.1)',
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
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.5)',
                    }
                }}
            >
                Thêm Track
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
                        Thêm track vào playlist
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                        Chọn playlist và track bạn muốn thêm
                    </Typography>
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Box width={"100%"} sx={{ display: "flex", gap: "30px", flexDirection: "column" }}>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Chọn playlist
                            </InputLabel>
                            <Select
                                value={playlistId}
                                label="Chọn playlist"
                                onChange={(e) => setPlaylistId(e.target.value)}
                                sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#667eea',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            >
                                {playlists.map(item => {
                                    return (
                                        <MenuItem 
                                            key={item._id} 
                                            value={item._id}
                                            sx={{ color: 'white' }}
                                        >
                                            {item.title}
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        
                        <FormControl sx={{ width: "100%" }}>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Chọn tracks
                            </InputLabel>
                            <Select
                                multiple
                                value={tracksId}
                                onChange={(e) => {
                                    setTracksId(e.target.value as any)
                                }}
                                input={<OutlinedInput 
                                    label="Chọn tracks" 
                                    sx={{
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                        },
                                    }}
                                />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map(value => {
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={value?.split("###")?.[0]}
                                                    sx={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: 'rgba(255,255,255,0.7)',
                                                        }
                                                    }}
                                                />
                                            )
                                        })}
                                    </Box>
                                )}
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            >
                                {tracks.map((track) => {
                                    return (
                                        <MenuItem
                                            key={track._id}
                                            value={`${track.title}###${track._id}`}
                                            style={getStyles(`${track.title}###${track._id}`, tracksId, theme)}
                                            sx={{ color: 'white' }}
                                        >
                                            {track.title}
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => handleClose("", "")}
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
                        onClick={() => handleSubmit()}
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
                        Thêm Track
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default AddPlaylistTrack;