const multer  = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, 'public/admin/assets/imgs/category');
    },
    filename: function (req, file, callback) {
      callback(null,  file.fieldname + '-' + Date.now() + path.extname(file.originalname))}
  });
  const fileFilter = function (req, file, callback) {
    // Allow only JPG files
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      callback(null, true);
    } else {
      // Reject other file types
      callback(new Error('Only JPG files are allowed!'), false);
    }
  };


  const upload=multer({storage:storage})

  module.exports={upload}

  