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
  isLiked: boolean;
  playContext: {
    type: 'playlist' | 'like' | 'category' | 'detail' | null;
    id?: string; // playlist ID, category name, etc.
  };
  queue: {
    tracks: IShareTrack[];
    currentIndex: number;
    source: 'playlist' | 'like' | 'category' | 'search' | null;
    sourceId?: string; // playlist ID, category name, etc.
    originalOrder: IShareTrack[]; // Store original order for shuffle
  };
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  audioControl?: {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
  };
  loading: boolean;
  error: string | null;
  playlistModified: boolean; // Track playlist modifications
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
  isLiked: false,
  playContext: {
    type: null,
    id: undefined,
  },
  queue: {
    tracks: [],
    currentIndex: -1,
    source: null,
    sourceId: undefined,
    originalOrder: [],
  },
  shuffle: false,
  repeat: 'none',
  audioControl: undefined,
  loading: false,
  error: null,
  playlistModified: false,
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
    setLiked: (state, action: PayloadAction<boolean>) => {
      state.isLiked = action.payload;
    },
    updateCountLike: (state, action: PayloadAction<number>) => {
      if (state.currentTrack._id) {
        state.currentTrack.countLike = action.payload;
      }
    },
    setPlayContext: (state, action: PayloadAction<{
      type: 'playlist' | 'like' | 'category' | 'detail';
      id?: string;
    }>) => {
      state.playContext.type = action.payload.type;
      state.playContext.id = action.payload.id;
    },
    setShuffle: (state, action: PayloadAction<boolean>) => {
      state.shuffle = action.payload;
      if (action.payload) {
        // Store original order and shuffle tracks
        state.queue.originalOrder = [...state.queue.tracks];
        const shuffled = [...state.queue.tracks];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        state.queue.tracks = shuffled;
        // Update current index to match shuffled position
        const currentTrackId = state.currentTrack._id;
        const newIndex = shuffled.findIndex(t => t._id === currentTrackId);
        if (newIndex !== -1) {
          state.queue.currentIndex = newIndex;
        }
      } else {
        // Restore original order
        if (state.queue.originalOrder.length > 0) {
          const currentTrackId = state.currentTrack._id;
          state.queue.tracks = [...state.queue.originalOrder];
          const newIndex = state.queue.originalOrder.findIndex(t => t._id === currentTrackId);
          if (newIndex !== -1) {
            state.queue.currentIndex = newIndex;
          }
        }
      }
    },
    setRepeat: (state, action: PayloadAction<'none' | 'one' | 'all'>) => {
      state.repeat = action.payload;
    },
    setQueue: (state, action: PayloadAction<{
      tracks: IShareTrack[];
      source: 'playlist' | 'like' | 'category' | 'search';
      sourceId?: string;
    }>) => {
      state.queue.tracks = action.payload.tracks;
      state.queue.originalOrder = [...action.payload.tracks]; // Store original order
      state.queue.source = action.payload.source;
      state.queue.sourceId = action.payload.sourceId;
      state.queue.currentIndex = -1;
    },
    setCurrentTrackIndex: (state, action: PayloadAction<number>) => {
      state.queue.currentIndex = action.payload;
    },
    playNext: (state) => {
      if (state.queue.tracks.length > 0) {
        if (state.queue.currentIndex < state.queue.tracks.length - 1) {
          // Play next track
          state.queue.currentIndex += 1;
          const nextTrack = state.queue.tracks[state.queue.currentIndex];
          state.currentTrack = {
            ...nextTrack,
            isPlaying: true,
            currentTime: 0,
            isSeeking: false,
            autoPlay: true,
            _source: 'bar'
          };
          state.isPlaying = true;
          state.currentTime = 0;
          state.autoPlay = true;
        } else if (state.repeat === 'all') {
          // Repeat all: start from beginning
          state.queue.currentIndex = 0;
          const firstTrack = state.queue.tracks[0];
          state.currentTrack = {
            ...firstTrack,
            isPlaying: true,
            currentTime: 0,
            isSeeking: false,
            autoPlay: true,
            _source: 'bar'
          };
          state.isPlaying = true;
          state.currentTime = 0;
          state.autoPlay = true;
        } else if (state.repeat === 'one') {
          // Repeat one: restart current track
          state.currentTrack = {
            ...state.currentTrack,
            isPlaying: true,
            currentTime: 0,
            isSeeking: false,
            autoPlay: true,
            _source: 'bar'
          };
          state.isPlaying = true;
          state.currentTime = 0;
          state.autoPlay = true;
        }
        // If repeat === 'none' and at last track, do nothing (stop playing)
      }
    },
    playPrevious: (state) => {
      if (state.queue.tracks.length > 0 && state.queue.currentIndex > 0) {
        state.queue.currentIndex -= 1;
        state.currentTrack = state.queue.tracks[state.queue.currentIndex];
        state.isPlaying = true;
        state.currentTime = 0;
        state.autoPlay = true;
      }
    },
    resetTrack: (state) => {
      state.currentTrack = initialState.currentTrack;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
      state.isSeeking = false;
      state.autoPlay = false;
      state.source = null;
      state.isLiked = false;
      state.playContext = initialState.playContext;
      state.queue = initialState.queue;
      state.shuffle = false;
      state.repeat = 'none';
      state.playlistModified = false;
    },
    setPlaylistModified: (state, action: PayloadAction<boolean>) => {
      state.playlistModified = action.payload;
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
  setLiked,
  updateCountLike,
  setPlayContext,
  setShuffle,
  setRepeat,
  setQueue,
  setCurrentTrackIndex,
  playNext,
  playPrevious,
  resetTrack,
  setPlaylistModified,
} = trackSlice.actions;

export default trackSlice.reducer;
