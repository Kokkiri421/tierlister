const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ElementSchema = new Schema({
    name: { 
        type: String,  
        required: true, 
        maxlength: 32
    },
    imageURL: {
        type: String,
        match: [/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|bmp)/i, 'invalid url']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    tier: {  
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tier',
        required: true 
    },
})

ElementSchema.pre('remove', async function remove(next) {
    try {
        var tier = await this.model('Tier').findOne({_id: this.tier}).exec();
        await tier.elements.pull(this._id);
        await tier.save();
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model('Element', ElementSchema);