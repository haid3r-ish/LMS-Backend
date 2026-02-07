require("module-alias/register")

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require("morgan")

const {GEH, AppError} = require("@util/errorHandler");
const authRouter = require("@route/auth");
const moduleRouter = require('@route/module');
const enrollmentRouter = require('@route/enrollment');
const reviewRouter = require('@route/review');
const userRouter = require('@route/user');

const app = express();

// 1. Middleware
app.use(helmet());app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true                
}));
app.use(morgan("dev"))
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 2. ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/modules', moduleRouter);
app.use('/api/v1/enrollments', enrollmentRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);

// 3. UNHANDLED ROUTES (404)
app.all('*splash', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLER
app.use(GEH);

module.exports = app;