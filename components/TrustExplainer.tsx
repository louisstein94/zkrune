"use client";

export default function TrustExplainer() {
  return (
    <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl">🔐</div>
        <div>
          <h3 className="font-hatton text-2xl text-white mb-3">
            How Do You Know This is Real?
          </h3>
          <p className="text-zk-gray leading-relaxed">
            Great question! You shouldn't just trust us. Here's how you can verify yourself:
          </p>
        </div>
      </div>

      {/* Simple Explanation */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Download Your Proof</h4>
            <p className="text-sm text-zk-gray leading-relaxed">
              Click the "Download" button above. You'll get a small file (~2KB) containing your proof.
              This is like getting a receipt - it proves what you did.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Use a Checking Tool</h4>
            <p className="text-sm text-zk-gray leading-relaxed mb-3">
              Think of this like checking if a password is correct - but for math problems.
              You can use free tools (like a calculator) to check if the proof is real.
            </p>
            <div className="flex gap-3">
              <a
                href="/verify-proof"
                className="px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm hover:bg-zk-primary/20 transition-all"
              >
                Use Our Verification Tool
              </a>
              <a
                href="https://zkp.science/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-zk-gray/30 text-zk-gray rounded-lg text-sm hover:border-zk-primary hover:text-zk-primary transition-all"
              >
                External Verifier
              </a>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Math Never Lies</h4>
            <p className="text-sm text-zk-gray leading-relaxed">
              If the proof is valid, it's <span className="text-white font-medium">mathematically impossible</span> to fake.
              It's like solving a Sudoku - either the answer is correct, or it's not.
              No trust needed!
            </p>
          </div>
        </div>
      </div>

      {/* Analogy */}
      <div className="mt-8 p-4 bg-zk-secondary/10 border border-zk-secondary/20 rounded-xl">
        <p className="text-sm text-white font-medium mb-2">🧩 Think of it like this:</p>
        <p className="text-xs text-zk-gray leading-relaxed">
          zkRune is like a <span className="text-white">puzzle maker</span>. 
          We create a puzzle (the proof) that proves you're 18+ without showing your birthday.
          Anyone with a <span className="text-white">puzzle checker</span> (verification tool) 
          can confirm the puzzle is solved correctly - no need to trust us!
        </p>
      </div>

      {/* Technical Note */}
      <details className="mt-6">
        <summary className="text-sm text-zk-primary cursor-pointer hover:underline">
          For Technical Users (Click to Expand)
        </summary>
        <div className="mt-3 p-4 bg-black/20 rounded-lg">
          <p className="text-xs text-zk-gray leading-relaxed space-y-2">
            <span className="block"><span className="text-white font-medium">Proof:</span> Cryptographic data proving a statement is true</span>
            <span className="block"><span className="text-white font-medium">Public Signals:</span> The statement being proven (e.g., "age ≥ 18")</span>
            <span className="block"><span className="text-white font-medium">Verification Key:</span> Mathematical formula to check if proof is valid</span>
            <span className="block mt-2 pt-2 border-t border-zk-gray/20">
              These use <span className="text-zk-primary">zk-SNARKs</span> (Groth16 protocol) - 
              the same technology used by Zcash, zkSync, and other major privacy protocols.
            </span>
          </p>
        </div>
      </details>
    </div>
  );
}

