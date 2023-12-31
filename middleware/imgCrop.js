const sharp = require('sharp');
const fs = require('fs');

const bannerCrop = (req, res, next) => {
  // Check if req.files is defined and is an array
  const bannerFiles = req.files && Array.isArray(req.files) ? req.files : [];

  // Check if there are bannerFiles before processing
  if (bannerFiles.length === 0) {
    // If no banner files are uploaded, proceed to the next middleware
    return next();
  }

  // Define a function to process each banner file
  const processBannerFile = (bannerFile, index) => {
    const bannerInputFilePath = bannerFile.path;

    sharp(bannerInputFilePath)
      .resize(1500, 800) // Adjust dimensions as needed for banner crop
      .toFormat('webp')
      .toBuffer((err, processedBannerBuffer) => {
        if (err) {
          req.session.bannerCropErr = `Error processing banner image ${index + 1}`;
          // If there's an error, you might want to handle it appropriately
        } else {
          fs.writeFile(bannerInputFilePath, processedBannerBuffer, (writeErr) => {
            if (writeErr) {
              req.session.bannerCropErr = `Error writing banner image ${index + 1}`;
              // Handle write error as needed
            } else {
              console.log(`Banner image ${index + 1} cropped and saved successfully to:`, bannerInputFilePath);
            }
            if (index === bannerFiles.length - 1) {
              // If this is the last banner image, call next() to proceed
              next();
            }
          });
        }
      });
  };

  // Process each banner file in the array
  bannerFiles.forEach((bannerFile, index) => {
    processBannerFile(bannerFile, index);
  });
};

module.exports = {
  productCrop: (req, res, next) => {
    // Assuming req.files is an array of uploaded files
    const files = req.files;

    // Define a function to process each file
    const processFile = (file, index) => {
      const inputFilePath = file.path;

      sharp(inputFilePath)
        .resize(830, 1102)
        .toFormat('webp')
        .toBuffer((err, processedImageBuffer) => {
          if (err) {
            req.session.bannerCropErr = `Error processing image ${index + 1}`;
          } else {
            fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
              if (writeErr) {
                req.session.bannerCropErr = `Error writing image ${index + 1}`;
              } else {
                console.log(`Image ${index + 1} cropped and saved successfully to:`, inputFilePath);
              }
              if (index === files.length - 1) {
                next();
              }
            });
          }
        });
    };

    // Process each file in the array
    files.forEach((file, index) => {
      processFile(file, index);
    });
  },
  bannerCrop: bannerCrop, // Include the updated bannerCrop middleware
};
