import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zk-darker flex items-center justify-center px-8">
      <div className="text-center">
        {/* Large Rune */}
        <div className="text-9xl mb-8 animate-float">ᚱ</div>

        {/* 404 */}
        <h1 className="font-hatton text-8xl text-white mb-4">
          4<span className="text-zk-primary">0</span>4
        </h1>

        <h2 className="font-hatton text-3xl text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-xl text-zk-gray mb-8 max-w-md mx-auto">
          The runes couldn't locate this page. Perhaps it was hidden by a
          zero-knowledge spell?
        </p>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
          >
            ← Back to Home
          </Link>
          <Link
            href="/#templates"
            className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:bg-zk-primary/10 transition-all"
          >
            Browse Templates
          </Link>
        </div>

        {/* Help */}
        <div className="mt-12 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl inline-block">
          <p className="text-sm text-zk-gray mb-3">Looking for something?</p>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-zk-primary hover:underline">
              Home
            </Link>
            <Link href="/#templates" className="text-zk-primary hover:underline">
              Templates
            </Link>
            <Link href="/dashboard" className="text-zk-primary hover:underline">
              Dashboard
            </Link>
            <Link href="/#faq" className="text-zk-primary hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

