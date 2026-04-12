module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log(`User connected to signaling server: ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {
      console.log(`User ${userId} joining room ${roomId}`);
      socket.join(roomId);
      // Notify others in the room
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });

    // WebRTC signaling
    socket.on('offer', (payload) => {
      io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
      io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (incoming) => {
      io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    });
  });
};
