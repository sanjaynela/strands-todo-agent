import { Agent, tool } from "@strands-agents/sdk";
import { z } from "zod";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [];
let nextId = 1;

const addTodoTool = tool({
  name: "add_todo",
  description: "Add a new task to the to-do list",
  inputSchema: z.object({
    title: z.string().min(1).describe("The task title")
  }),
  callback: async (input) => {
    const todo: Todo = {
      id: nextId++,
      title: input.title,
      completed: false
    };

    todos.push(todo);

    return {
      message: `Added task: ${todo.title}`,
      todo
    };
  }
});

const listTodosTool = tool({
  name: "list_todos",
  description: "Return all tasks in the to-do list",
  callback: async () => {
    return {
      todos,
      count: todos.length
    };
  }
});

const completeTodoTool = tool({
  name: "complete_todo",
  description: "Mark a task as completed using its ID",
  inputSchema: z.object({
    id: z.number().int().positive().describe("The ID of the task to complete")
  }),
  callback: async (input) => {
    const todo = todos.find((item) => item.id === input.id);

    if (!todo) {
      return {
        ok: false,
        message: null,
        todo: null,
        error: `Task with id ${input.id} was not found.`
      };
    }

    todo.completed = true;

    return {
      ok: true,
      message: `Completed task: ${todo.title}`,
      todo,
      error: null
    };
  }
});

const deleteTodoTool = tool({
  name: "delete_todo",
  description: "Delete a task using its ID",
  inputSchema: z.object({
    id: z.number().int().positive().describe("The ID of the task to delete")
  }),
  callback: async (input) => {
    const index = todos.findIndex((item) => item.id === input.id);

    if (index === -1) {
      return {
        ok: false,
        message: null,
        todo: null,
        error: `Task with id ${input.id} was not found.`
      };
    }

    const [removed] = todos.splice(index, 1);

    return {
      ok: true,
      message: `Deleted task: ${removed.title}`,
      todo: removed,
      error: null
    };
  }
});

const agent = new Agent({
  systemPrompt: `
You are a helpful to-do assistant.
Your job is to manage the user's task list using the tools provided.

Rules:
- Use add_todo when the user asks to add a task.
- Use list_todos when the user wants to see their tasks.
- Use complete_todo when the user asks to finish a task.
- Use delete_todo when the user asks to remove a task.
- Be concise, friendly, and accurate.
- If the user refers to a task ambiguously, first inspect the current list.
`,
  tools: [addTodoTool, listTodosTool, completeTodoTool, deleteTodoTool],
  printer: false
});

async function main() {
  const prompts = [
    "Add a task to review Security Hub findings tomorrow morning.",
    "Add a task to fix the public S3 bucket issue.",
    "Show me my tasks.",
    "Mark task 1 as done.",
    "List my tasks again.",
    "Delete task 2.",
    "Show my final to-do list."
  ];

  for (const prompt of prompts) {
    console.log(`\nUser: ${prompt}`);
    const response = await agent.invoke(prompt);
    console.log("Agent:", response.toString());
  }
}

main().catch((error) => {
  console.error("Error running agent:", error);
  process.exitCode = 1;
});
