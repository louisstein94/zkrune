"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BalanceProofForm from "@/components/BalanceProofForm";
import MembershipProofForm from "@/components/MembershipProofForm";
import RangeProofForm from "@/components/RangeProofForm";
import VotingProofForm from "@/components/VotingProofForm";

// Template data
const templates: { [key: string]: any } = {
  "age-verification": {
    id: "age-verification",
    name: "Age Verification",
    description: "Prove you're 18+ without revealing your exact age",
    icon: "👤",
    category: "Identity",
    difficulty: "Easy",
    howItWorks: [
      "Enter your date of birth",
      "System calculates if you're 18+",
      "Generate zero-knowledge proof",
      "Proof shows only: 'User is 18+' ✓",
      "Your actual age remains private",
    ],
    useCases: [
      "Age-restricted content access",
      "Online account verification",
      "Event ticket validation",
      "Regulatory compliance",
    ],
  },
  "balance-proof": {
    id: "balance-proof",
    name: "Balance Proof",
    description: "Prove minimum balance without showing amount",
    icon: "💰",
    category: "Financial",
    difficulty: "Easy",
    howItWorks: [
      "Connect your wallet",
      "Set minimum balance threshold",
      "System checks balance privately",
      "Generate proof of sufficient funds",
      "Actual balance stays hidden",
    ],
    useCases: [
      "Loan applications",
      "Credit line approval",
      "Investment eligibility",
      "Financial verification",
    ],
  },
  "membership-proof": {
    id: "membership-proof",
    name: "Membership Proof",
    description: "Prove group membership without revealing identity",
    icon: "🎫",
    category: "Access",
    difficulty: "Medium",
    howItWorks: [
      "Select your membership group",
      "Provide membership credentials",
      "System verifies membership",
      "Generate anonymous proof",
      "Your identity remains private",
    ],
    useCases: [
      "Private club access",
      "Anonymous voting rights",
      "Exclusive content access",
      "Credential verification",
    ],
  },
  "range-proof": {
    id: "range-proof",
    name: "Range Proof",
    description: "Prove value is within range without exact number",
    icon: "📊",
    category: "Data",
    difficulty: "Medium",
    howItWorks: [
      "Enter your value (private)",
      "Set acceptable range",
      "System validates range",
      "Generate proof of validity",
      "Exact value stays confidential",
    ],
    useCases: [
      "Income verification",
      "Credit score ranges",
      "Asset valuation",
      "Compliance reporting",
    ],
  },
  "private-voting": {
    id: "private-voting",
    name: "Private Voting",
    description: "Vote anonymously with cryptographic proof",
    icon: "🗳️",
    category: "Governance",
    difficulty: "Advanced",
    howItWorks: [
      "Register as eligible voter",
      "Cast your vote privately",
      "System encrypts your choice",
      "Generate vote proof",
      "Vote is counted, identity hidden",
    ],
    useCases: [
      "DAO governance",
      "Anonymous polls",
      "Board elections",
      "Community decisions",
    ],
  },
};

