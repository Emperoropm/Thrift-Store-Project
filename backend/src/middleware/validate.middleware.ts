import { Request, Response, NextFunction } from 'express';
import { validate as classValidate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError } from '../error/app.error';

export const validate = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToInstance(dtoClass, req.body);
      const errors = await classValidate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = errors
          .map(error => Object.values(error.constraints || {}))
          .flat()
          .join(', ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400, {});
      }

      // Attach validated data to request
      (req as any).validatedBody = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
};