require("module-alias/register")

const Module = require('@model/module');
const {AppError} = require('@util/errorHandler');

const addContentService = async (moduleId, contentData, userId) => {
  const module = await Module.findOne({ _id: moduleId, instructor: userId });
  if (!module) throw new AppError('Module not found or unauthorized', 404);

  module.content.push(contentData);
  await module.save();

  return module;
};

const removeContentService = async (moduleId, unitId, userId) => {
  const module = await Module.findOneAndUpdate(
    { _id: moduleId, instructor: userId },
    { $pull: { content: { _id: unitId } } },
    {select: { 'content.$': 1 }}
  )
  if (!module) throw new AppError('Module not found or unauthorized', 404);
  
  const content = module.content[0]
  let url = null
  (content.type === "video") ? Object.assign(url, {"url": content.videoUrl, "resourceType": "video"}) : Object.assign(url, {url: content.instructionPdfUrl})
  
  return {module, url};
};

const updateContentService = async (moduleId, unitId, updateData, userId) => {
    delete updateData._id;
    delete updateData.type; 
    console.log(updateData)
    const module = await Module.findOne({ _id: moduleId, instructor: userId });
    if (!module) throw new AppError('Module or Content item not found', 404);

    const unit = module.content.id(unitId);
    if (!unit) throw new AppError('Content unit not found inside module', 404);

    let urlToDelete = null;

    if (updateData.videoUrl && unit.videoUrl) {
        urlToDelete = { 
            url: unit.videoUrl, 
            resourceType: 'video' 
        };
    } else if (updateData.instructionPdfUrl && unit.instructionPdfUrl) {
        urlToDelete = { 
            url: unit.instructionPdfUrl, 
            resourceType: 'raw' 
        };
    }

    unit.set(updateData);

    await module.save({ validateBeforeSave: false });

    return { module, url: urlToDelete };
};

module.exports = {
  addContentService,
  removeContentService,
  updateContentService
};