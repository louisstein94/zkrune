/**
 * @zkrune/sdk
 *
 * JavaScript SDK for generating zero-knowledge proofs with zkRune
 * Browser and Node.js compatible
 */
interface ZKProofOptions {
    templateId: string;
    inputs: Record<string, string>;
    circuitPath?: string;
}
interface ZKProofResult {
    success: boolean;
    proof?: {
        groth16Proof: any;
        publicSignals: string[];
        verificationKey: any;
        timestamp: string;
        isValid: boolean;
        proofHash: string;
        note: string;
    };
    error?: string;
    timing?: number;
}
/**
 * Generate a zero-knowledge proof
 *
 * @example
 * ```typescript
 * import { generateProof } from '@zkrune/sdk';
 *
 * const result = await generateProof({
 *   templateId: 'age-verification',
 *   inputs: {
 *     birthYear: '1995',
 *     currentYear: '2024',
 *     minimumAge: '18'
 *   }
 * });
 *
 * if (result.success) {
 *   console.log('Proof:', result.proof);
 * }
 * ```
 */
declare function generateProof(options: ZKProofOptions): Promise<ZKProofResult>;
/**
 * Verify a zero-knowledge proof
 *
 * @example
 * ```typescript
 * import { verifyProof } from '@zkrune/sdk';
 *
 * const isValid = await verifyProof({
 *   proof: groth16Proof,
 *   publicSignals: ['1'],
 *   verificationKey: vKey
 * });
 * ```
 */
declare function verifyProof(params: {
    proof: any;
    publicSignals: string[];
    verificationKey: any;
}): Promise<boolean>;
/**
 * Available zkRune templates
 */
declare const templates: {
    readonly AGE_VERIFICATION: "age-verification";
    readonly BALANCE_PROOF: "balance-proof";
    readonly MEMBERSHIP_PROOF: "membership-proof";
    readonly RANGE_PROOF: "range-proof";
    readonly PRIVATE_VOTING: "private-voting";
};
type TemplateId = typeof templates[keyof typeof templates];

export { type TemplateId, type ZKProofOptions, type ZKProofResult, generateProof, templates, verifyProof };
