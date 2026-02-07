require("module-alias/register")

const User = require('@model/user');
const Module = require('@model/module'); // For Instructor Dashboard
const {AppError} = require('@util/errorHandler');

const getUserById = async (id) => {
  return await User.findById(id);
};

const updateUserBody = async (userId, updateBody) => {
  if (updateBody.password || updateBody.role) {
    throw new AppError('This route is not for password or role updates.', 400);
  }

  const allowedFields = { 
    name: updateBody.name, 
    headline: updateBody.headline, 
    bio: updateBody.bio,
  };

  Object.keys(allowedFields).forEach(key => allowedFields[key] === undefined && delete allowedFields[key]);

  const updatedUser = await User.findByIdAndUpdate(userId, allowedFields, {
    new: true,
    runValidators: true
  });

  return updatedUser;
};

const getInstructorCoursesService = async (instructorId) => {
  const courses = await Module.find({ instructor: instructorId });
  return courses;
};

const deleteMeService = async (userId) => {
    await User.findByIdAndUpdate(userId, { active: false });
};

module.exports = {
  getUserById,
  updateUserBody,
  getInstructorCoursesService,
  deleteMeService
};