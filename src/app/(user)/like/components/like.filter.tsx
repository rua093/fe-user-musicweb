'use client'

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LikeTrackCard from './like.track.card';

interface IProps {
    likes: ITrackTop[];
}

const LikeFilterSection = ({ likes }: IProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredLikes, setFilteredLikes] = useState(likes);

    // Filter và sort logic
    useEffect(() => {
        let filtered = likes.filter(track => 
            track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort logic
        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'plays':
                filtered.sort((a, b) => b.countPlay - a.countPlay);
                break;
            case 'likes':
                filtered.sort((a, b) => b.countLike - a.countLike);
                break;
            case 'recent':
            default:
                // Giữ nguyên thứ tự từ API (mới nhất trước)
                break;
        }

        setFilteredLikes(filtered);
    }, [likes, searchTerm, sortBy]);

    return (
        <>
            {/* Filter Controls */}
            <Box sx={{ 
                mb: 4, 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <TextField
                    placeholder="Tìm kiếm bài hát..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#ff6b6b',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255,255,255,0.5)',
                            opacity: 1,
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Sắp xếp theo
                    </InputLabel>
                    <Select
                        value={sortBy}
                        label="Sắp xếp theo"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{
                            color: 'white',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#ff6b6b',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'rgba(255,255,255,0.7)',
                            },
                        }}
                    >
                        <MenuItem value="recent" sx={{ color: 'white' }}>Mới nhất</MenuItem>
                        <MenuItem value="name" sx={{ color: 'white' }}>Tên bài hát</MenuItem>
                        <MenuItem value="plays" sx={{ color: 'white' }}>Lượt nghe</MenuItem>
                        <MenuItem value="likes" sx={{ color: 'white' }}>Lượt thích</MenuItem>
                    </Select>
                </FormControl>

                <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    ml: 'auto'
                }}>
                    {filteredLikes.length} bài hát
                </Typography>
            </Box>

            {/* Results */}
            {filteredLikes.length === 0 ? (
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        color: 'rgba(255,255,255,0.7)'
                    }}
                >
                    <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <FavoriteIcon sx={{ fontSize: 30, opacity: 0.5 }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                        {searchTerm ? 'Không tìm thấy bài hát phù hợp' : 'Bạn chưa có bài hát yêu thích nào'}
                    </Typography>
                    <Typography variant="body2" sx={{ maxWidth: 350, mx: 'auto', lineHeight: 1.5 }}>
                        {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Khám phá và thích những bài hát hay trong vũ trụ âm nhạc MilkyWay'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredLikes.map((track, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={track._id}>
                            <LikeTrackCard track={track} index={index} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
};

export default LikeFilterSection;
