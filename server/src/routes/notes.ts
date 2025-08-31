import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { authenticateToken } from '../middleware/auth';
import { validate, noteSchema, updateNoteSchema } from '../middleware/validation';

const router = Router();
const noteController = new NoteController();

// All note routes require authentication
router.use(authenticateToken);

// GET /api/notes - Get all notes for the authenticated user
router.get('/', noteController.getNotes);

// POST /api/notes - Create a new note
router.post('/', validate(noteSchema), noteController.createNote);

// PUT /api/notes/:id - Update a note
router.put('/:id', validate(updateNoteSchema), noteController.updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', noteController.deleteNote);

// GET /api/notes/:id - Get a specific note
router.get('/:id', noteController.getNote);

export default router;
