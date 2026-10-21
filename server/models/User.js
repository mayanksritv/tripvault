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
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true
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
