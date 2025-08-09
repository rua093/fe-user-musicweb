import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface IUserState {
  currentUser: {
    _id: string;
    email: string;
    name: string;
    role: string;
    type: string;
    imgUrl?: string;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: IUserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const setCurrentUser = createAsyncThunk(
  'user/setCurrentUser',
  async (user: IUserState['currentUser']) => {
    return user;
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async () => {
    return null;
  }
);

const userSlice = createSlice({
  name: 'user',
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
      .addCase(setCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setLoading, setError, clearError } = userSlice.actions;
export default userSlice.reducer;
