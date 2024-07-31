import express from 'express';
import { contact, requestCourse, getDashboardStats } from '../Controllers/otherControllers.js';
import {isAuthenticated, authorizeAdmin } from '../Middlewares/auth.js';

const router = express.Router();

// contact

router.route("/contact").post(contact)

//request course
router.route("/requestcourse").post(requestCourse)

// admin stack

router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getDashboardStats )


export default router;