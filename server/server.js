import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Standard middlewares
app.use(cors({
  origin: [
    "https://astitva-beta.vercel.app",
    "https://astitva-mern-blockchain.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.options("*", cors());
app.use(express.json()); // Allows parsing of application/json request bodies

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);


// API Health Check route to verify backend status

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Register central error-handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
