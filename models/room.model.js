const mongoose = require('mongoose')

const RoomSchema = mongoose.Schema({
    roomId: {type: String, require: true},
    owner: {type: String, require: true},
    guests: {type: Array, require: true},
})

module.exports = mongoose.model('Room', RoomSchema, 'room')