require('../db/mongoose')
const path = require('path')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/utils')
const { addUsers, removeUser, getUser, getUserInRoom } = require('./utils/users')
const User = require('../model/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.post('/sign_up', async (req, res) => {
    try{
        const user = new User({
            email: req.body.email,
            password: req.body.password
        })
        await user.save()
        res.redirect('../public/home.html')
    } catch(e) {
        res.send(e)
    }
})

app.get('/', (req, res) => {
    res.set({
        'Access-control-Allow-Origin': '*'
    })
    return res.redirect('../public/index.html')
})

io.on('connection', (socket) => {
    console.log('New WebSocket connection established')

    socket.on('join', (options, callback) => {       // options contains username and room as the object sent by client
        const {error, user} = addUsers({id: socket.id, ...options})  // socket.id is the id provided by socket obj
        const _id = user.id
        if(error)
            return callback(error)
        
        // io.emit('roomList', () => {
        //     return Object.keys(socket.rooms).filter((item) => item !== socket.id )
        // })

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome to chat app!!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if(filter.isProfane(message))
            return callback('Profanity is not allowed')
        
        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback()
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        if(user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps/?q=${location.lat},${location.long}`))
            callback('Location Shared')
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) 
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the chat room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
    })
})

server.listen(port, () => {
    console.log('Server is up on port ', port)
})