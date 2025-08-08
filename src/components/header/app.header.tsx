'use client'
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/MoreVert';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { fetchDefaultImages } from '@/utils/api';
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha('rgba(96, 165, 250, 0.1)', 0.8),
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    '&:hover': {
        backgroundColor: alpha('rgba(96, 165, 250, 0.15)', 0.9),
        border: '1px solid rgba(96, 165, 250, 0.4)',
        boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
    },
    marginLeft: 0,
    width: '100%',
    transition: 'all 0.3s ease',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#60A5FA',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: '#fff',
    fontSize: 16,
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.5, 1, 1.5, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
        },
        [theme.breakpoints.up('md')]: {
            width: '400px',
        },
    },
}));

export default function AppHeader() {
    const { data: session } = useSession();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };
    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };
    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            id={menuId}
            keepMounted
            open={isMenuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
                sx: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: 2,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }
            }}
        >
            <MenuItem sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Link href={`/profile/${session?.user?._id}`} style={{ color: "unset", textDecoration: "unset" }}>
                    Profile
                </Link>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); signOut(); }} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                Logout
            </MenuItem>
        </Menu>
    );
    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            PaperProps={{
                sx: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: 2,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }
            }}
        >
            <MenuItem onClick={() => { router.push('/'); handleMobileMenuClose(); }} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Tooltip title="Trang chủ" arrow>
                  <IconButton size="large" color="inherit" sx={{ borderRadius: '50%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)', transform: 'scale(1.1)' } }}><HomeIcon sx={{ color: '#60A5FA' }} /></IconButton>
                </Tooltip>
                <p style={{ color: '#fff' }}>Home</p>
            </MenuItem>
            <MenuItem onClick={() => { router.push('/playlist'); handleMobileMenuClose(); }} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Tooltip title="Playlist" arrow>
                  <IconButton size="large" color="inherit" sx={{ borderRadius: '50%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)', transform: 'scale(1.1)' } }}><LibraryMusicIcon sx={{ color: '#60A5FA' }} /></IconButton>
                </Tooltip>
                <p style={{ color: '#fff' }}>Playlists</p>
            </MenuItem>
            <MenuItem onClick={() => { router.push('/like'); handleMobileMenuClose(); }} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Tooltip title="Yêu thích" arrow>
                  <IconButton size="large" color="inherit" sx={{ borderRadius: '50%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)', transform: 'scale(1.1)' } }}><FavoriteIcon sx={{ color: '#60A5FA' }} /></IconButton>
                </Tooltip>
                <p style={{ color: '#fff' }}>Likes</p>
            </MenuItem>
            <MenuItem onClick={() => { router.push('/track/upload'); handleMobileMenuClose(); }} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Tooltip title="Tải lên" arrow>
                  <IconButton size="large" color="inherit" sx={{ borderRadius: '50%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)', transform: 'scale(1.1)' } }}><CloudUploadIcon sx={{ color: '#60A5FA' }} /></IconButton>
                </Tooltip>
                <p style={{ color: '#fff' }}>Upload</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen} sx={{ color: 'white', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}>
                <Tooltip title="Tài khoản" arrow>
                  <IconButton size="large" color="inherit" sx={{ borderRadius: '50%', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)', transform: 'scale(1.1)' } }}>
                      {session ? (
                          <Avatar src={fetchDefaultImages(session.user.type)} alt='avatar' sx={{ width: 32, height: 32 }} />
                      ) : (
                          <AccountCircle sx={{ color: '#60A5FA' }} />
                      )}
                  </IconButton>
                </Tooltip>
                <p style={{ color: '#fff' }}>Profile</p>
            </MenuItem>
        </Menu>
    );
    const handleRedirectHome = () => {
        router.push("/")
    }
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    color: '#fff',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    zIndex: 1201,
                }}
            >
                <Container maxWidth="lg" disableGutters>
                    <Toolbar sx={{ minHeight: 70, px: { xs: 1, sm: 2 } }}>
                        {/* Logo */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mr: 3, 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            }
                        }} onClick={handleRedirectHome}>
                            <Box sx={{ 
                                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                                borderRadius: '50%', 
                                width: 44, 
                                height: 44, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                mr: 2,
                                boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -2,
                                    left: -2,
                                    right: -2,
                                    bottom: -2,
                                    background: 'linear-gradient(135deg, #60A5FA, #8B5CF6, #3B82F6, #60A5FA)',
                                    borderRadius: '50%',
                                    zIndex: -1,
                                    animation: 'spin 3s linear infinite',
                                }
                            }}>
                                <MusicNoteIcon sx={{ color: '#fff', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={900} sx={{ 
                                    letterSpacing: 1.5, 
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    MilkyWay
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    letterSpacing: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: '0.7rem'
                                }}>
                                    <StarIcon sx={{ fontSize: 10, color: '#60A5FA' }} />
                                    Music Universe
                                    <StarIcon sx={{ fontSize: 10, color: '#60A5FA' }} />
                                </Typography>
                            </Box>
                        </Box>
                        {/* Search bar ở giữa */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                            <Search sx={{ width: { xs: '100%', sm: 400, md: 500 } }}>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    onKeyDown={(e: any) => {
                                        if (e.key === "Enter") {
                                            if (e?.target?.value)
                                                router.push(`/search?q=${e?.target?.value}`)
                                        }
                                    }}
                                />
                            </Search>
                        </Box>
                        {/* Menu điều hướng bên phải */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 3 }}>
                            <Tooltip title="Trang chủ" arrow>
                              <IconButton 
                                color="inherit" 
                                onClick={() => router.push('/')} 
                                sx={{ 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(96, 165, 250, 0.1)',
                                    border: '1px solid rgba(96, 165, 250, 0.2)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(96, 165, 250, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
                                    } 
                                }}
                              >
                                  <HomeIcon sx={{ color: '#60A5FA' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Playlist" arrow>
                              <IconButton 
                                color="inherit" 
                                onClick={() => router.push('/playlist')} 
                                sx={{ 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(139, 92, 246, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                                    } 
                                }}
                              >
                                  <LibraryMusicIcon sx={{ color: '#8B5CF6' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Yêu thích" arrow>
                              <IconButton 
                                color="inherit" 
                                onClick={() => router.push('/like')} 
                                sx={{ 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(236, 72, 153, 0.1)',
                                    border: '1px solid rgba(236, 72, 153, 0.2)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(236, 72, 153, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)'
                                    } 
                                }}
                              >
                                  <FavoriteIcon sx={{ color: '#EC4899' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Tải lên" arrow>
                              <IconButton 
                                color="inherit" 
                                onClick={() => router.push('/track/upload')} 
                                sx={{ 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(34, 197, 94, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
                                    } 
                                }}
                              >
                                  <CloudUploadIcon sx={{ color: '#22C55E' }} />
                              </IconButton>
                            </Tooltip>
                            {session ? (
                              <Tooltip title="Tài khoản" arrow>
                                <IconButton 
                                  onClick={handleProfileMenuOpen} 
                                  sx={{ 
                                    ml: 1, 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '2px solid rgba(96, 165, 250, 0.3)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
                                    } 
                                  }}
                                >
                                    <Avatar src={fetchDefaultImages(session.user.type)} alt='avatar' sx={{ width: 32, height: 32 }} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Tài khoản" arrow>
                                <IconButton 
                                  onClick={() => signIn()} 
                                  sx={{ 
                                    ml: 1, 
                                    borderRadius: '50%', 
                                    transition: 'all 0.3s ease', 
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '2px solid rgba(96, 165, 250, 0.3)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
                                    } 
                                  }}
                                >
                                    <AccountCircle sx={{ fontSize: 32, color: '#60A5FA' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                        </Box>
                        {/* Mobile menu */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
                            <IconButton
                                size="large"
                                aria-label="show more"
                                aria-controls={mobileMenuId}
                                aria-haspopup="true"
                                onClick={handleMobileMenuOpen}
                                color="inherit"
                                sx={{
                                    background: 'rgba(96, 165, 250, 0.1)',
                                    border: '1px solid rgba(96, 165, 250, 0.2)',
                                    '&:hover': {
                                        bgcolor: 'rgba(96, 165, 250, 0.2)',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <MoreIcon sx={{ color: '#60A5FA' }} />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
        </Box>
    );
}