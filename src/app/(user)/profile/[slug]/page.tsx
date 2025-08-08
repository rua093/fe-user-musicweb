import ProfileTracks from "@/components/header/profile.tracks";
import { sendRequest } from "@/utils/api";
import { Container, Grid, Box, Typography, Avatar, Chip, Divider } from "@mui/material";
import { Metadata } from "next";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.options';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const metadata: Metadata = {
    title: 'Profile - MilkyWay',
    description: 'Khám phá vũ trụ âm nhạc của bạn trong MilkyWay',
}

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
    const session = await getServerSession(authOptions);

    const tracks = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/users?current=1&pageSize=50`,
        method: "POST",
        body: { id: params.slug },
        nextOption: {
            next: { tags: ['track-by-profile'] }
        }
    })

    const data = tracks?.data?.result ?? [];

    // Tính toán stats
    const totalTracks = data.length;
    const totalPlays = data.reduce((sum, track) => sum + (track.countPlay || 0), 0);
    const totalLikes = data.reduce((sum, track) => sum + (track.countLike || 0), 0);
    const totalDuration = data.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return (
        <Box sx={{ minHeight: '100vh', background: '#000' }}>
            {/* Hero Section với Cosmic Theme */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
                    py: 6,
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 4, position: 'relative', zIndex: 1 }}>
                        {/* Avatar */}
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: -2,
                                        left: -2,
                                        right: -2,
                                        bottom: -2,
                                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                        borderRadius: '50%',
                                        zIndex: -1,
                                        opacity: 0.3
                                    }
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 60 }} />
                            </Avatar>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #000'
                                }}
                            >
                                <StarIcon sx={{ fontSize: 16, color: 'white' }} />
                            </Box>
                        </Box>

                        {/* User Info */}
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                mb: 2,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <MusicNoteIcon sx={{ 
                                    color: '#4ecdc4', 
                                    fontSize: 24, 
                                    mr: 1.5,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }} />
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 700,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {session?.user?.email || 'MilkyWay Artist'}
                                </Typography>
                            </Box>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6,
                                    mb: 3,
                                    maxWidth: 600
                                }}
                            >
                                Khám phá vũ trụ âm nhạc độc đáo của tôi trong MilkyWay. Mỗi track là một hành tinh âm nhạc với những giai điệu riêng biệt.
                            </Typography>

                            {/* Stats Grid */}
                            <Grid container spacing={3} sx={{ maxWidth: 600 }}>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            mb: 0.5
                                        }}>
                                            {totalTracks}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            opacity: 0.8,
                                            fontWeight: 500
                                        }}>
                                            Tracks
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            mb: 0.5
                                        }}>
                                            {totalPlays.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            opacity: 0.8,
                                            fontWeight: 500
                                        }}>
                                            Lượt nghe
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            mb: 0.5
                                        }}>
                                            {totalLikes.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            opacity: 0.8,
                                            fontWeight: 500
                                        }}>
                                            Lượt thích
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            mb: 0.5
                                        }}>
                                            {hours}h {minutes}m
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            opacity: 0.8,
                                            fontWeight: 500
                                        }}>
                                            Tổng thời gian
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Section Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                    }}>
                        <PlaylistPlayIcon sx={{ 
                            color: '#4ecdc4', 
                            fontSize: 32, 
                            mr: 2,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }} />
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            Tracks của tôi
                        </Typography>
                        <Chip 
                            label={`${totalTracks} tracks`}
                            sx={{ 
                                ml: 2,
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                '& .MuiChip-label': {
                                    fontWeight: 500
                                }
                            }}
                        />
                    </Box>
                    <Divider sx={{ 
                        background: 'rgba(255,255,255,0.1)',
                        height: 1
                    }} />
                </Box>

                {/* Tracks Grid */}
                {data.length === 0 ? (
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
                            <MusicNoteIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                        </Box>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Bạn chưa có track nào
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                            Bắt đầu tạo những track đầu tiên để chia sẻ âm nhạc của bạn với vũ trụ MilkyWay
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {data.map((item: ITrackTop, index: number) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                                <ProfileTracks data={item} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    )
}

export default ProfilePage;