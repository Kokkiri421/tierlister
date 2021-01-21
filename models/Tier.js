const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var TierSchema = new Schema({
    name: { 
        type: String,  
        required: true, 
        maxlength: 8
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    elements: [{  
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Element' 
    }],
    tierlist: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tierlist',
        required: true
    },
    
})


TierSchema.pre('remove', async function remove(next) {
    try {
        var tierlist = await this.model('Tierlist').findOne({_id: this.tierlist}).exec();
        await tierlist.tiers.pull(this._id);
        await tierlist.save();
        await this.model('Element').deleteMany({tier: this._id}).exec();
        return next();
    } catch (err) {
        return next(err);
    }
});

TierSchema.pre('find', function(next) {
    this.populate('elements');
    next();
});

TierSchema.pre('findOne', function(next) {
    this.populate('elements');
    next();
});


module.exports = mongoose.model('Tier', TierSchema);