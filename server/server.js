import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import colors from 'colors';

import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/auth.routes.js';
import contentRoutes from './routes/content.routes.js';
import userRoutes from './routes/user.routes.js';

import { notFound, errorHandler } from './middleware/error.middleware.js';

dotenv.config();

// DEBUG: Check if env vars are loading
console.log('📋 Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');

connectDB();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ||  'draftiteration.onrender.com',
  credentials: true
}));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('DraftIteration API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
