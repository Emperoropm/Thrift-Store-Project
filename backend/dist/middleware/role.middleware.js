"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
const allowRoles = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            console.log("User role is " + user.role + ". Only authorized user can call this api");
            return res.status(403).json({
                message: "Access denied"
            });
        }
        next();
    };
};
exports.allowRoles = allowRoles;
//# sourceMappingURL=role.middleware.js.map