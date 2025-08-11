'use client'

import { usePlayContext } from '@/utils/hooks/usePlayContext';
import WaveTrack from './wave.track';

interface IProps {
    track: ITrackTop;
    comments: ITrackComment[];
}

const TrackDetailWrapper = (props: IProps) => {
    const { track, comments } = props;

    // Use play context for track detail (same category)
    const { setContextAndLoadQueue } = usePlayContext();

    return <WaveTrack track={track} comments={comments} />;
};

export default TrackDetailWrapper;
