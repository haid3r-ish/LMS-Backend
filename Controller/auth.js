require("module-alias/register")

const { CatchAsync } = require("@util/errorHandler");
const { verifyNullish } = require("@util/otherHandler");
const authService = require("@service/auth");

// VerifyNullish check whether any input is null or undefined

exports.signup = CatchAsync(async (req, res) => {
    const { email, password, name, role } = req.body;
    if (verifyNullish(email, password, name, role)) throw new Error("Invalid data");

    const data = await authService.signupService({ email, password, name, role });

    res.status(201).json({
        success: true,
        ...data,
    });
});

exports.login = CatchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (verifyNullish(email, password)) throw new Error("Invalid data");

    const data = await authService.loginService({ email, password });

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        httpOnly: true,
        
        secure: process.env.NODE_ENV === 'production', 
    };
    res.cookie("sessionCookie", data.sessionCookie, cookieOptions)
    console.log(data)
    res.status(200).json({
        success: true,
        ...data,
    });
});

exports.requestPasswordReset = CatchAsync(async (req, res) => {
    const data = await authService.requestPasswordResetService(req.body);

    res.status(200).json({
        success: true,
        ...data,
    });
});

exports.resetPassword = CatchAsync(async (req, res) => {
    const {token, password} = req.body;
    if (verifyNullish(token, password)) throw new Error("Invalid Data")

    const data = await authService.resetPasswordService(req.body);

    res.status(200).json({
        success: true,
        ...data,
    });
});

exports.changePassword = CatchAsync(async (req, res) => {

    const data = await authService.changePasswordService({
        userId: req.user.id,
        ...req.body,
    });

    res.status(200).json({
        success: true,
        ...data,
    });
});

exports.logout = CatchAsync(async (req, res) => {
    const data = await authService.logoutService({
        userId: req.user.id,
    });

    res.status(200).json({
        success: true
    });
});
