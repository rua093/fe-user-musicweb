'use client'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Settings } from "react-slick";
import { Box, Typography, useTheme, useMediaQuery, IconButton } from "@mui/material";
import Button from "@mui/material/Button/Button";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import TrackCard from "@/components/track/TrackCard";
import StarIcon from '@mui/icons-material/Star';

interface IProps {
    data: ITrackTop[];
    title: string;
}

const MainSlider = (props: IProps) => {
    const { data, title } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const NextArrow = (props: any) => {
        return (
            <IconButton
                onClick={props.onClick}
                sx={{
                    position: "absolute",
                    right: -20,
                    top: "40%",
                    zIndex: 2,
                    width: 44,
                    height: 44,
                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    color: '#fff',
                    boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)',
                    border: '2px solid rgba(96, 165, 250, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 35px rgba(96, 165, 250, 0.6)'
                    },
                    transition: 'all 0.3s ease',
                    '@media (max-width: 768px)': {
                        right: -10,
                        width: 36,
                        height: 36,
                    }
                }}
            >
                <ChevronRightIcon />
            </IconButton>
        )
    }

    const PrevArrow = (props: any) => {
        return (
            <IconButton
                onClick={props.onClick}
                sx={{
                    position: "absolute",
                    left: -20,
                    top: "40%",
                    zIndex: 2,
                    width: 44,
                    height: 44,
                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    color: '#fff',
                    boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)',
                    border: '2px solid rgba(96, 165, 250, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 35px rgba(96, 165, 250, 0.6)'
                    },
                    transition: 'all 0.3s ease',
                    '@media (max-width: 768px)': {
                        left: -10,
                        width: 36,
                        height: 36,
                    }
                }}
            >
                <ChevronLeftIcon />
            </IconButton>
        )
    }

    const settings: Settings = {
        infinite: true,
        speed: 500,
        slidesToShow: isMobile ? 1 : 4,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <Box sx={{
            width: '100%',
            px: { xs: 0, sm: 2, md: 4 },
            mb: 2,
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3
            }}>
                <StarIcon sx={{ 
                    color: '#60A5FA', 
                    fontSize: 18,
                    animation: 'twinkle 2s ease-in-out infinite'
                }} />
                <Typography variant="h6" fontWeight={700} sx={{ 
                    color: '#fff',
                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {title}
                </Typography>
                <StarIcon sx={{ 
                    color: '#60A5FA', 
                    fontSize: 18,
                    animation: 'twinkle 2s ease-in-out infinite 1s'
                }} />
            </Box>
            <Box sx={{ 
                position: 'relative',
                '& .slick-slider': {
                    '& .slick-dots': {
                        bottom: -40,
                        '& li': {
                            '& button:before': {
                                color: 'rgba(96, 165, 250, 0.5)',
                                fontSize: '12px',
                            },
                            '&.slick-active button:before': {
                                color: '#60A5FA',
                            }
                        }
                    },
                    '& .slick-track': {
                        display: 'flex',
                        gap: 2,
                    },
                    '& .slick-slide': {
                        '& > div': {
                            padding: '0 8px',
                        }
                    }
                }
            }}>
                <Slider {...settings}>
                    {data.map(track => (
                        <Box key={track._id} sx={{ 
                            px: 1, 
                            py: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                            }
                        }}>
                            <TrackCard track={track} />
                        </Box>
                    ))}
                </Slider>
            </Box>
        </Box>
    );
}

export default MainSlider;