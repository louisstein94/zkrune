"use client";

export default function TrustExplainer() {
  return (
    <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <svg className="w-12 h-12 text-zk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
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
            <p className="text-sm text-zk-gray leading-relaxed mb-3">
              Scroll up to "Export Proof" section above this box. You'll see three tabs:
            </p>
            <div className="space-y-2 text-xs bg-zk-darker/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-zk-primary">→</span>
                <span className="text-white">Click <span className="bg-zk-primary/20 px-2 py-0.5 rounded text-zk-primary">JSON</span> tab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zk-primary">→</span>
                <span className="text-white">Click <span className="bg-zk-primary/20 px-2 py-0.5 rounded text-zk-primary">Download</span> button</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zk-primary">→</span>
                <span className="text-white">Save file: <code className="text-zk-gray">zkrune-proof-[date].json</code></span>
              </div>
            </div>
            <p className="text-xs text-zk-gray mt-2 flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>This file (~2KB) contains your mathematical proof - like a receipt!</span>
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Check It's Real</h4>
            <p className="text-sm text-zk-gray leading-relaxed mb-3">
              Use a free checking tool - like using a calculator to verify math. Two easy options:
            </p>
            
            {/* Option A: Web Tool */}
            <div className="space-y-3 mb-3">
              <div className="bg-zk-darker/50 rounded-lg p-3">
                <p className="text-xs font-medium text-white mb-2">Option A: Web Tool (Easiest)</p>
                <div className="space-y-1 text-xs text-zk-gray">
                  <div>→ Go to <a href="/verify-proof" className="text-zk-primary hover:underline">zkrune.com/verify-proof</a></div>
                  <div>→ Open your downloaded file</div>
                  <div>→ Copy-paste the content</div>
                  <div>→ Click "Verify"</div>
                  <div>→ See result: Valid or Invalid</div>
                </div>
              </div>

              {/* Option B: CLI */}
              <div className="bg-zk-darker/50 rounded-lg p-3">
                <p className="text-xs font-medium text-white mb-2">Option B: Terminal (For Techies)</p>
                <div className="text-xs text-zk-gray">
                  <code className="block bg-black/40 p-2 rounded text-[10px] text-zk-primary">
                    snarkjs groth16 verify proof.json
                  </code>
                  <p className="mt-1 opacity-60">Requires: snarkjs installed</p>
                </div>
              </div>
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
        <p className="text-sm text-white font-medium mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-zk-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
          Think of it like this:
        </p>
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

