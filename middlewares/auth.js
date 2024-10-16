const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')) {
        return next(new ErrorHandler('Login first to access this resource', 401))
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await decoded.id
        next()
    } catch(error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new ErrorHandler('Token has expired, please log in again', 401));
        }
        return next(new ErrorHandler('Authentication Failed', 401));
    }

})