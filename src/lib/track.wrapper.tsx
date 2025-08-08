'use client'

import { createContext, useContext, useState, useRef } from "react";



export const TrackContext = createContext<ITrackContext | null>(null);

export const TrackContextProvider = ({ children }: { children: React.ReactNode }) => {
    const initValue = {
        "_id": "",
        "title": "",
        "description": "",
        "category": "",
        "imgUrl": "",
        "trackUrl": "",
        "duration": 0,
        "countLike": 0,
        "countPlay": 0,
        "uploader": {
            "_id": "",
            "email": "",
            "name": "",
            "role": "",
            "type": "",
        },
        "isDeleted": false,
        "createdAt": "",
        "updatedAt": "",
        isPlaying: false,
        currentTime: 0,
    }
    const [currentTrack, setCurrentTrack] = useState<IShareTrack>(initValue);
    const waveControlRef = useRef<ITrackContext["waveControl"]>();
    const setWaveControl = (control: ITrackContext["waveControl"]) => {
        waveControlRef.current = control;
    };
    return (
        <TrackContext.Provider value={{ currentTrack, setCurrentTrack, waveControl: waveControlRef.current }}>
            {children}
        </TrackContext.Provider>
    )
};

export const useTrackContext = () => useContext(TrackContext);