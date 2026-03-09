import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import multer from 'multer';
import path from 'path';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/users'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();
const authController = new AuthController();

// Register with optional photo
router.post("/register", upload.single('photo'), authController.insertQuery);
router.post("/login", authController.loginQuery);
router.get("/users", authController.getAllUsers);
router.get("/users/:id", authController.getUserById);
router.delete("/users/:id", authController.deleteUser);

// Update profile with photo
router.put("/profile", 
  authMiddleware, 
  upload.single('photo'), 
  authController.updateProfile
);

export default router;