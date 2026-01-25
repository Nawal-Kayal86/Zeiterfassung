import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "admin", "employee"], default: "user" },
  department: { type: String, default: null },
  nfc_tag: { type: String, default: null, unique: true, sparse: true },
  password_hash: { type: String, required: true },
  start_date: { type: Date, default: null },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
