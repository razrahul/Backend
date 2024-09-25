import express from 'express';
import { config } from 'dotenv';
import ErrorMiddleware from './Middlewares/Error.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';


config({
  path: './Config/config.env'
});

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'https://e-learning5173.netlify.app'], // Allows all origins
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true, // Allows cookies and other credentials to be sent with the request
  };
  
  

app.use(cors(corsOptions)); // Enable CORS for all origins

// app.use(cors({
//     origin: process.env.Frontend_URL,
//     credentials: true
// }));

// using middlewares
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(cookieParser());

app.options('*', cors());  // Handle preflight requests

// Importing & using Routes
import course from './Routes/courseRoutes.js';
import user from './Routes/userRoutes.js'
import other from './Routes/otherRoutes.js'
import payment from './Routes/paymentRoutes.js'

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", other);
app.use("/api/v1", payment);

export default app;

app.use(ErrorMiddleware);
