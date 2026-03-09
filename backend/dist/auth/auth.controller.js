"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_model_1 = require("./auth.model");
const class_validator_1 = require("class-validator");
const app_error_1 = require("../error/app.error");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    async insertQuery(request, response, next) {
        try {
            // Create auth model without id parameter
            let auth = new auth_model_1.AuthModel(request.body.name, request.body.email, request.body.password, request.body.role);
            console.log("Received data:", request.body);
            console.log("Auth object:", auth);
            const errors = await (0, class_validator_1.validate)(auth);
            if (errors.length > 0) {
                const validationError = {};
                for (const err of errors) {
                    if (err.constraints) {
                        const message = Object.values(err.constraints);
                        if (message.length > 0 && typeof message[0] === "string") {
                            validationError[err.property] = message[0];
                        }
                    }
                }
                console.log("Validation error object:", validationError);
                throw new app_error_1.AppError("Validation failed", 400, validationError);
            }
            // Service returns { user, token } where user doesn't have password
            const { user, token } = await this.authService.insertQuery(auth);
            response.status(201).json({
                message: "User registered successfully",
                data: {
                    user, // user already doesn't have password
                    token
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async loginQuery(request, response, next) {
        try {
            const { email, password } = request.body;
            if (!email || !password) {
                throw new app_error_1.AppError("Email and password are required", 400, {});
            }
            // Service returns { user, token } where user doesn't have password
            const { user, token } = await this.authService.loginQuery(email, password);
            console.log("Login successful for user:", user.email);
            response.status(200).json({
                message: "Successfully logged in",
                data: {
                    user, // user already doesn't have password
                    token
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await this.authService.getAllUsers();
            res.json({
                message: "Users fetched successfully",
                data: users
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const user = await this.authService.getUserById(id);
            res.json({
                message: "User fetched successfully",
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const id = Number(req.params.id);
            const deleted = await this.authService.deleteUser(id);
            res.json({
                message: "User deleted successfully",
                data: deleted
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map