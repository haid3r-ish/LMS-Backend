require("module-alias/register")

const {AppError} = require("@util/errorHandler")
const Module = require("@model/module")
const Enrollment = require("@model/enrollment")

const createModuleService = async (moduleBody, instructorId) => {
  return await Module.create({ ...moduleBody, instructor: instructorId });
};

const getModulesService = async (options = {}) => {
  
  const { 
    search, 
    page = 1,
    sortOrder = 'asc' 
  } = options;

  const query = {}; 

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' }; 
    query.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }
  const pageNum = parseInt(page);
  const limitNum = parseInt(30);
  const skip = (pageNum - 1) * limitNum;
  
  const sort = { price: sortOrder === 'desc' ? -1 : 1 };

  const [modules, totalDocs] = await Promise.all([
    Module.find(query)
      .select('title description price difficulty thumbnail instructor') // Lightweight fields
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    
    Module.countDocuments(query)
  ]);

  return {
    modules, 
    pagination: {
      total: totalDocs,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalDocs / limitNum)
    }
  };
};

const getModuleByIdService = async (moduleId) => {
  const module = await Module.findById(moduleId).populate('instructor', 'name email');
  if (!module) throw new AppError('Module not found', 404);
  return module;
};

const updateModuleService = async (moduleId, updateBody, userId) => {
  delete updateBody.content;
  delete updateBody.instructor;

  const module = await Module.findOneAndUpdate(
    { _id: moduleId, instructor: userId },
    updateBody,
    { runValidators: true }
  )
  if (!module) throw new AppError('Module not found or unauthorized', 404)
  
  // add local field to get previous stored certificate Url
  let url = (updateBody.certificateUrl) ? module.certificateUrl : null

  Object.assign(module, updateBody)

  return {module, url}
}

const deleteModuleService = async (moduleId, userId) => {
  const module = await Module.findOneAndDelete({ _id: moduleId, instructor: userId });
  if (!module) throw new AppError('Module not found or unauthorized', 404);
  return module;
};

const getMyModulesService = async (userId, role) => {
    if (role === 'instructor') {
        return await Module.find({ instructor: userId });
    }

    if (role === 'student') {
        const enrollments = await Enrollment.find({ student: userId })
            .populate({
                path: 'module',
                select: 'title instructor price rating'
            });

        return enrollments.map(e => e.module);
    }
    
    return [];
};

module.exports = {
  createModuleService,
  getModulesService,
  getModuleByIdService,
  updateModuleService,
  deleteModuleService,
  getMyModulesService
};