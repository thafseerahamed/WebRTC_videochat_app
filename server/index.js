const { Server } = require("socket.io")

const io = new Server(8000,{
    cors:true
});

const emailToSocketIdMap =new Map();
const socketIdToEmailMap = new Map();
io.on("connection", (socket) => {
    console.log(`socket connected , ${socket.id}`);
    socket.on("joinRoom", (data) => {
        const {email,roomno} = data
        emailToSocketIdMap.set(email,socket.id);
        socketIdToEmailMap.set(socket.id,email);
        io.to(socket.id).emit("joinRoom",data);
        
    });
})