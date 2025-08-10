'use client'

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTrack, setPlaying } from "@/store/slices/trackSlice";
import { Box, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { convertSlugUrl } from "@/utils/api";
import Link from "next/link";

interface IProps {
    track: IShareTrack;
}
const CurrentTrack = (props: IProps) => {
    const { track } = props;

    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, audioControl } = useAppSelector(state => state.track);

    const handlePlay = () => {
        dispatch(setCurrentTrack({ ...track, isPlaying: true, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'playlist' }));
        dispatch(setPlaying(true));
        // Sử dụng audioControl để phát audio
        audioControl?.play && audioControl.play();
    };

    const handlePause = () => {
        dispatch(setCurrentTrack({ ...track, isPlaying: false, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'playlist' }));
        dispatch(setPlaying(false));
        // Sử dụng audioControl để pause audio
        audioControl?.pause && audioControl.pause();
    };

    return (
        <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <Typography sx={{ py: 2 }}>
                <Link
                    style={{ textDecoration: "none", color: "unset" }}
                    href={`/track/${convertSlugUrl(track.title)}-${track._id}.html?audio=${track.trackUrl}`}
                >
                    {track.title}
                </Link>
            </Typography>

            <Box sx={{ display: "flex", "alignItems": "center" }}>
                {
                    (track._id !== currentTrack._id ||
                        track._id === currentTrack._id && !isPlaying
                    )
                    &&
                    <IconButton aria-label="play/pause"
                        onClick={handlePlay}
                    >
                        <PlayArrowIcon sx={{ height: 25, width: 25 }} />
                    </IconButton>
                }

                {track._id === currentTrack._id && isPlaying === true
                    &&
                    <IconButton aria-label="play/pause"
                        onClick={handlePause}
                    >
                        <PauseIcon sx={{ height: 25, width: 25 }}
                        />
                    </IconButton>
                }
            </Box>
        </Box>
    )
}

export default CurrentTrack;