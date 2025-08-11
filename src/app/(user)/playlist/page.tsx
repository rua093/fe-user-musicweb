import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.options";
import NewPlaylist from "./components/new.playlist";
import AddPlaylistTrack from "./components/add.playlist.track";
import PlaylistTrackList from "./components/playlist.track.list";
import EditPlaylist from "./components/edit.playlist";
import DeletePlaylist from "./components/delete.playlist";
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Playlist - MilkyWay',
    description: 'Quản lý playlist yêu thích trong vũ trụ âm nhạc MilkyWay',
}

// Force dynamic rendering để luôn fetch fresh data
export const dynamic = 'force-dynamic';

const PlaylistPage = async () => {
    const session = await getServerSession(authOptions);

    const res = await sendRequest<IBackendRes<IModelPaginate<IPlaylist>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/playlists/by-user`,
        method: "POST",
        queryParams: { current: 1, pageSize: 100 },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { 
                tags: ['playlist-by-user'],
                revalidate: 0 // Disable cache để luôn fetch fresh data
            }
        }
    })

    const res1 = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks`,
        method: "GET",
        queryParams: { current: 1, pageSize: 100 },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        }
    })

    const playlists = res?.data?.result ?? [];
    const tracks = res1?.data?.result ?? [];

    return (
        <Box sx={{ minHeight: '100vh', background: '#000' }}>
            {/* Header với theme vũ trụ */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
                    py: 3,
                    px: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
                            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
                        `,
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, position: 'relative', zIndex: 1 }}>
                        <Box>
                            <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                mb: 1,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <QueueMusicIcon sx={{ 
                                    color: '#43e97b', 
                                    fontSize: 28, 
                                    mr: 1.5,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }} />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 600,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Playlists
                                </Typography>
                            </Box>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '1rem',
                                    lineHeight: 1.5
                                }}
                            >
                                Quản lý playlist yêu thích trong vũ trụ âm nhạc MilkyWay
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <NewPlaylist />
                            <AddPlaylistTrack
                                playlists={playlists}
                                tracks={tracks}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Content */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {playlists.length === 0 ? (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            color: 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <Box sx={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '50%',
                            width: 80,
                            height: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <QueueMusicIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                        </Box>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                            Bạn chưa có playlist nào
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                            Tạo playlist đầu tiên để tổ chức âm nhạc yêu thích trong vũ trụ MilkyWay
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {playlists?.map((playlist, index) => {
                            return (
                                <Grid item xs={12} sm={6} md={4} key={playlist._id}>
                                    <PlaylistCard 
                                        playlist={playlist}
                                        index={index}
                                    />
                                </Grid>
                            )
                        })}
                    </Grid>
                )}
            </Container>
        </Box>
    )
}

// Playlist Card Component với theme vũ trụ
const PlaylistCard = ({ playlist, index }: any) => {
    const getCosmicGradient = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple nebula
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue galaxy
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink star
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green comet
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Magenta planet
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint cosmic
        ];
        return gradients[index % gradients.length];
    };

    return (
        <Card 
            sx={{ 
                background: '#0a0a0a',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.03)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }
            }}
        >
            {/* Header với gradient */}
            <Box
                sx={{
                    background: getCosmicGradient(index),
                    height: 120,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <IconButton
                    sx={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        '&:hover': {
                            background: 'rgba(255,255,255,0.3)',
                        }
                    }}
                >
                    <PlayArrowIcon />
                </IconButton>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            lineHeight: 1.2
                        }}
                    >
                        {playlist.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <EditPlaylist playlist={playlist} />
                        <DeletePlaylist playlist={playlist} />
                    </Box>
                </Box>

                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        mb: 1
                    }}
                >
                    {playlist.tracks?.length || 0} bài hát
                </Typography>



                {playlist.tracks && playlist.tracks.length > 0 && (
                    <Box 
                        sx={{ 
                            mt: 2,
                            maxHeight: 200,
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '2px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(255,255,255,0.3)',
                                borderRadius: '2px',
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.5)',
                                },
                            },
                        }}
                    >
                                                    <PlaylistTrackList tracks={playlist.tracks} playlistId={playlist._id} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default PlaylistPage;