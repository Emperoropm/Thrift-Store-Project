import { AppError } from "../error/app.error";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (error: AppError,request: Request,response: Response,next:NextFunction) => {
    if (error instanceof AppError) {
        return response.status(error.statusCode!).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }

    console.log("Error is"+error);
    return response.status(500).json({
        success: false,
        message: "Internal server error"
    });
}