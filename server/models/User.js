import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [80, 'Name cannot exceed 80 characters.']
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters.'],
      maxlength: [24, 'Username cannot exceed 24 characters.'],
      match: [/^[a-z0-9_]+$/, 'Username can contain lowercase letters, numbers, and underscores only.']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [280, 'Bio cannot exceed 280 characters.'],
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false
    }
  },
  { timestamps: true, versionKey: false }
);

userSchema.set('toJSON', {
  transform(_document, returned) {
    delete returned.password;
    return returned;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
