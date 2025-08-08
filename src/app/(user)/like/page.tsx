import type { Metadata } from 'next'
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { convertSlugUrl, sendRequest } from '@/utils/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.options';
import LikeFilterSection from './components/like.filter';

export const metadata: Metadata = {
    title: 'Bài hát yêu thích - MilkyWay',
    description: 'Khám phá những bài hát bạn đã yêu thích trong vũ trụ âm nhạc MilkyWay',
}

const LikePage = async () => {
    const session = await getServerSession(authOptions);


    const res = await sendRequest<IBackendRes<IModelPaginate<ITrackTop>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes`,
        method: "GET",
        queryParams: { current: 1, pageSize: 100 },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['liked-by-user'] }
        }
    })

    const likes = res?.data?.result ?? [];

    return (
        <Box sx={{ minHeight: '100vh', background: '#000' }}>
            {/* Header gọn gàng */}
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
                                <FavoriteIcon sx={{ 
                                    color: '#ff6b6b', 
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
                                    Bài hát yêu thích
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
                                Khám phá những bài hát bạn đã yêu thích trong vũ trụ âm nhạc MilkyWay
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                            <Typography variant="h3" sx={{ 
                                fontWeight: 700,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                mb: 0.5
                            }}>
                                {likes.length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                opacity: 0.8,
                                fontWeight: 500
                            }}>
                                Bài hát đã thích
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Content với Filter */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LikeFilterSection likes={likes} />
            </Container>
        </Box>
    )
}

export default LikePage;