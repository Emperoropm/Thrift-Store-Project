import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for user profile photos
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/users');
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${Date.now()}${ext}`);
  }
});

// File filter for images
const imageFileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

// Multer upload instance for product images (multiple files)
const upload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Max 5 files
  },
  fileFilter: imageFileFilter
});

// Export specific middleware
export const uploadProductImages = upload.array('images', 5);
export const uploadUserPhoto = multer({
  storage: userStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter
}).single('photo');

// Default export
export default upload;