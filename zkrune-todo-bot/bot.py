import os
import logging
from datetime import datetime, timezone
from supabase import create_client, Client
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

TABLE = "bot_todos"


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Welcome to zkrune Todo Bot!\n\n"
        "Commands:\n"
        "/addtodo <task> — Add a new task\n"
        "/show — List all tasks\n"
        "/done <number> — Mark a task as done\n"
        "/clear — Remove all completed tasks"
    )


async def add_todo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("Usage: /addtodo <task description>")
        return

    task_text = " ".join(context.args)
    chat_id = str(update.effective_chat.id)
    added_by = update.effective_user.username or update.effective_user.first_name

    db = get_supabase()
    db.table(TABLE).insert({
        "chat_id": chat_id,
        "task": task_text,
        "added_by": added_by,
        "done": False,
    }).execute()

    await update.message.reply_text(f"✅ Added: {task_text}")


async def show(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    db = get_supabase()

    result = db.table(TABLE) \
        .select("*") \
        .eq("chat_id", chat_id) \
        .order("created_at") \
        .execute()

    todos = result.data
    if not todos:
        await update.message.reply_text("No tasks yet. Use /addtodo to add one.")
        return

    lines = []
    for i, item in enumerate(todos, 1):
        status = "✅" if item["done"] else "⬜"
        lines.append(f"{i}. {status} {item['task']}")

    pending = sum(1 for t in todos if not t["done"])
    header = f"📋 Todo List ({pending} pending)\n"
    await update.message.reply_text(header + "\n".join(lines))


async def done(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("Usage: /done <task number>")
        return

    try:
        index = int(context.args[0]) - 1
    except ValueError:
        await update.message.reply_text("Please provide a valid task number.")
        return

    chat_id = str(update.effective_chat.id)
    db = get_supabase()

    result = db.table(TABLE) \
        .select("id") \
        .eq("chat_id", chat_id) \
        .order("created_at") \
        .execute()

    todos = result.data
    if index < 0 or index >= len(todos):
        await update.message.reply_text("Invalid task number.")
        return

    todo_id = todos[index]["id"]
    db.table(TABLE).update({"done": True}).eq("id", todo_id).execute()

    updated = db.table(TABLE).select("task").eq("id", todo_id).execute()
    task_name = updated.data[0]["task"] if updated.data else "task"
    await update.message.reply_text(f"✅ Marked as done: {task_name}")


async def clear(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    db = get_supabase()

    result = db.table(TABLE) \
        .select("id") \
        .eq("chat_id", chat_id) \
        .eq("done", True) \
        .execute()

    if not result.data:
        await update.message.reply_text("No completed tasks to clear.")
        return

    for item in result.data:
        db.table(TABLE).delete().eq("id", item["id"]).execute()

    await update.message.reply_text(f"🗑 Cleared {len(result.data)} completed task(s).")


def main() -> None:
    if not TELEGRAM_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set.")
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_KEY is not set.")

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("addtodo", add_todo))
    app.add_handler(CommandHandler("show", show))
    app.add_handler(CommandHandler("done", done))
    app.add_handler(CommandHandler("clear", clear))

    logger.info("zkrune Todo Bot is running...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
