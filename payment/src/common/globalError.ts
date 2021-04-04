import "colors";
import { Request, Response } from "express";

class ErrorResponse extends Error {
  public statusCode?: number;
  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

const globalErrorHandler = (
  err: any,
  _: Request,
  res: Response
) => {
  let error;
  if (err) {
    error = { ...err };
  } else {
    error = {};
  }

  error.message = err.message;

  // Log to console for dev
  console.log(err);
  console.log(`${err}`.bgRed.white);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    // @ts-ignore
		const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).send({
    success: false,
    error: error.message || "Server Error",
  });
};

export { globalErrorHandler, ErrorResponse };
