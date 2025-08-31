import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../middleware/auth';

// Local types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface Note {
  id: string;
  title: string;
  content?: string;
  completed?: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateNoteDto {
  title: string;
  content?: string;
  completed?: boolean;
}

interface UpdateNoteDto {
  title?: string;
  content?: string;
  completed?: boolean;
}

export class NoteController {
  public getNotes = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      
      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      const formattedNotes: Note[] = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content || undefined,
        completed: (note as any).completed || false,
        userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));

      res.json({
        success: true,
        message: 'Notes retrieved successfully',
        data: formattedNotes
      });
    } catch (error) {
      console.error('Get notes error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve notes'
      };
      res.status(500).json(response);
    }
  };

  public getNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const note = await prisma.note.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!note) {
        const response: ApiResponse = {
          success: false,
          message: 'Note not found'
        };
        return res.status(404).json(response);
      }

      const formattedNote: Note = {
        id: note.id,
        title: note.title,
        content: note.content || undefined,
        completed: (note as any).completed || false,
        userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };

      res.json({
        success: true,
        message: 'Note retrieved successfully',
        data: formattedNote
      });
    } catch (error) {
      console.error('Get note error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve note'
      };
      res.status(500).json(response);
    }
  };

  public createNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
    const { title, content, completed }: CreateNoteDto = req.body;
      const userId = req.user!.id;

      const note = await prisma.note.create({
        data: {
          title,
          content: content || '',
          userId,
        } as any
      });

      const formattedNote: Note = {
        id: note.id,
        title: note.title,
        content: note.content || undefined,
        completed: (note as any).completed || false,
        userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: formattedNote
      });
    } catch (error) {
      console.error('Create note error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create note'
      };
      res.status(500).json(response);
    }
  };

  public updateNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
  const { id } = req.params;
  const { title, content, completed }: UpdateNoteDto = req.body;
      const userId = req.user!.id;

      // Check if note exists and belongs to user
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingNote) {
        const response: ApiResponse = {
          success: false,
          message: 'Note not found'
        };
        return res.status(404).json(response);
      }

      const note = await prisma.note.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(completed !== undefined && { completed })
        }
      });

      const formattedNote: Note = {
        id: note.id,
        title: note.title,
        content: note.content || undefined,
  completed: (note as any).completed || false,
  userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };

      res.json({
        success: true,
        message: 'Note updated successfully',
        data: formattedNote
      });
    } catch (error) {
      console.error('Update note error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update note'
      };
      res.status(500).json(response);
    }
  };

  public deleteNote = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if note exists and belongs to user
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingNote) {
        const response: ApiResponse = {
          success: false,
          message: 'Note not found'
        };
        return res.status(404).json(response);
      }

      await prisma.note.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Delete note error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete note'
      };
      res.status(500).json(response);
    }
  };
}
