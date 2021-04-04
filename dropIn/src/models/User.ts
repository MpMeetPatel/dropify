import argon2 from "argon2";
import { Document, model, Model, Schema } from "mongoose";

enum userRoles {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  role?: string;
  password: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date | number;
  profilePic?: string;
  bio?: string;
  stripeAccountId?: string;
  stripeAccount?: any;
  stripeSession?: any;
  correctPassword: Function;
  isPasswordChangedAfterSignIn: Function;
  generatePasswordToken: Function;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, min: 4, unique: true },
    firstName: { type: String, required: true, min: 2 },
    lastName: { type: String, required: true, min: 2 },
    userName: { type: String, required: true, min: 2, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: userRoles, // you can add as many as roles you like
      default: userRoles.USER,
    },
    passwordResetToken: String,
    passwordResetExpiry: Date,
    profilePic: { type: String },
    bio: { type: String },
    stripeAccountId: { type: String },
    stripeAccount: { type: Object },
    stripeSession: { type: Object },
    createdAt: Date,
    updatedAt: Date,
  }
);

UserSchema.methods.correctPassword = async function (
  hashedPass,
  plainPass
): Promise<Boolean> {
  const isCorrectPassword = await argon2.verify(hashedPass, plainPass);
  return isCorrectPassword;
};

UserSchema.methods.isPasswordChangedAfterSignIn = function (
  JWTTimeStamp
): Boolean {
  // @ts-ignore
  if (this.passwordChangedAt) {
    const changedPassTimeStamp = parseInt(
      // @ts-ignore
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedPassTimeStamp; // 10000 < 40000
  }

  return false;
};

export const User: Model<IUser> = model("User", UserSchema);