const express = require("express");
const { connectDb } = require("./src/config/connectDb"); // Fixed typo in 'conenctDb' -> 'connectDb'
const { Todo } = require("./src/models/todo");
const mongoose = require("mongoose");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// POST route to create a new task (Todo)
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
      return res
        .status(400)
        .send("Missing required fields: title, description, and status.");
    }

    const todo = new Todo({
      title,
      description,
      status,
    });

    await todo.save();
    res.status(201).send({ message: "Todo saved successfully", todo }); // Respond with the saved todo
  } catch (error) {
    console.error("Error while adding todo:", error.message);
    res.status(500).send("Enter a valid todo");
  }
});

app.get("/tasks", async (req, res) => {
  try {
    // Fetch all Todo items from the database
    const todos = await Todo.find();

    if (!todos.length) {
      return res.status(404).send({ message: "No todos found" });
    }

    // Send the todos back as a response
    res.status(200).send(todos);
  } catch (error) {
    console.error("Error while fetching todos:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/tasks/:id", async (req, res) => {
  // Extract the 'id' parameter from the URL
  try {
    const todoId = req.params.id;

    // Fetch the Todo item from the database by its ID
    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).send({ message: "Todo not found" });
    }

    // Send the Todo item back as a response
    res.status(200).send(todo);
  } catch (error) {
    console.error("Error while fetching todo by id:", error.message);
    res.status(500).send("Internal Server Error");
  }
});
// PUT route to update a task (Todo) by its ID
app.put("/tasks/:id", async (req, res) => {
  // Extract the 'id' parameter from the URL
  try {
    const todoId = req.params.id;
    // Get the new data from the request body
    const { title, description, status } = req.body;

    // Check if all required fields are provided
    if (!title || !description || !status) {
      return res.status(400).send({
        message: "Missing required fields: title, description, and status.",
      });
    }

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).send({ message: "Invalid ID format" });
    }

    // Find the Todo item by its ID and update it
    const todo = await Todo.findByIdAndUpdate(
      todoId,
      { title, description, status },
      { new: true, runValidators: true }
    );

    // If no Todo item was found with the given ID, return a 404
    if (!todo) {
      return res.status(404).send({ message: "Todo not found" });
    }

    // Respond with the updated Todo item
    res.status(200).send({ message: "Todo updated successfully", todo });
  } catch (error) {
    console.error("Error while updating todo:", error.message);
    res.status(500).send("Internal Server Error");
  }
});
// DELETE route to delete a task (Todo) by its ID
app.delete("/tasks/:id", async (req, res) => {
  // Extract the 'id' parameter from the URL
  try {
    const todoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).send({ message: "Invalid ID format" });
    }

    // Attempt to find and delete the Todo item by its ID
    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    // If no Todo item was found with the given ID, return a 404
    if (!deletedTodo) {
      return res.status(404).send({ message: "Todo not found" });
    }

    // Respond with a success message and the deleted Todo item
    res
      .status(200)
      .send({ message: "Todo deleted successfully", todo: deletedTodo });
  } catch (error) {
    console.error("Error while deleting todo:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Connect to the database and start the server
connectDb()
  .then(() => {
    console.log("Database connection established");
    app.listen(6666, () => {
      console.log("Server is running at http://localhost:6666");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
