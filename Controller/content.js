require("module-alias/register")

const {CatchAsync} = require("@util/errorHandler")
const contentService = require("@service/content")

const addContent = CatchAsync(async (req, res) => {
  const module = await contentService.addContentService(req.params.moduleId, req.body, req.user.id);
  res.status(200).send(module);
});

const removeContent = CatchAsync(async (req, res) => {
  const {module, url} = await contentService.removeContentService(req.params.moduleId, req.params.unitId, req.user.id);
  
  // pass old Url in res
  Object.assign(res.locals, {oldUrl: url.url, resourceType: url.resourceType})
  
  res.status(200).send(module);
});

const updateContent = CatchAsync(async (req, res, next) => {
  const {module, url} = await contentService.updateContentService(
    req.params.moduleId, 
    req.params.unitId, 
    req.body, 
    req.user.id
  );

  // pass old Url in res 
  req.file && Object.assign(res.locals, {oldUrl: url, resourceType: url.resourceType | "raw"})

  res.status(200).send(module);

  next()
});

module.exports = {
  addContent,
  removeContent,
  updateContent
};