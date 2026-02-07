require("module-alias/register")

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("@model/user")
const { AppError } = require("@util/ErrorHandler");
const { createSessionCookie } = require("@util/JwtHandler");

// AppError is specific Error Handler to manage customized errors under class Error

exports.signupService = async ({ email, password, name, role }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        name,
        password: hashedPassword,
        role: role
    });

    const { sessionCookie, sessionToken } = await createSessionCookie(user, null);

    user.sessionToken = sessionToken;
    await user.save();


    return {
        sessionCookie,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
    };
};

exports.loginService = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Email or password incorrect", 401);
    }

    let sessionCookie;

    if (!user.sessionToken) {
        const result = await createSessionCookie(user, null);
        sessionCookie = result.sessionCookie;
        user.sessionToken = result.sessionToken;
        await user.save();
    } else {
        ({ sessionCookie } = await createSessionCookie(user, user.sessionToken));
    }


    return {
        sessionCookie,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
    };
};

exports.requestPasswordResetService = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Email not found", 404);
    }
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();


    return { resetToken };
};

exports.resetPasswordService = async ({ email, resetToken, newPassword }) => {
    const user = await User.findOne({
        email,
        resetToken,
        resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.sessionToken = null;

    await user.save();


    return { message: "Password reset successful" };
};

exports.changePasswordService = async ({ userId, oldPassword, newPassword }) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
        throw new AppError("Old password incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.sessionToken = null;

    await user.save();


    return { message: "Password changed successfully" };
};

exports.logoutService = async ({ userId }) => {
    const user = await User.findById(userId);
    if (user) {
        user.sessionToken = null;
        await user.save();
    }


    return { message: "Logged out successfully" };
};