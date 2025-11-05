"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "agentic-todo-items";
const filters = ["all", "active", "completed"] as const;
type Filter = (typeof filters)[number];

const createTodo = (text: string): Todo => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text,
  completed: false,
  createdAt: Date.now(),
});

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: Todo[] = JSON.parse(stored);
      return parsed
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter(Boolean);
    } catch (error) {
      console.error("Failed to parse todos", error);
      return [];
    }
  });

  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [filter, todos]);

  const incompleteCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setTodos((prev) => [createTodo(trimmed), ...prev]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-zinc-100 via-white to-sky-100 px-4 py-16 text-zinc-900">
      <main className="flex w-full max-w-3xl flex-col gap-10 rounded-3xl bg-white/80 p-10 shadow-xl ring-1 ring-zinc-200 backdrop-blur sm:p-12">
        <header className="flex flex-col gap-5">
          <p className="text-sm uppercase tracking-[0.4em] text-sky-600">
            Today&apos;s Focus
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900 sm:text-5xl">
            Things to get done
          </h1>
          <p className="text-base text-zinc-500">
            Capture what&apos;s on your mind, check off progress, and keep your day
            organized.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-5 shadow-inner sm:flex-row sm:items-center"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Add a new task..."
            className="flex-1 rounded-xl border border-sky-200 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            aria-label="Task description"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-sky-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Add Task
          </button>
        </form>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-500">
              {todos.length === 0
                ? "No tasks yet. Add your first one."
                : `${incompleteCount} task${incompleteCount === 1 ? "" : "s"} remaining`}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                    filter === option
                      ? "bg-sky-500 text-white shadow"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-full px-4 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!todos.some((todo) => todo.completed)}
              >
                Clear completed
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={
                    todo.completed
                      ? "Mark todo as incomplete"
                      : "Mark todo as complete"
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    todo.completed
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-zinc-300 text-zinc-400 hover:border-sky-400"
                  }`}
                >
                  {todo.completed ? "✓" : ""}
                </button>
                <div className="flex-1">
                  <p
                    className={`text-base ${
                      todo.completed
                        ? "text-zinc-400 line-through"
                        : "text-zinc-800"
                    }`}
                  >
                    {todo.text}
                  </p>
                  <time
                    className="block text-xs text-zinc-400"
                    dateTime={new Date(todo.createdAt).toISOString()}
                  >
                    Added {new Date(todo.createdAt).toLocaleString()}
                  </time>
                </div>
                <button
                  type="button"
                  onClick={() => removeTodo(todo.id)}
                  className="rounded-xl border border-transparent px-3 py-2 text-sm text-zinc-400 transition hover:border-red-100 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {filteredTodos.length === 0 && todos.length > 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
              No tasks match this filter.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
