"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_error_1 = require("../error/app.error");
const errorHandler = (error, request, response, next) => {
    if (error instanceof app_error_1.AppError) {
        return response.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }
    console.log("Error is" + error);
    return response.status(500).json({
        success: false,
        message: "Internal server error"
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorhandler.js.map