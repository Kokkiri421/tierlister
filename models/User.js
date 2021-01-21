const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: {
        type: String, 
        lowercase: true, 
        required: true,
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true,
        maxlength: 16,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    tierlists:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tierlist'
    }]
});

UserSchema.plugin(uniqueValidator);


UserSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});


UserSchema.methods.validatePassword = async function validatePassword(data) {
    return await bcrypt.compare(data,this.password);
};

UserSchema.pre('find', function(next) {
    this.populate('tierlists');
    next();
});

UserSchema.pre('findOne', function(next) {
    this.populate('tierlists');
    next();
});

module.exports = mongoose.model('User', UserSchema);

