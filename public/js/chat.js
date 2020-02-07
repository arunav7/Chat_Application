const socket = io()

// Elements
$messageForm = document.querySelector('#form-id')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$locationButton = document.querySelector('#send-location')
$messagesDiv = document.querySelector('#message-div')

// templates
messageTemplate = document.querySelector('#message-template').innerHTML
locationTemplate = document.querySelector('#location-template').innerHTML
sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
// location.search is an object provided by js which contains qurey string parameters
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoScroll = () => {
    const $newMessage = $messagesDiv.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messagesDiv.offsetHeight

    const containerHeight = $messagesDiv.scrollHeight

    const scrollOffset = $messagesDiv.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
        $messagesDiv.scrollTop = $messagesDiv.scrollHeight
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', ( locationUrl ) => {
    console.log(locationUrl)
    const html = Mustache.render(locationTemplate ,{
        username: locationUrl.username,
        url: locationUrl.url,
        createdAt: moment(locationUrl.createdAt).format('hh:mm A')
    })
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', (message) => {
    const html = Mustache.render(sideBarTemplate, {
        room: message.room,
        users: message.users
    })
    document.getElementById('sidebar-div').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = document.getElementById('msg').value
    //const msg = e.target.elements.msg.value
    socket.emit('sendMessage', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error)
            return console.log(error)
        
        console.log('Message Delivered!!!')

    })
})

$locationButton.addEventListener('click', () =>{
    
    $locationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation)
        return alert('Geoloction is not supported by your browser')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (message) => {
            $locationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})