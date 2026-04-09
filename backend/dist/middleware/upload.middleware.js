"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserPhoto = exports.uploadProductImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// Configure storage for product images
const productStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/products');
        ensureDirectoryExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});
// Configure storage for user profile photos
const userStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/users');
        ensureDirectoryExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const ext = path_1.default.extname(file.originalname);
        cb(null, `user-${userId}-${Date.now()}${ext}`);
    }
});
// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
};
// Multer upload instance for product images (multiple files)
const upload = (0, multer_1.default)({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5 // Max 5 files
    },
    fileFilter: imageFileFilter
});
// Export specific middleware
exports.uploadProductImages = upload.array('images', 5);
exports.uploadUserPhoto = (0, multer_1.default)({
    storage: userStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter
}).single('photo');
// Default export
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map