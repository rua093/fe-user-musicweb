import React from 'react';
import Image from 'next/image';
import { Box, Typography, IconButton, Card, CardContent, CardActions, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import Link from 'next/link';

interface IProps {
  track: ITrackTop;
  onPlay?: (track: ITrackTop) => void;
}

const TrackCard: React.FC<IProps> = ({ track, onPlay }) => {
  return (
    <Card
      sx={{
        width: 220,
        borderRadius: 3,
        boxShadow: 3,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.03)',
          boxShadow: 8,
        },
        position: 'relative',
        bgcolor: '#181818',
        color: '#fff',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/${track.imgUrl}`}
          alt={track.title}
          fill
          style={{ objectFit: 'cover', filter: 'brightness(0.95)' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'rgba(0,0,0,0.25)',
            '&:hover': {
              opacity: 1,
            },
            cursor: 'pointer',
          }}
          className="trackcard-play-overlay"
          onClick={() => onPlay && onPlay(track)}
        >
          <IconButton sx={{ bgcolor: '#fff', color: '#181818', p: 2, '&:hover': { bgcolor: '#ff5500', color: '#fff' } }}>
            <PlayArrowIcon sx={{ fontSize: 36 }} />
          </IconButton>
        </Box>
      </Box>
      <CardContent sx={{ pb: 0 }}>
        <Tooltip title={track.title} arrow>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {track.title}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="#bbb" noWrap>
          {track.uploader?.name || track.uploader?.email || 'Unknown Artist'}
        </Typography>
        <Typography variant="body2" color="#aaa" sx={{ mt: 0.5, minHeight: 32 }}>
          {track.description?.slice(0, 40) || ''}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HeadphonesIcon sx={{ fontSize: 18, color: '#ff9800' }} />
          <Typography variant="caption" color="#fff">
            {track.countPlay || 0}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FavoriteIcon sx={{ fontSize: 18, color: '#ff1744' }} />
          <Typography variant="caption" color="#fff">
            {track.countLike || 0}
          </Typography>
        </Box>
      </CardActions>
      <Link
        href={`/track/${track.title.replace(/\s+/g, '-')}-${track._id}.html?audio=${track.trackUrl}`}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        aria-label={track.title}
      />
    </Card>
  );
};

export default TrackCard;
