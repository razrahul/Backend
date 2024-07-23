import express from 'express';
import { config } from 'dotenv';
import ErrorMiddleware from './Middlewares/Error.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'

config({
  path: './Config/config.env'
});

const app = express();
app.use(cors({
    origin: process.env.Frontend_URL,
    credentials: true
}));

// using middlewares
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(cookieParser());


// Importing & using Routes
import course from './Routes/courseRoutes.js';
import user from './Routes/userRoutes.js'
import other from './Routes/otherRoutes.js'

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", other);

export default app;

app.use(ErrorMiddleware);
