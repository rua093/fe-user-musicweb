'use client'

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentTrack, setPlaying } from "@/store/slices/trackSlice";
import { convertSlugUrl } from "@/utils/api";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import IconButton from '@mui/material/IconButton';

interface IProps {
    track: IShareTrack;
}
const CurrentTrack = (props: IProps) => {
    const { track } = props;

    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying } = useAppSelector(state => state.track);

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
                        onClick={(e) => {
                            dispatch(setCurrentTrack({ ...track, isPlaying: true, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'playlist' }));
                            dispatch(setPlaying(true));
                        }}
                    >
                        <PlayArrowIcon sx={{ height: 25, width: 25 }} />
                    </IconButton>
                }

                {track._id === currentTrack._id && isPlaying === true
                    &&
                    <IconButton aria-label="play/pause"
                        onClick={(e) => {
                            dispatch(setCurrentTrack({ ...track, isPlaying: false, currentTime: 0, isSeeking: false, autoPlay: false, _source: 'playlist' }));
                            dispatch(setPlaying(false));
                        }}
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