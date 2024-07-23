import express from 'express';
import { contact, requestCourse } from '../Controllers/otherControllers.js';

const router = express.Router();

// contact

router.route("/contact").post(contact)

//request course
router.route("/requestcourse").post(requestCourse)

// admin stack


export default router;