const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "in-progress", "completed"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);
const Todo = mongoose.model("Todo", todoSchema);

module.exports = { Todo };
