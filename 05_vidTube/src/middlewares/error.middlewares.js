import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // ✅ Wrap non-ApiError errors
    if (!(error instanceof ApiError)) {
        const statusCode =
            err instanceof mongoose.Error ? 400 : (err.statusCode || 500);

        const message = err.message || "Something went wrong";
        error = new ApiError(statusCode, message, err.errors || [], err.stack);
    }

    // ✅ Build the response object
    const response = {
        success: error.success,
        message: error.message,
        errors: error.errors,
        data: error.data,
        statusCode: error.statusCode,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
