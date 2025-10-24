import express from 'express';
import dotenv from 'dotenv';
import connnectDB from './config/db.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth_routes.js'
import projectRouter from './routes/project_routes.js'
import taskRouter from './routes/task_routes.js'
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 8000;

connnectDB()

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials:true,
}));

app.use('/api/auth' , authRouter)
app.use('/api/project' , projectRouter)
app.use('/api/task' ,taskRouter)


app.listen(PORT , () =>{
  console.log(`server is running on http://localhost:${PORT}`);
});
