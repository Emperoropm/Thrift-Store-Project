"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const orderItem_model_1 = require("./orderItem.model");
class OrderModel {
    buyerId;
    total;
    items;
    createdAt;
    constructor(buyerId, total, items, createdAt) {
        this.buyerId = buyerId;
        this.total = total;
        this.items = items;
        this.createdAt = createdAt;
    }
}
exports.OrderModel = OrderModel;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "buyerId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => orderItem_model_1.OrderItemModel),
    (0, class_validator_1.ArrayMinSize)(1, { message: "Order must have at least one item" }),
    __metadata("design:type", Array)
], OrderModel.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], OrderModel.prototype, "createdAt", void 0);
//# sourceMappingURL=order.model.js.map