import { Request, Response, NextFunction } from 'express';

// Local types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method
  });

  res.status(statusCode).json(response);
};
