require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const onlineUsers = new Map();

connectDB().then(() => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user_online", ({ userId }) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("join_group", (groupId) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on("send_message", (messageData) => {
      io.to(messageData.groupId).emit("receive_message", messageData);
    });

    socket.on("typing", (data) => {
      socket.to(data.groupId).emit("user_typing", data);
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.groupId).emit("user_stop_typing", data);
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }

      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
