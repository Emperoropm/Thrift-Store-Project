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
exports.UserModel = void 0;
const class_validator_1 = require("class-validator");
class UserModel {
    id;
    name;
    email;
    password;
    constructor(name, email, password, id) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
exports.UserModel = UserModel;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserModel.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: "Name must be at least 2 characters" }),
    __metadata("design:type", String)
], UserModel.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Invalid email" }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Password must be at least 6 characters" }),
    __metadata("design:type", String)
], UserModel.prototype, "password", void 0);
//# sourceMappingURL=user.model.js.map