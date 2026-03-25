import os
import re
import logging
from datetime import datetime, timezone, timedelta
import httpx
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
GITHUB_REPO = os.environ.get("GITHUB_REPO", "louisstein94/zkrune")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")


def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Welcome to zkrune Todo Bot!\n\n"
        "Commands:\n"
        "/addtodo <task> — Add a new task\n"
        "/bulkadd — Add multiple tasks (one per line)\n"
        "/show — List all tasks\n"
        "/done <number> — Mark a task as done\n"
        "/clear — Remove all completed tasks\n"
        "/devupdate — What did devs ship today?"
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


async def bulk_add(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = update.message.text or ""
    after_command = text.split(None, 1)
    if len(after_command) < 2:
        await update.message.reply_text(
            "Usage: /bulkadd\nTask one\nTask two\nTask three"
        )
        return

    lines = [line.strip() for line in after_command[1].splitlines() if line.strip()]
    if not lines:
        await update.message.reply_text("No tasks found. Put each task on a new line.")
        return

    chat_id = str(update.effective_chat.id)
    added_by = update.effective_user.username or update.effective_user.first_name

    rows = [
        {"chat_id": chat_id, "task": task, "added_by": added_by, "done": False}
        for task in lines
    ]

    db = get_supabase()
    db.table(TABLE).insert(rows).execute()

    await update.message.reply_text(f"✅ Added {len(rows)} tasks at once.")


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


async def summarize_with_claude(commit_messages: list[str], date_str: str) -> str:
    prompt = f"""You are the community update writer for zkRune, a zero-knowledge proof platform on Solana.

Below are the raw git commit messages from {date_str}. Your job is to translate them into a clear, engaging summary that non-technical community members can understand.

Rules:
- Write in English, friendly and confident tone
- Explain WHY each change matters to users, not just what it is
- Group related changes together under clear headings
- Use simple analogies for technical concepts (e.g. "zero-knowledge proofs = proving something without revealing private details")
- Keep it concise — max 2-3 sentences per point
- Use emojis sparingly for section headers
- End with a one-liner "TLDR" at the bottom
- Do NOT use markdown formatting (no **, no ##, no ```)
- Use plain text with emojis for headers

Commit messages:
{chr(10).join(f"- {m}" for m in commit_messages)}"""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )

    if resp.status_code != 200:
        logger.error("Claude API error: %s %s", resp.status_code, resp.text)
        return None

    data = resp.json()
    return data["content"][0]["text"]


async def dev_update(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    target_date = None
    if context.args:
        try:
            target_date = datetime.strptime(context.args[0], "%Y-%m-%d").date()
        except ValueError:
            await update.message.reply_text("Usage: /devupdate or /devupdate 2026-03-25")
            return

    today = target_date or datetime.now(timezone.utc).date()
    since = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    until = since + timedelta(days=1)

    url = f"https://api.github.com/repos/{GITHUB_REPO}/commits"
    params = {
        "since": since.isoformat(),
        "until": until.isoformat(),
        "per_page": 100,
    }

    await update.message.reply_text("Fetching today's commits and preparing summary...")

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=15)

    if resp.status_code != 200:
        await update.message.reply_text("Could not fetch GitHub data. Try again later.")
        return

    commits = resp.json()
    if not commits:
        date_str = today.strftime("%B %d, %Y")
        await update.message.reply_text(f"No commits found for {date_str}.")
        return

    messages = []
    authors = set()
    for c in commits:
        msg = c.get("commit", {}).get("message", "").split("\n")[0]
        author = c.get("commit", {}).get("author", {}).get("name", "Unknown")
        authors.add(author)
        messages.append(msg)

    date_str = today.strftime("%B %d, %Y")
    header = (
        f"🛠 Dev Update — {date_str}\n"
        f"📊 {len(commits)} commit(s) by {', '.join(authors)}\n\n"
    )

    if ANTHROPIC_API_KEY:
        summary = await summarize_with_claude(messages, date_str)
        if summary:
            await update.message.reply_text(header + summary)
            return

    fallback = "\n".join(f"• {m}" for m in messages)
    await update.message.reply_text(header + fallback)


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
    app.add_handler(CommandHandler("bulkadd", bulk_add))
    app.add_handler(CommandHandler("show", show))
    app.add_handler(CommandHandler("done", done))
    app.add_handler(CommandHandler("clear", clear))
    app.add_handler(CommandHandler("devupdate", dev_update))

    logger.info("zkrune Todo Bot is running...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
