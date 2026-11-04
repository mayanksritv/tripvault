import { randomUUID } from 'node:crypto';
import multer from 'multer';
import cloudinaryPackage from 'cloudinary';
import cloudinaryStoragePackage from 'multer-storage-cloudinary';

const cloudinary = cloudinaryPackage.v2;
const { CloudinaryStorage } = cloudinaryStoragePackage;
let cloudinaryUpload;

function getCloudinaryUpload() {
  const configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  if (!configured) return null;
  if (cloudinaryUpload) return cloudinaryUpload;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'tripvault/trip-photos',
      format: (_req, file) => file.mimetype.split('/')[1].replace('jpeg', 'jpg'),
      public_id: (_req, file) => {
        const safeName = file.originalname
          .replace(/\.[^.]+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-')
          .slice(0, 45) || 'trip-photo';
        return `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
      }
    }
  });

  cloudinaryUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter(_req, file, callback) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        const error = new Error('Please upload a JPG, PNG, or WEBP image.');
        error.status = 400;
        return callback(error);
      }
      return callback(null, true);
    }
  });
  return cloudinaryUpload;
}

// Cloudinary is optional at boot so non-upload features keep working while credentials are configured.
export function uploadTripImage(req, res, next) {
  const uploader = getCloudinaryUpload();
  if (!uploader) {
    return res.status(503).json({
      message: 'Photo uploads are not configured yet. Add your Cloudinary credentials to server/.env.'
    });
  }
  return uploader.single('image')(req, res, next);
}
