import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import  apiRoutes  from './api/routes';


dotenv.config();
export const app: Application = express();

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});