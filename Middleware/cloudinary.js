require("module-alias/register")

const multer = require("multer")
const streamifier = require("streamifier")
const path = require("path")
const fs = require("fs")

const {CatchAsync, AppError} = require("@util/errorHandler")
const deleteFile = require("@util/cloudHandler")
const cloudinary = require("@config/cloudinary")
    

// Filters 
// const videoFilter = (req, file, cb) =>{
//     const allowedExts = /\.(mp4|mkv|avi|mov|webm)$/i;
//     if(file.mimetype.startsWith('video/') && allowedExts.test(file.originalname)) cb(null, true)
//     else cb(new AppError("Video File Format is not compatible", 400), false)
// }
// const rawFilter = (req, file, cb) => {
//     const allowedExts = /\.(pdf|jpg|jpeg|png|webp)$/i;
//     if(file.mimetype.startsWith('application/pdf') && allowedExts.test(file.originalname)) cb(null, true)
//     else cb(new AppError("Raw File Format is not compatible", 400), false)
// }

// // Folder checking 
// const ensureFolderExists = (dir) => {
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir, { recursive: true });
//     }
// }

// Multer Disk Storage Functions
// const videoStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const dir = path.join(process.cwd(),"Upload/video")
//         ensureFolderExists(dir)
//         cb(null, dir)
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
//     }    
// })
// const rawStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const dir = path.join(process.cwd(),"Upload/raw")
//         ensureFolderExists(dir)
//         cb(null, dir)
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
//     }
// })

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {fileSize: 100 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith("video") || file.mimetype === "application/pdf") cb(null, true)
        else cb(new AppError('Invalid file type!', 400), false)
    }
})

// Multer Instances
// const uploadVideo = multer({
//     storage: videoStorage,
//     fileFilter: videoFilter,
//     limits: {fileSize: 1024 * 1024 * 20}
// })
// const uploadRaw = multer({
//     storage: rawStorage,
//     fileFilter: rawFilter,
//     limits: {fileSize: 1024 * 1024 * 5}
// })

const uploadToCloud = (req, res, next) => {
    if (!req.file) return next();

    let folder = 'lms/misc';
    let resourceType = 'raw';

    if (req.file.fieldname === 'video') {
        folder = 'lms/videos';
        resourceType = 'video';
    } else if (req.file.fieldname === 'certificate') {
        folder = 'lms/certificates';
    } else if (req.file.fieldname === 'assignment') {
        folder = 'lms/assignments';
    }

    // Now 'cloudinary' is already configured and ready to use!
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            resource_type: resourceType,
            folder: folder,
            public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "")}`
        },
        (error, result) => {
            if (error) return next(new AppError('Upload failed', 500));

            if (req.file.fieldname === 'video') {
                req.body.videoUrl = result.secure_url;
                req.body.duration = result.duration;
                req.body.type = 'video';
            } else if (req.file.fieldname === 'certificate') {
                req.body.certificateUrl = result.secure_url;
            } else {
                req.body.instructionPdfUrl = result.secure_url;
                req.body.type = 'assignment';
            }

            next();
        }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
}

// const uploadToCloud = CatchAsync((req, res, next) => {
//     if (!req.file) return next();

//     let folder = 'lms/misc';
//     let resourceType = 'raw';
//     let result;

//     if (req.file.fieldname === 'video') {
//         folder = 'lms/videos';
//         resourceType = 'video';
//     } else if (req.file.fieldname === 'certificate') {
//         folder = 'lms/certificates';
//     } else if (req.file.fieldname === 'assignment') {
//         folder =   'lms/assignments';
//     }

//     // if(folder === "lms/videos") {
//     //     result = cloudinary.uploader.upload_large(req.file.path, {
//     //         resource_type: resourceType,
//     //         folder: folder,
//     //         chunk_size: 3000000,
//     //         public_id: `${Date.now()}-${req.file.originalname.split('.')[0].replace(/\s+/g, '-')}`
//     //     })
//     // } else {
//     //     result = cloudinary.uploader.upload(req.file.path, {
//     //         resource_type: resourceType,
//     //         folder: folder,
//     //         public_id: `${Date.now()}-${req.file.originalname.split('.')[0].replace(/\s+/g, '-')}`
//     //     })
//     // }

//     if (req.file.fieldname === 'video') {
//         // req.body.videoUrl = result.secure_url || "fakeUrl";
//         // req.body.duration = result.duration || "fakeduration";
//         req.body.videoUrl = "fakeUrl";
//         req.body.duration = "fakeduration";
//     } else if (req.file.fieldname === 'certificate') {
//         // req.body.certificateUrl = result.secure_url || "fakeUrl";
//         req.body.certificateUrl = "fakeUrl";
//     } else {
//         // req.body.instructionPdfUrl = result.secure_url || "fakeUrl";
//         req.body.instructionPdfUrl = "fakeUrl";
//     }

//     fs.unlinkSync(req.file.path);
//     next() 
// })

// const removeFromCloud = CatchAsync(async (req, res, next) => {
//     if (req.method === 'PATCH' && !req.file) {
//         return next();
//     }

//     const { moduleId, unitId } = req.params;

//     const module = await Module.findById(moduleId);
//     if (!module) return next(new AppError('Module not found', 404));

//     let urlToDelete = null;
//     let resourceType = 'raw'; 

//     if (unitId) {
//         const content = module.content.id(unitId);
//         if (!content) return next(new AppError('Content unit not found', 404));

//         if (content.type === 'video') {
//             urlToDelete = content.videoUrl;
//             resourceType = 'video';
//         } else if (content.type === 'assignment') {
//             urlToDelete = content.instructionPdfUrl;
//         }
//     } else {
//         if (req.query.type === 'certificate' || req.file?.fieldname === 'certificate') {
//              urlToDelete = module.certificateUrl;
//         }
//     }

//     if (urlToDelete) {
//         await deleteFile(urlToDelete, resourceType);
//         console.log(`Old file deleted: ${urlToDelete}`);
//     }

//     next();
// });

const removeFromCloud = CatchAsync(async (req, res, next) => {
    if(!res.locals || !res.locals.oldUrl) throw new AppError("Error in fetching Url", 400)
    
    deleteFile(res.locals.oldUrl, res.locals.resourceType)
        .catch( err => {
            console.log("Cloud Delete Failed ", err)
        })
})

const multerFieldSelector = (req,res,next) => {
    switch (req.query.type) {
        case "video":
            return upload.single("video")(req,res,next)
        case "assignment":
            return upload.single("assignment")(req,res,next)  
        default:
            return upload.single("certificate")(req,res,next) 
    }
    
}

module.exports = {
    uploadToCloud,
    removeFromCloud,
    multerFieldSelector
}