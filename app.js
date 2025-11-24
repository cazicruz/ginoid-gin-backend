require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const {connectRedis} = require('./config/redisClient');
const pingServer = require('./utils/pingServer');
const cron = require('node-cron');

// Import database connection
const connectDB = require('./config/database');

// Import Swagger specs
const swaggerSpecs = require('./config/swagger');

// Import routes
const apiRouter = require('./routes/api');
const { ApiError } = require('./utils/apiError');

const app = express();

// Connect to MongoDB
// connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'https://www.hair-shop-beta.vercel.app','https://bclassyhairs.com','bclassyhairs.com'] 
    : ['http://localhost:3000', 'http://localhost:3001','https://hair-shop-beta.vercel.app', 'https://www.hair-shop-beta.vercel.app','https://bclassyhairs.com'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logging middleware
app.use(logger('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'B-Classy API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  }
}));

app.get('/', (req, res) => {
  res.json({
    message: 'B-Classy API is running 🎉',
    api: '/api',
    docs:'/docs'
  });
});


// API Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Routes
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log error
  console.error('Error:', err);

  // Handle custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode || 500).json(err.toJSON());
  }

  // Handle API errors
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    await connectDB();         // connect to MongoDB
    connectRedis(app);      // connect to Redis

    const PORT = process.env.PORT || 3000;
    const domain = process.env.BASE_URL || "localhost";
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${domain}:${PORT}`);
      cron.schedule('*/30 * * * *', pingServer);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();


// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Server is running on port ${process.env.PORT || 3000}`);
//   connectDB(app);
//   connectRedis(app);
// });

module.exports = app;
