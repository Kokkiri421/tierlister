const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({username: jwt_payload.username}, function(err, user) {
       
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, {name:'Unauthorized', message: "Unauthorized"}); 
        }
    });
}));

module.exports = passport;