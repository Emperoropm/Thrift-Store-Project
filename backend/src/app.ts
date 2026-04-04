import express from "express";
import cors from "cors";
import path from "path";

import AuthRouter from "./auth/auth.route";
import ProductRouter from "./product/product.route";
import OrderRouter from "./order/order.route";
import UserRouter from "./user/user.route";
import CategoryRouter from "./categories/categories.route"
import PaymentRouter from "./esewa/payment.routes";
import { errorHandler } from "./middleware/errorhandler";
import ratingRoutes from "./ratings/rating.route";
import ChatRouter from "./chat/chat.routes";
import PhoneRouter from "./phone/phoneRoutes.routes";
const app = express();

// Middleware
app.use(cors());           
app.use(express.json());    

// 👇 ADD THIS LINE - Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/users", UserRouter);
app.use("/api/category",CategoryRouter);
app.use("/api/payment/simple", PaymentRouter);
app.use("/api/ratings", ratingRoutes);
app.use('/api/chat', ChatRouter);
app.use('/api/phone', PhoneRouter);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../../frontend")));

// For any other route, serve index.html (for SPA-like behavior)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorHandler);
export default app;