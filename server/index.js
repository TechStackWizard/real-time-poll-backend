import express from "express"
import cors from "cors"

import mongodb from "./config/db.js";
import pollRoute from "./routes/pollRoute.js";

import http from "http";
import { Server } from "socket.io";


const app = express();

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, "https://real-time-poll-beta.vercel.app"],
    credentials: true,
}));
app.use(express.json());
mongodb();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("User Connected : ", socket.id);

    socket.on("joinPoll", (pollId) => {
        socket.join(pollId);
        console.log(`User joined poll room : ${pollId}`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected!");

    });
})

app.use("/api/polls", pollRoute);

// Test Route
app.get("/", (req, res) => {
    res.send("Poll Rooms Backend is Running 🚀");
});

// Server Start
server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});

export default io;