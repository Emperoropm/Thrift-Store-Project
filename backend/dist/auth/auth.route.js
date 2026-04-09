"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
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
const authController = new auth_controller_1.AuthController();
// Register with optional photo
router.post("/register", upload.single('photo'), authController.insertQuery);
router.post("/login", authController.loginQuery);
router.get("/users", authController.getAllUsers);
router.get("/users/:id", authController.getUserById);
router.delete("/users/:id", authController.deleteUser);
// Update profile with photo
router.put("/profile", auth_middleware_1.authMiddleware, upload.single('photo'), authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.route.js.map