import MainSlider from "@/components/main/main.slider";
import { Container, Box, Divider, Typography, Paper } from "@mui/material";
import { sendRequest } from "@/utils/api";
import type { Metadata } from 'next';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExploreIcon from '@mui/icons-material/Explore';

export const metadata: Metadata = {
  title: 'Trang Chủ | Milky Way',
  description: 'Khám phá vũ trụ âm nhạc với MilkyWay - Nơi âm nhạc gặp gỡ vũ trụ',
}

export default async function HomePage() {
  // Section 1: Top Play
  const topPlay = await sendRequest<IBackendRes<ITrackTop[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/top`,
    method: "POST",
    body: { sortType: "play", limit: 10 },
  })

  // Section 2: Top Like
  const topLike = await sendRequest<IBackendRes<ITrackTop[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/top`,
    method: "POST",
    body: { sortType: "like", limit: 10 },
  })

  // Section 3: Theo thể loại
  const chills = await sendRequest<IBackendRes<ITrackTop[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/top`,
    method: "POST",
    body: { category: "CHILL", limit: 10 },
  })
  const workouts = await sendRequest<IBackendRes<ITrackTop[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/top`,
    method: "POST",
    body: { category: "WORKOUT", limit: 10 },
  })
  const party = await sendRequest<IBackendRes<ITrackTop[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tracks/top`,
    method: "POST",
    body: { category: "PARTY", limit: 10 },
  })

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #475569 75%, #64748B 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Milkyway background stars effect */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 20px 30px, #60A5FA, transparent),
          radial-gradient(2px 2px at 40px 70px, #8B5CF6, transparent),
          radial-gradient(1px 1px at 90px 40px, #3B82F6, transparent),
          radial-gradient(1px 1px at 130px 80px, #60A5FA, transparent),
          radial-gradient(2px 2px at 160px 30px, #8B5CF6, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <Container maxWidth="lg" sx={{ 
        position: 'relative', 
        zIndex: 1,
        pt: 6, 
        pb: 8 
      }}>
        {/* Hero Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 8,
          p: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            gap: 1
          }}>
            <StarIcon sx={{ color: '#60A5FA', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={900} sx={{
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>
              Chào mừng đến với MilkyWay
            </Typography>
            <StarIcon sx={{ color: '#60A5FA', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 3,
            fontStyle: 'italic'
          }}>
            Khám phá vũ trụ âm nhạc vô tận
          </Typography>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}>
            <MusicNoteIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Nơi âm nhạc gặp gỡ vũ trụ
            </Typography>
            <MusicNoteIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
          </Box>
        </Box>

      {/* Section 1: Top Play */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          p: 4,
          mb: 6,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.4)'
          }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
            }}>
              <TrendingUpIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{
              color: '#fff',
              background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Những bài hát có lượt nghe cao nhất
            </Typography>
          </Box>
        <MainSlider
          title={"Top lượt nghe"}
          data={topPlay?.data ?? []}
        />
        </Paper>

        {/* Section 2: Top Like */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          p: 4,
          mb: 6,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.4)'
          }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #EC4899, #DB2777)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)'
            }}>
              <FavoriteIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{
              color: '#fff',
              background: 'linear-gradient(135deg, #EC4899, #DB2777)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Những bài hát có lượt yêu thích nhiều nhất
            </Typography>
      </Box>
        <MainSlider
          title={"Top yêu thích"}
          data={topLike?.data ?? []}
        />
        </Paper>

        {/* Section 3: Theo thể loại */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          p: 4,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.4)'
          }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
            }}>
              <ExploreIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{
              color: '#fff',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Khám phá theo thể loại
            </Typography>
      </Box>
          
          <Box sx={{ mb: 4 }}>
        <MainSlider
          title={"Chill"}
          data={chills?.data ?? []}
        />
          </Box>
          
          <Box sx={{ mb: 4 }}>
        <MainSlider
          title={"Workout"}
          data={workouts?.data ?? []}
        />
          </Box>
          
          <Box>
        <MainSlider
          title={"Party"}
          data={party?.data ?? []}
        />
      </Box>
        </Paper>
    </Container>
    </Box>
  );
}
