import mongoose from "mongoose";
const Schema = mongoose.Schema;
const loginSchema = new Schema({
username: { type: String, required: true },
  password:{type: String, required: true}
}
);
 const login = mongoose.model("loginSchema", loginSchema);
 export default login


