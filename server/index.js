const { Server } = require("socket.io")

const io = new Server(8000, {
    cors: true
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
io.on("connection", (socket) => {
    console.log(`socket connected , ${socket.id}`);
    socket.on("joinRoom", (data) => {
        const { email, roomno } = data
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(roomno).emit("userJoined", { email, id: socket.id })
        socket.join(roomno);

        io.to(socket.id).emit("joinRoom", data);

    });
    socket.on("userCall", ({ to, offer }) => {
        console.log("user call", to);
        io.to(to).emit("incomingCall", { from: socket.id, offer })
    })

    socket.on("callAccepted", ({ to, ans }) => {
        io.to(to).emit("callAccepted", { from: socket.id, ans })

    })

    socket.on("peerNegNeed", ({ to, offer }) => {
        io.to(to).emit("peerNegNeed", { from: socket.id, offer })
    })

    socket.on("negoDone", ({ to, ans }) => {
        io.to(to).emit("negoFinal", { from: socket.id, ans })
    })
})