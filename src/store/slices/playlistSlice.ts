import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface IPlaylistState {
  playlists: IPlaylist[];
  currentPlaylist: IPlaylist | null;
  loading: boolean;
  error: string | null;
}

const initialState: IPlaylistState = {
  playlists: [],
  currentPlaylist: null,
  loading: false,
  error: null,
};

export const setPlaylists = createAsyncThunk(
  'playlist/setPlaylists',
  async (playlists: IPlaylist[]) => {
    return playlists;
  }
);

export const setCurrentPlaylist = createAsyncThunk(
  'playlist/setCurrentPlaylist',
  async (playlist: IPlaylist | null) => {
    return playlist;
  }
);

export const addTrackToPlaylist = createAsyncThunk(
  'playlist/addTrackToPlaylist',
  async ({ playlistId, track }: { playlistId: string; track: IShareTrack }, { getState }) => {
    const state = getState() as { playlist: IPlaylistState };
    const playlist = state.playlist.playlists.find(p => p._id === playlistId);
    
    if (playlist) {
      const updatedPlaylist = {
        ...playlist,
        tracks: [...playlist.tracks, track]
      };
      return updatedPlaylist;
    }
    
    return null;
  }
);

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setPlaylists.fulfilled, (state, action) => {
        state.playlists = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(setCurrentPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(addTrackToPlaylist.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.playlists.findIndex(p => p._id === action.payload!._id);
          if (index !== -1) {
            state.playlists[index] = action.payload;
          }
          if (state.currentPlaylist?._id === action.payload._id) {
            state.currentPlaylist = action.payload;
          }
        }
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setLoading, setError, clearError } = playlistSlice.actions;
export default playlistSlice.reducer;
