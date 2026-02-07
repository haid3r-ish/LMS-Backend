require("module-alias/register")

const {AppError} = require("@util/errorHandler")
const cloudinary = require("@config/cloudinary")

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  return String(url).split("/").slice(-3).join("/"); 
};

const deleteFile = async (url, resourceType = 'raw') => {
  console.log(url)
  if (!url) return;
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if(result.result !== "ok") throw new AppError("Error in deleting the")
  } catch (err) {
    throw new AppError(`Failed to delete file {ID: ${publicId}} `, err.message)
  }
}

// const st = "https://res.cloudinary.com/dvrdj4tus/raw/upload/v1770215335/lms/certificates/1770215405005-Ali%20Ehtisham%20Resume"

// deleteFile(st)

module.exports = deleteFile