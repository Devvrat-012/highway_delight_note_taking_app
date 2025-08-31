import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Local types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

interface ValidationError {
  field: string;
  message: string;
}

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: 'Validation error'
      };

      return res.status(400).json({ ...response, errors });
    }

    next();
  };
};

// Validation schemas
export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  dateOfBirth: Joi.date().optional().messages({
    'date.base': 'Please provide a valid date'
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'Password must be at least 8 characters long'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().optional(),
  otp: Joi.string().optional()
}).or('password', 'otp');

export const otpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export const noteSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  content: Joi.string().optional().allow('').messages({
    'string.base': 'Content must be a string'
  })
  ,
  completed: Joi.boolean().optional()
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  content: Joi.string().optional().allow('').messages({
    'string.base': 'Content must be a string'
  })
  ,
  completed: Joi.boolean().optional()
}).min(1);
