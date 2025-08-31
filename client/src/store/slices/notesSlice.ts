import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { NotesState, Note, CreateNoteDto, UpdateNoteDto } from '../../types';
import { notesAPI } from '../../services/api';

const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null,
  currentNote: null,
};

// Async thunks
export const fetchNotes = createAsyncThunk<Note[], void>(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNotes();
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk<Note, CreateNoteDto>(
  'notes/createNote',
  async (noteData: CreateNoteDto, { rejectWithValue }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk<Note, { id: string } & UpdateNoteDto>(
  'notes/updateNote',
  async ({ id, ...noteData }: { id: string } & UpdateNoteDto, { rejectWithValue }) => {
    try {
      const response = await notesAPI.updateNote(id, noteData);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      await notesAPI.deleteNote(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.currentNote = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.unshift(action.payload);
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?.id === action.payload.id) {
          state.currentNote = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.notes = state.notes.filter(note => note.id !== action.payload);
        if (state.currentNote?.id === action.payload) {
          state.currentNote = null;
        }
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentNote, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;
