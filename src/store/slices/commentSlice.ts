import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ICommentState {
  comments: ITrackComment[];
  currentTrackComments: ITrackComment[];
  loading: boolean;
  error: string | null;
}

const initialState: ICommentState = {
  comments: [],
  currentTrackComments: [],
  loading: false,
  error: null,
};

export const setComments = createAsyncThunk(
  'comment/setComments',
  async (comments: ITrackComment[]) => {
    return comments;
  }
);

export const setCurrentTrackComments = createAsyncThunk(
  'comment/setCurrentTrackComments',
  async (comments: ITrackComment[]) => {
    return comments;
  }
);

export const addComment = createAsyncThunk(
  'comment/addComment',
  async (comment: ITrackComment, { getState }) => {
    const state = getState() as { comment: ICommentState };
    const updatedComments = [...state.comment.comments, comment];
    return updatedComments;
  }
);

const commentSlice = createSlice({
  name: 'comment',
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
      .addCase(setComments.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(setCurrentTrackComments.fulfilled, (state, action) => {
        state.currentTrackComments = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setLoading, setError, clearError } = commentSlice.actions;
export default commentSlice.reducer;
