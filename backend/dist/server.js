"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const chat_socket_1 = require("./chat/chat.socket");
const chat_routes_1 = __importDefault(require("./chat/chat.routes"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
// Add chat routes to app
app_1.default.use('/api/chat', chat_routes_1.default);
// Create HTTP server from express app
const server = http_1.default.createServer(app_1.default);
// Initialize socket chat and store io instance
const io = (0, chat_socket_1.chatSocket)(server);
// Make io available in routes/controllers
app_1.default.set('io', io);
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map