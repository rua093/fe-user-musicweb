import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ITrackState {
  currentTrack: IShareTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  autoPlay: boolean;
  source: 'wave' | 'bar' | 'profile' | 'like' | 'playlist' | null;
  volume: number;
  audioControl?: {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
  };
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ITrackState = {
  currentTrack: {
    _id: '',
    title: '',
    description: '',
    category: '',
    imgUrl: '',
    trackUrl: '',
    duration: 0,
    countLike: 0,
    countPlay: 0,
    uploader: {
      _id: '',
      email: '',
      name: '',
      role: '',
      type: '',
    },
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
    isPlaying: false,
    currentTime: 0,
    isSeeking: false,
    autoPlay: false,
    _source: undefined,
  },
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isSeeking: false,
  autoPlay: false,
  source: null,
  volume: 50,
  audioControl: undefined,
  loading: false,
  error: null,
};

// Async thunks
export const setCurrentTrack = createAsyncThunk(
  'track/setCurrentTrack',
  async (track: IShareTrack) => {
    return track;
  }
);

export const playTrack = createAsyncThunk(
  'track/playTrack',
  async (_, { getState, dispatch }) => {
    const state = getState() as { track: ITrackState };
    const { audioControl } = state.track;
    
    if (audioControl?.play) {
      audioControl.play();
    }
    
    return true;
  }
);

export const pauseTrack = createAsyncThunk(
  'track/pauseTrack',
  async (_, { getState, dispatch }) => {
    const state = getState() as { track: ITrackState };
    const { audioControl } = state.track;
    
    if (audioControl?.pause) {
      audioControl.pause();
    }
    
    return false;
  }
);

export const seekTrack = createAsyncThunk(
  'track/seekTrack',
  async (time: number, { getState, dispatch }) => {
    const state = getState() as { track: ITrackState };
    const { audioControl } = state.track;
    
    // Set seeking state before seeking
    dispatch(setSeeking(true));
    
    if (audioControl?.seek) {
      audioControl.seek(time);
    }
    
    return time;
  }
);

// Slice
const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setAudioControl: (state, action: PayloadAction<ITrackState['audioControl']>) => {
      state.audioControl = action.payload;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack.isPlaying = action.payload;
      }
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack.currentTime = action.payload;
      }
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack.duration = action.payload;
      }
    },
    setSeeking: (state, action: PayloadAction<boolean>) => {
      state.isSeeking = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack.isSeeking = action.payload;
      }
    },
    setAutoPlay: (state, action: PayloadAction<boolean>) => {
      state.autoPlay = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack.autoPlay = action.payload;
      }
    },
    setSource: (state, action: PayloadAction<'wave' | 'bar' | 'profile' | 'like' | 'playlist' | null>) => {
      state.source = action.payload;
      if (state.currentTrack._id) {
        state.currentTrack._source = action.payload || undefined;
      }
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    resetTrack: (state) => {
      state.currentTrack = initialState.currentTrack;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
      state.isSeeking = false;
      state.autoPlay = false;
      state.source = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setCurrentTrack.fulfilled, (state, action) => {
        state.currentTrack = action.payload;
        state.isPlaying = action.payload.isPlaying ?? false;
        state.currentTime = action.payload.currentTime ?? 0;
        state.duration = action.payload.duration ?? 0;
        state.isSeeking = action.payload.isSeeking ?? false;
        state.autoPlay = action.payload.autoPlay ?? false;
        state.source = action.payload._source || null;
        state.loading = false;
        state.error = null;
      })
      .addCase(playTrack.fulfilled, (state) => {
        state.isPlaying = true;
        if (state.currentTrack._id) {
          state.currentTrack.isPlaying = true;
        }
        state.source = 'bar';
        state.loading = false;
      })
      .addCase(pauseTrack.fulfilled, (state) => {
        state.isPlaying = false;
        if (state.currentTrack._id) {
          state.currentTrack.isPlaying = false;
        }
        state.source = 'bar';
        state.loading = false;
      })
      .addCase(seekTrack.fulfilled, (state, action) => {
        state.currentTime = action.payload;
        if (state.currentTrack._id) {
          state.currentTrack.currentTime = action.payload;
        }
        // Reset seeking state after seek completes
        state.isSeeking = false;
        if (state.currentTrack._id) {
          state.currentTrack.isSeeking = false;
        }
        state.source = 'bar';
        state.loading = false;
      });
  },
});

export const {
  setAudioControl,
  setPlaying,
  setCurrentTime,
  setDuration,
  setSeeking,
  setAutoPlay,
  setSource,
  setVolume,
  resetTrack,
} = trackSlice.actions;

export default trackSlice.reducer;
