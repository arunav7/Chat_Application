const users = []

const addUsers = ({id, username, room}) => {
    // Clean Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room)
        return {
            error: 'Username and room are required'
        }
    
    // Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser)
        return {
            error: 'Username is in use!'
        }
    
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1)
        return users.splice(index, 1)[0]
}

const getUser = (id) => {
    return users.find((user) => user.id == id)
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room == room)
}

module.exports = {
    addUsers,
    removeUser,
    getUser,
    getUserInRoom
}