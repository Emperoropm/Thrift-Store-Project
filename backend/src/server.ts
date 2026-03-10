import "reflect-metadata";
import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { chatSocket } from "./chat/chat.socket";
import chatRoutes from "./chat/chat.routes";

dotenv.config();

const port = process.env.PORT || 3000;

// Add chat routes to app
app.use('/api/chat', chatRoutes);

// Create HTTP server from express app
const server = http.createServer(app);

// Initialize socket chat and store io instance
const io = chatSocket(server);

// Make io available in routes/controllers
app.set('io', io);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});