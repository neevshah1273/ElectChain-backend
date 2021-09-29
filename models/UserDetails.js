import mongoose from 'mongoose';

export const userSchema = mongoose.Schema({
    username : {type: String, required: true, unique: true },
    password : {type: String, required: true},
    id : {type: String}
});

const User = mongoose.model('User', userSchema);

export default User;