import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserController } from "./user.controller";
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
const userController = new UserController();

// Get current logged-in user info
router.get("/me", authMiddleware, userController.getProfile);

// 👇 ADD THESE: Photo upload routes
router.post("/photo", 
  authMiddleware, 
  upload.single('photo'), 
  userController.uploadPhoto
);

router.delete("/photo", 
  authMiddleware, 
  userController.removePhoto
);

// Add this route to user.routes.ts
router.get("/seller/:sellerId/photo", userController.getSellerPhoto);


// Add these routes
router.get("/seller/:sellerId/profile", userController.getSellerProfile);
router.get("/seller/:sellerId/products", userController.getSellerProducts);

export default router;