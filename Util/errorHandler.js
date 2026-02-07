// const cleanStack = require("cleanStack")

//// ERROR HANDLING ////
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode
        this.isOperational = true;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

//// CLEAN_STACK ////
// function cleanErrStack(stack){
//     if(!stack) return error

//     stack = cleanStack(stack, {
//         pretty: true
//     })

//     return stack
// }

//// ASYNC WRAPPER ////
const CatchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

//// GLOBAL ERROR HANDLER /////
const sendErrorDev = (err, res) => {
  console.log(err)
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const GEH = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

module.exports = {
    CatchAsync,
    AppError,
    GEH
}