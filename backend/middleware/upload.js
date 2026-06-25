const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;

    if (file.fieldname === 'photo') {
      uploadPath = path.join(uploadsDir, 'photos');
    } else if (file.fieldname === 'file' || file.fieldname === 'taskFile') {
      uploadPath = path.join(uploadsDir, 'task-documents');
    } else if (file.fieldname === 'workImages') {
      // Differentiate between manager monthly reports and staff task reports
      if (req.originalUrl.includes('/manager/')) {
        uploadPath = path.join(uploadsDir, 'monthly-reports');
      } else {
        uploadPath = path.join(uploadsDir, 'task-reports');
      }
    } else if (file.fieldname === 'report' || file.fieldname === 'receipt') {
      uploadPath = path.join(uploadsDir, 'payment-proofs');
    } else if (file.fieldname === 'images' || file.fieldname === 'updateImage') {
      uploadPath = path.join(uploadsDir, 'work-updates');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.fieldname === 'projectFile') {
      uploadPath = path.join(uploadsDir, 'projects');
    } else if (file.fieldname === 'coverImage') {
      uploadPath = path.join(uploadsDir, 'project-cover');
    } else if (file.fieldname === 'galleryImages') {
      uploadPath = path.join(uploadsDir, 'project-gallery');
    } else if (file.fieldname === 'attachments') {
      uploadPath = path.join(uploadsDir, 'task-attachments');
    } else if (file.fieldname === 'complaintAttachments') {
      uploadPath = path.join(uploadsDir, 'complaints');
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // SECURITY: Use crypto for random filenames to prevent collisions and predictability
    const crypto = require('crypto');
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
// File filter
const fileFilter = (req, file, cb) => {
  // STRICTER VALIDATION: Whitelist extensions and utilize mimetype check
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // Basic mimetype check (Note: client can spoof this, but it's a first line of defense)
  // For true security, one would inspect file magic numbers (e.g. using 'file-type' package)
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: Images, PDF, Office Docs, TXT'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: fileFilter
});

module.exports = upload;




