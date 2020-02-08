const mongoose = require('mongoose')
const {matches} = require('validator')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!matches(value, /[A-Z0-9]+\@[A-Z]+\.([a-z]{2}\.[a-z]{2}|[a-z]{3})$/gmi))
              throw new Error('Invalid Email')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(value < 6 || matches(value, /(password)+|(pass)+|(word)+/gmi))
              throw new Error('Invalid Password')
        }
    }
},{
    timestamps: true
})

const User = mongoose.model('User', userSchema)

module.exports = User