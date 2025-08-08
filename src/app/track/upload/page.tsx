import UploadTabs from "@/components/track/upload.tabs";
import { Container, Box, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Upload Track - MilkyWay',
    description: 'Chia sẻ âm nhạc của bạn với vũ trụ âm nhạc MilkyWay',
}

const UploadPage = () => {
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
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
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
                            <CloudUploadIcon sx={{ 
                                color: '#4facfe', 
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
                                Upload Track
                            </Typography>
                        </Box>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '1rem',
                                maxWidth: 500,
                                mx: 'auto',
                                lineHeight: 1.5
                            }}
                        >
                            Chia sẻ âm nhạc của bạn với vũ trụ âm nhạc MilkyWay
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Content */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden'
                }}>
                    <UploadTabs />
                </Box>
            </Container>
        </Box>
    )
}

export default UploadPage;