export default function TemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const template = templates[templateId];

  const [birthDate, setBirthDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState<any>(null);

  if (!template) {
    return (
      <div className="min-h-screen bg-zk-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-hatton text-white mb-4">Template Not Found</h1>
          <Link href="/" className="text-zk-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birth = new Date(birthDateString);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const generateAgeProof = async () => {
    if (!birthDate) {
      alert("Please enter your date of birth");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const age = calculateAge(birthDate);
    const isOver18 = age >= 18;

    const mockProof = {
      statement: isOver18 ? "User is 18 or older" : "User is under 18",
      isValid: isOver18,
      timestamp: new Date().toISOString(),
      proofHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      verificationKey: `vk_${Math.random().toString(36).substring(2, 15)}`,
      actualAge: age,
      birthDate: birthDate,
    };

    setProof(mockProof);
    setIsGenerating(false);
  };

  const handleProofGenerated = (generatedProof: any) => {
    setProof(generatedProof);
  };

  const resetForm = () => {
    setBirthDate("");
    setProof(null);
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      {/* Header */}
      <header className="border-b border-white/5 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">←</span>
            <div className="flex items-center gap-2">
              <div className="text-2xl text-zk-primary">ᚱ</div>
              <span className="text-xl font-hatton text-white">zkRune</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zk-gray">
              {template.category} • {template.difficulty}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Template Header */}
        <div className="mb-12">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-7xl">{template.icon}</div>
            <div>
              <h1 className="font-hatton text-5xl text-white mb-3">
                {template.name}
              </h1>
              <p className="text-xl text-zk-gray">{template.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="px-4 py-2 bg-zk-dark/50 rounded-lg border border-zk-gray/20">
              <span className="text-sm text-zk-gray">Difficulty: </span>
              <span className="text-sm text-zk-primary font-medium">
                {template.difficulty}
              </span>
            </div>
            <div className="px-4 py-2 bg-zk-dark/50 rounded-lg border border-zk-gray/20">
              <span className="text-sm text-zk-gray">Time: </span>
              <span className="text-sm text-white font-medium">~30 seconds</span>
            </div>
            <div className="px-4 py-2 bg-zk-dark/50 rounded-lg border border-zk-gray/20">
              <span className="text-sm text-zk-gray">Privacy: </span>
              <span className="text-sm text-zk-primary font-medium">
                100% Shielded
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <h2 className="font-hatton text-2xl text-white mb-6">
                Generate Proof
              </h2>

              {!proof ? (
                <>
                  {templateId === "age-verification" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-zk-gray mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <p className="text-xs text-zk-gray mt-2">
                          Your date of birth will NOT be revealed in the proof
                        </p>
                      </div>

                      <button
                        onClick={generateAgeProof}
                        disabled={isGenerating || !birthDate}
                        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
                            Generating Proof...
                          </>
                        ) : (
                          <>⚡ Generate ZK Proof</>
                        )}
                      </button>
                    </div>
                  )}

                  {templateId === "balance-proof" && (
                    <BalanceProofForm onProofGenerated={handleProofGenerated} />
                  )}

                  {templateId === "membership-proof" && (
                    <MembershipProofForm onProofGenerated={handleProofGenerated} />
                  )}

                  {templateId === "range-proof" && (
                    <RangeProofForm onProofGenerated={handleProofGenerated} />
                  )}

                  {templateId === "private-voting" && (
                    <VotingProofForm onProofGenerated={handleProofGenerated} />
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Proof Result */}
                  <div
                    className={`p-6 rounded-xl border-2 ${
                      proof.isValid
                        ? "bg-zk-primary/10 border-zk-primary"
                        : "bg-red-500/10 border-red-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl">
                        {proof.isValid ? "✅" : "❌"}
                      </div>
                      <div>
                        <h3 className="font-hatton text-xl text-white">
                          {proof.statement}
                        </h3>
                        <p className="text-sm text-zk-gray">
                          Verified at {new Date(proof.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Proof Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zk-gray">Proof Hash:</span>
                        <span className="text-white font-mono text-xs">
                          {proof.proofHash.substring(0, 20)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zk-gray">Verification Key:</span>
                        <span className="text-white font-mono text-xs">
                          {proof.verificationKey}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-4 bg-zk-secondary/10 border border-zk-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium text-zk-secondary mb-2">
                      🔒 Privacy Protected
                    </h4>
                    <p className="text-xs text-zk-gray">
                      {templateId === "age-verification" && proof.actualAge && (
                        <>Your exact age ({proof.actualAge}) and birth date ({proof.birthDate}) are NOT included in the proof. </>
                      )}
                      {templateId === "balance-proof" && proof.actualBalance && (
                        <>Your actual balance ({proof.actualBalance} ZEC) is NOT included in the proof. </>
                      )}
                      {templateId === "membership-proof" && proof.memberId && (
                        <>Your member ID ({proof.memberId}) is NOT included in the proof. </>
                      )}
                      {templateId === "range-proof" && proof.actualValue && (
                        <>Your exact value ({proof.actualValue}) is NOT included in the proof. </>
                      )}
                      {templateId === "private-voting" && proof.choice && (
                        <>Your vote choice ({proof.choice}) and voter ID are encrypted. </>
                      )}
                      Only the statement "{proof.statement}" is verifiable.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={resetForm}
                      className="flex-1 py-3 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary hover:text-zk-primary transition-colors"
                    >
                      Generate New Proof
                    </button>
                    <button className="flex-1 py-3 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all">
                      Export Proof
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <h2 className="font-hatton text-2xl text-white mb-6">
                How It Works
              </h2>
              <ol className="space-y-4">
                {template.howItWorks?.map((step: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-zk-gray pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Use Cases */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <h2 className="font-hatton text-2xl text-white mb-6">
                Use Cases
              </h2>
              <div className="space-y-3">
                {template.useCases?.map((useCase: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-zk-gray"
                  >
                    <div className="text-zk-primary">✓</div>
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <h2 className="font-hatton text-2xl text-white mb-4">
                Technical Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zk-gray">Proof System:</span>
                  <span className="text-white">zk-SNARKs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zk-gray">Circuit:</span>
                  <span className="text-white">Age Comparison</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zk-gray">Constraints:</span>
                  <span className="text-white">~1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zk-gray">Blockchain:</span>
                  <span className="text-zk-primary">Zcash Testnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

