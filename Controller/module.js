require("module-alias/register")

const {CatchAsync} = require("@util/errorHandler")
const moduleService = require("@service/module")

const createModule = CatchAsync(async (req, res) => {
  const module = await moduleService.createModuleService(req.body, req.user.id);
  res.status(201).send(module);
});

const getModules = CatchAsync(async (req, res) => {
  const result = await moduleService.getModulesService(req.query);
  console.log(result)
    res.status(200).json({
      status: 'success',
      results: result.modules.length,
      data: result
    });
});

const getModule = CatchAsync(async (req, res) => {
  const module = await moduleService.getModuleByIdService(req.params.moduleId);
  res.status(200).send(module);
});

const getMyModules = CatchAsync(async (req, res, next) => {
    const modules = await moduleService.getMyModulesService(req.user.id, req.user.role);

    res.status(200).json({
        success: true,
        results: modules.length,
        data: modules
    });
});

const updateModule = CatchAsync(async (req, res, next) => {
  const {module, url} = await moduleService.updateModuleService(req.params.moduleId, req.body, req.user.id);
  
  // pass old Url in res 
  req.file && Object.assign(res.locals, {oldUrl: url, resourceType: "raw"})

  res.status(200).send(module);

  next()
});

const deleteModule = CatchAsync(async (req, res) => {
  await moduleService.deleteModuleService(req.params.moduleId, req.user.id);
  res.status(204).send();
});

module.exports = {
  createModule,
  getModules,
  getModule,
  updateModule,
  deleteModule,
  getMyModules
};