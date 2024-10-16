// const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION') {
        let error = {...err}

        error.message = err.message;

        //Handling wrong JWT error
        if(err.code === 'JsonWebTokenError') {
            const message = `Json Web Token is Invalid, Try Again`
            error = new ErrorHandler(message, 400)
        }

        //Handling expired JWT error
        if(err.code === 'TokenExpiredError') {
            const message = `Json Web Token is Invalid, Try Again`
            error = new ErrorHandler(message, 400)
        }

        res.status(error.statusCode).json({
            success: false,
            message: err.message || 'Internal Server Error'
        })
    }

    
}