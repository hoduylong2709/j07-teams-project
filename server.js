const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const mongoose = require('mongoose');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

//schema model
const User = require('./models/user.model');
const Room = require('./models/room.model');

app.set("view engine", "ejs");
app.use(express.static("public"));

//connect mongodb
mongoose.connect(
  'mongodb+srv://admin:e2HQbjsiUAvimGc@cluster0.8jo3b.mongodb.net/java07-video-call?retryWrites=true&w=majority',
   { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log('Mongodb connected');
  })

app.use('/peerjs', peerServer);

app.get("/", (req, rsp) => {
  //id owner test, will be updated after finish login
  let owner = mongoose.Types.ObjectId().toHexString()
  let roomId = uuidv4();
  let room = {
    roomId: roomId,
    owner: owner,
    guests: []
  }

  Room.insertMany(room)

  rsp.redirect(`/${roomId}`);
});

app.get("/:room", async (req, res) => {
  let roomId = req.params.room;
  res.render("room", { roomId: roomId });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    ////id guest test, will be updated after finish login
    let guest = mongoose.Types.ObjectId().toHexString()
    Room.updateOne(
      {'roomId': roomId},
      {'$push': {'guests': guest}},
      (err, docs) => {
        if (err) throw err
      }
    )

    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message);
    });
  });
});

server.listen(process.env.PORT || 3030);
