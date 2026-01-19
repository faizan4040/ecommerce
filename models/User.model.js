import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  role:{
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user'
  },
  name: {
    type: String,
    required: true,
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
  
  avtar: {
    url: {
        type: String,
        trim: true,
    },
    public_id: {
        type: String,
        trim: true,
    },

  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
  },

  address:{
    type: String,
    trim: true,
  },
  deletedAt:{
    type: Date,
    default: null,
    index: true,
  },

}, { timestamps: true })


UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


UserSchema.method = {
    comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }
}


const UserModel = mongoose.models.User || mongoose.model('User', UserSchema, 'users');
export default UserModel;