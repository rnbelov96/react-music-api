const express = require('express');
const cors = require('cors');
const musicRouter = require('./routes/musicRoutes');
const userRoutes = require('./routes/userRoutes');
const likeRoutes = require('./routes/likeRoutes');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');

const corsOptions = {
  origin: ['https://roh7771.github.io', 'http://localhost:9000'],
  credentials: true,
};

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

const app = express();

app.use(cookieParser());
app.use(helmet());
// app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp(
    //убирает повторяющиеся поля в query-строке
    {
      whitelist: [''], //hpp игнорирует эти поля
    }
  )
);

app.use(cors(corsOptions));

app.use(express.static(`${__dirname}/public`));

// 3) ROUTES
app.use('/api/v1/music', musicRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/likes', likeRoutes);

// Для неправильного URL
app.all('*', (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  next(error);
});

// Глобальный Middleware для обработки ошибок
app.use(globalErrorHandler);

module.exports = app;
