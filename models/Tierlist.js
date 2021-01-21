const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var TierlistSchema = new Schema({
    name: {
        type: String,  
        required: true,
        index: true,
        maxlength: 32,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    tiers: [{  
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tier' 
    }],
    
});

TierlistSchema.pre('remove', async function remove(next) {
    try {
        var user = await this.model('User').findOne({_id: this.owner}).exec();
        await user.tierlists.pull(this._id);
        await user.save();
        await this.model('Tier').deleteMany({tierlist: this._id}).exec();
        return next();
    } catch (err) {
        return next(err);
    }
});

TierlistSchema.pre('find', function(next) {
    this.populate('tiers');
    next();
});

TierlistSchema.pre('findOne', function(next) {
    this.populate('tiers');
    next();
});

module.exports = mongoose.model('Tierlist', TierlistSchema);