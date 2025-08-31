import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchNotes, createNote, deleteNote, clearNotes, updateNote } from '../store/slices/notesSlice';
import { logout, clearAuth } from '../store/slices/authSlice';
import { setTheme, useSystemTheme } from '../store/slices/themeSlice';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Loader2,
  FileText,
  User,
  Pen,
  LogOut
} from 'lucide-react';
import type { CreateNoteDto } from '../types';
import Logo from '../components/Logo';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notes, isLoading, error } = useAppSelector((state) => state.notes);
  const { theme, isSystemTheme } = useTheme();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const noteData: CreateNoteDto = {
      title: newNoteTitle.trim(),
      content: newNoteContent.trim() || undefined,
    };

    try {
      await dispatch(createNote(noteData)).unwrap();
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowCreateForm(false);
      toast.success('Note created successfully!');
    } catch (err) {
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteNote(noteId)).unwrap();
        toast.success('Note deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete note');
      }
    }
  };

  // Open edit modal for a note
  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    setEditingNoteId(noteId);
    setEditingTitle(note.title);
    setEditingContent(note.content || '');
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId) return;

    try {
      await dispatch(updateNote({ id: editingNoteId, title: editingTitle.trim(), content: editingContent.trim() || undefined })).unwrap();
      setShowEditForm(false);
      setEditingNoteId(null);
      setEditingTitle('');
      setEditingContent('');
      toast.success('Note edited successfully!');
    } catch (err) {
      toast.error('Failed to edit note');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(clearNotes());
      dispatch(clearAuth());
      toast.success('Logged out successfully!');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const toggleComplete = async (noteId: string, current: boolean | undefined) => {
    // optimistic UI: flip immediately, call API, rollback on error
    setOptimisticCompleted((s) => ({ ...s, [noteId]: !current }));
    try {
      await dispatch(updateNote({ id: noteId, completed: !current })).unwrap();
      // server confirmed — remove optimistic override (the store will have the canonical value)
      setOptimisticCompleted((s) => {
        const copy = { ...s } as Record<string, boolean>;
        delete copy[noteId];
        return copy;
      });
      toast.success('Note updated');
    } catch (err) {
      // rollback
      setOptimisticCompleted((s) => ({ ...s, [noteId]: !!current }));
      toast.error('Failed to update note');
    }
  };

  // local optimistic map for immediate UI feedback
  const [optimisticCompleted, setOptimisticCompleted] = useState<Record<string, boolean>>({});

  const setThemeHandler = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      dispatch(useSystemTheme());
    } else {
      dispatch(setTheme(newTheme));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Logo className="text-primary-600" width={24} height={16} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Highway Delight</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setThemeHandler('light')}
                  className={`p-2 rounded-lg transition-colors ${(theme === 'light' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Sun size={16} />
                </button>

                <button
                  onClick={() => setThemeHandler('system')}
                  className={`p-2 rounded-lg transition-colors ${isSystemTheme ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Monitor size={16} />
                </button>

                <button
                  onClick={() => setThemeHandler('dark')}
                  className={`p-2 rounded-lg transition-colors ${(theme === 'dark' && !isSystemTheme) ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Moon size={16} />
                </button>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Sign Out
              </button>
              <LogOut className='text-primary-600 hover:text-primary-700 font-medium text-sm' />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.name || 'User'}!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user?.email?.replace(/(.{6}).*(@.*)/, '$1****$2') || 'xxxxxx@xxxx.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Create Note Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary w-full flex items-center justify-center animate-bounce-in"
        >
          <Plus className="mr-2" size={20} />
          Create Note
        </button>

        {/* Notes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400 dark:text-gray-600" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No notes yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Create your first note to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const isCompleted = optimisticCompleted[note.id] ?? !!note.completed;
                return (
                  <div key={note.id} className="note-card animate-slide-up">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleComplete(note.id, note.completed)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <h4 className={`font-medium truncate ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {note.title}
                          </h4>
                        </div>
                        {note.content && (
                          <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                            {note.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Pen size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-6 animate-bounce-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Note
            </h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content (Optional)
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="input-field h-32 resize-none"
                  placeholder="Enter note content..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Creating...
                    </>
                  ) : (
                    'Create Note'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-6 animate-bounce-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Note
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content (Optional)
                </label>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="input-field h-32 resize-none"
                  placeholder="Enter note content..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingNoteId(null);
                    setEditingTitle('');
                    setEditingContent('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
