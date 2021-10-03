const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    provider: String,
    external_id: String,
    display_name: String
});

mongoose.model('User', UserSchema);