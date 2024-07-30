import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { User } from "../Models/User.js";
import { Course } from "../Models/Course.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto"
import { Payment } from "../Models/Payment.js";


export const buySubscription = catchAsyncError(async (req, res, next)=> {

    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);

    if(user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscription", 400))
    
    if(!course) return next(new ErrorHandler("Course not found", 404))
        
    const plan_id=process.env.PLAN_ID || "plan_OcNNWiAQlcQVnx"

    const subscription = await instance.subscriptions.create({
            plan_id: plan_id,
            customer_notify: 1,
            quantity: 1,
            total_count: 12,
            
          }) 
           
    user.subscription.push({
        id: subscription.id,
        course: course._id,
        status: subscription.status,
        // payment: subscription
    })

    await user.save();

    res.status(201).json({
        success: true,
        subscriptionId: subscription.id,
    })

})


export const paymentVerification = catchAsyncError(async (req, res, next) => {
    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;
  
    const user = await User.findById(req.user._id);
  
    const Subscription = user.subscription.find(sub => sub.id === razorpay_subscription_id);
  
    if (!Subscription) {
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    }
  
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_payment_id + "|" + Subscription.id, "utf-8")
      .digest("hex");
  
    const isAuthentic = generated_signature === razorpay_signature;
  
    // if (!isAuthentic) {
    //   return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    // }

    if (!isAuthentic) {
      user.subscription = user.subscription.filter(sub => sub.id.toString() !== Subscription._id.toString());
      await user.save();
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
  }
  
    // Database update comes here
    
    await Payment.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    });
  
    Subscription.status = "active";
  
    await user.save();
  
    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  });

export const getRazorPayKey = catchAsyncError(async (req, res, next)=> {

    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })

})

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return next(new ErrorHandler("User not found", 404));
  
      const course = await Course.findById(req.query.id);
      if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  
      const subscription = user.subscription.find(sub => sub.course.toString() === course._id.toString());
      if (!subscription) return next(new ErrorHandler("Subscription not found", 404));
  
      const subscriptionId = subscription.id;
      console.log(subscriptionId);
      
      let refund = false;
  
      await instance.subscriptions.cancel(subscriptionId);
  
      const payment = await Payment.findOne({ razorpay_subscription_id: subscriptionId });
      if (!payment) return next(new ErrorHandler("Payment not found", 404));
  
      const gap = Date.now() - new Date(payment.createdAt).getTime();
      const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  
      if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
      }
  
      user.subscription = user.subscription.filter(sub => sub.course.toString() !== course._id.toString());
  
      await payment.deleteOne();
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: refund
          ? "Subscription cancelled, You will receive full refund within 7 days"
          : "Subscription cancelled, No refund initiated as subscription was cancelled after refund period"
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  });