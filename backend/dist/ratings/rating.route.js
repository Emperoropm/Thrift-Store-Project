"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rating_controller_1 = require("./rating.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
const ratingController = new rating_controller_1.RatingController();
// Rate a seller
router.post("/rate-seller", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), ratingController.rateSeller);
// Get seller ratings
router.get("/seller/:sellerId", ratingController.getSellerRatings);
exports.default = router;
//# sourceMappingURL=rating.route.js.map