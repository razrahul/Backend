import express from 'express';
import { isAuthenticated } from '../Middlewares/auth.js';
import { buySubscription, paymentVerification, getRazorPayKey, cancelSubscription } from '../Controllers/paymentController.js';


const router = express.Router();


// buy subscription

router.route("/subscription").post(isAuthenticated, buySubscription) 

// paymentverification and save refrence in database
router.route("/paymentverification").post(isAuthenticated, paymentVerification)

//get razorpay key
router.route("/razorpaykey").get(getRazorPayKey)

// cancel subscription
router.route("/subscription/cancel").delete(isAuthenticated, cancelSubscription)

export default router