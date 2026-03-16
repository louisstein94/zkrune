type CircuitId = 'age-verification' | 'balance-proof' | 'membership-proof' | 'range-proof' | 'private-voting' | 'hash-preimage' | 'credential-proof' | 'token-swap' | 'signature-verification' | 'patience-proof' | 'quadratic-voting' | 'nft-ownership' | 'anonymous-reputation' | 'whale-holder';
type WidgetTheme = 'dark' | 'light';
interface WidgetConfig {
    container: string | HTMLElement;
    circuit?: CircuitId;
    theme?: WidgetTheme;
    circuitBaseUrl?: string;
    verifierUrl?: string;
    buttonLabel?: string;
    lang?: 'en' | 'tr';
    onResult?: (result: VerifyResult) => void;
    onError?: (error: WidgetError) => void;
}
interface VerifyResult {
    verified: boolean;
    circuitName: CircuitId;
    proof: Groth16Proof;
    publicSignals: string[];
    proofHash: string;
    timestamp: number;
}
interface Groth16Proof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
}
interface WidgetError {
    code: 'SNARKJS_LOAD_FAILED' | 'CIRCUIT_LOAD_FAILED' | 'PROOF_GENERATION_FAILED' | 'VERIFICATION_FAILED' | 'INVALID_INPUTS' | 'NETWORK_ERROR';
    message: string;
}
interface FieldSchema {
    name: string;
    label: string;
    description: string;
    required: boolean;
    type: 'integer' | 'hash' | 'timestamp';
}
interface CircuitMeta {
    id: CircuitId;
    name: string;
    description: string;
    category: 'identity' | 'financial' | 'governance' | 'cryptographic';
    fields: FieldSchema[];
}
type WidgetStage = 'idle' | 'select' | 'input' | 'proving' | 'verifying' | 'result';

interface WidgetInstance {
    destroy: () => void;
}
declare function init(config: WidgetConfig): WidgetInstance;
declare function verify(circuitId: CircuitId, inputs: Record<string, string>, options?: Partial<WidgetConfig>): Promise<VerifyResult>;

declare const CIRCUITS: Record<CircuitId, CircuitMeta>;
declare const CIRCUIT_CATEGORIES: {
    readonly identity: {
        readonly label: "Identity";
        readonly icon: "🛡";
    };
    readonly financial: {
        readonly label: "Financial";
        readonly icon: "💰";
    };
    readonly governance: {
        readonly label: "Governance";
        readonly icon: "🗳";
    };
    readonly cryptographic: {
        readonly label: "Cryptographic";
        readonly icon: "🔐";
    };
};
declare function getCircuitsByCategory(): Record<string, CircuitMeta[]>;
declare function validateInputs(circuitId: CircuitId, inputs: Record<string, string>): {
    valid: boolean;
    errors: string[];
};

export { CIRCUITS, CIRCUIT_CATEGORIES, type CircuitId, type CircuitMeta, type FieldSchema, type Groth16Proof, type VerifyResult, type WidgetConfig, type WidgetError, type WidgetStage, type WidgetTheme, getCircuitsByCategory, init, validateInputs, verify };
