import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

dotenv.config();

const {
  PORT = 4000,
  MONGODB_URI,
  MONGODB_DB_NAME = 'fitness-ai-response',
  SPRING_BASE_URL = 'http://localhost:8080',
} = process.env;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const aiResponseSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    language: { type: String, required: true },
    response: { type: String, required: true },
    requestMessage: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const AiResponse = mongoose.model('AiResponse', aiResponseSchema, 'ai-response');

async function start() {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  console.log(`Connected to MongoDB database "${MONGODB_DB_NAME}"`);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/ai/respond', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const { language, message } = req.body || {};
    if (!language) {
      return res.status(400).json({ error: 'language is required' });
    }

    try {
      const profileResponse = await axios.get(
        `${SPRING_BASE_URL}/farmer/profile`,
        { headers: { Authorization: authHeader } }
      );

      const profile = profileResponse.data;
      const reply = 'hi';

      await AiResponse.create({
        userId: profile.id,
        userName: profile.name,
        language,
        response: reply,
        requestMessage: message || '',
      });

      res.json({ reply });
    } catch (error) {
      const status = error.response?.status || 500;
      const messageText =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Unable to process request';
      res.status(status).json({ error: messageText });
    }
  });

  app.listen(PORT, () => {
    console.log(`AI service listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start AI service', err);
  process.exit(1);
});

