"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_route_1 = __importDefault(require("./auth/auth.route"));
const product_route_1 = __importDefault(require("./product/product.route"));
const order_route_1 = __importDefault(require("./order/order.route"));
const user_route_1 = __importDefault(require("./user/user.route"));
const categories_route_1 = __importDefault(require("./categories/categories.route"));
const payment_routes_1 = __importDefault(require("./esewa/payment.routes"));
const errorhandler_1 = require("./middleware/errorhandler");
const rating_route_1 = __importDefault(require("./ratings/rating.route"));
const chat_routes_1 = __importDefault(require("./chat/chat.routes"));
const phoneRoutes_routes_1 = __importDefault(require("./phone/phoneRoutes.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 👇 ADD THIS LINE - Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/products", product_route_1.default);
app.use("/api/orders", order_route_1.default);
app.use("/api/users", user_route_1.default);
app.use("/api/category", categories_route_1.default);
app.use("/api/payment/simple", payment_routes_1.default);
app.use("/api/ratings", rating_route_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/phone', phoneRoutes_routes_1.default);
// Serve static files from frontend directory
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend")));
// For any other route, serve index.html (for SPA-like behavior)
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../frontend/index.html"));
});
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use(errorhandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map