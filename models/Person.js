const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum : ['KING', 'QUEEN', 'MEN', 'WOMEN'],
        required: true
    },
    username: {
        type: String,
    
    },
    website: {
        type: String
    },
    country: {
        type: String
    }
   
});

module.exports = Person = mongoose.model("myPerson", PersonSchema);