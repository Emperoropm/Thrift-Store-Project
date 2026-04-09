"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("./user.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../public/uploads/users'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `user-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Get current logged-in user info
router.get("/me", auth_middleware_1.authMiddleware, userController.getProfile);
// 👇 ADD THESE: Photo upload routes
router.post("/photo", auth_middleware_1.authMiddleware, upload.single('photo'), userController.uploadPhoto);
router.delete("/photo", auth_middleware_1.authMiddleware, userController.removePhoto);
// Add this route to user.routes.ts
router.get("/seller/:sellerId/photo", userController.getSellerPhoto);
// Add these routes
router.get("/seller/:sellerId/profile", userController.getSellerProfile);
router.get("/seller/:sellerId/products", userController.getSellerProducts);
exports.default = router;
//# sourceMappingURL=user.route.js.map