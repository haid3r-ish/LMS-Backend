require("module-alias/register")

const {CatchAsync} = require('@util/errorHandler');
const userService = require('@service/user');

const getMe = CatchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).send(user);
});

const updateMe = CatchAsync(async (req, res) => {
  const user = await userService.updateUserBody(req.user.id, req.body);
  res.status(200).send(user);
});

const getMyTeachingCourses = CatchAsync(async (req, res) => {
  const courses = await userService.getInstructorCoursesService(req.user.id);
  res.status(200).send(courses);
});

const deleteMe = CatchAsync(async (req, res, next) => {
    // req.user.id comes from the 'auth' middleware
    await userService.deleteMeService(req.user.id);

    res.status(204).json({
        success: true,
        data: null
    });
});

module.exports = {
  getMe,
  updateMe,
  getMyTeachingCourses,
  deleteMe
};