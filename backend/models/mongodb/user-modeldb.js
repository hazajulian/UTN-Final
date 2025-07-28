// Modelo de User con hashing de password, sesión y flujo de reset de contraseña
import mongoose from 'mongoose';
import { hashPassword, verifyPassword, makeSessionToken } from '../../utils/crypto-service.js';

const UserSchema = new mongoose.Schema(
  {
    username:            { type: String, required: true, unique: true },
    email:               { type: String, required: true, unique: true },
    password:            { type: String, required: true, select: false },
    sessionToken:        { type: String },
    isAdmin:             { type: Boolean, default: false },
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
    customChampions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Champion' }]
  },
  { timestamps: true }
);

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = hashPassword(this.password);
  }
  next();
});

UserSchema.methods.verifyPassword = function(plain) {
  return verifyPassword(plain, this.password);
};

UserSchema.methods.generateSessionToken = function() {
  const token = makeSessionToken();
  this.sessionToken = token;
  return token;
};

export const User = mongoose.model('User', UserSchema);