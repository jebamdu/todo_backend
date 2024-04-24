import mongoose from "mongoose";
const Schema = mongoose.Schema;
const project = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  todo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'todolist' }],
  userID: { type: Schema.Types.ObjectId },
  id: { type: Schema.Types.ObjectId },
},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);


const projectData = mongoose.model("project", project);

export default projectData

