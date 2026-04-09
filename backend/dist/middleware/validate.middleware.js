"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const app_error_1 = require("../error/app.error");
const validate = (dtoClass) => {
    return async (req, res, next) => {
        try {
            const dtoInstance = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
            const errors = await (0, class_validator_1.validate)(dtoInstance);
            if (errors.length > 0) {
                const errorMessages = errors
                    .map(error => Object.values(error.constraints || {}))
                    .flat()
                    .join(', ');
                throw new app_error_1.AppError(`Validation failed: ${errorMessages}`, 400, {});
            }
            // Attach validated data to request
            req.validatedBody = dtoInstance;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map