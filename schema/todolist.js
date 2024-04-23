import mongoose from "mongoose";
const Schema = mongoose.Schema;
const todolist = new Schema(
  {
    description: { type: String, required: true },
    status: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: "created_at", 
      updatedAt: "updated_at", 
    },
  }
);
const todolistData = mongoose.model("todolist", todolist);
export default todolistData
