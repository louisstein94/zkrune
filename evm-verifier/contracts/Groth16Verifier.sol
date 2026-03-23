// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title zkRune Groth16 Verifier
 * @notice Verifies Groth16 zk-SNARK proofs on EVM chains using BN254 precompiles.
 *         Supports multiple circuit templates via on-chain verification key registry.
 * @dev Uses precompiled contracts at addresses 0x06 (ecAdd), 0x07 (ecMul), 0x08 (ecPairing).
 */
contract Groth16Verifier {
    uint256 constant PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    uint256 constant PRIME_R = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    struct G1Point {
        uint256 x;
        uint256 y;
    }

    struct G2Point {
        uint256[2] x; // [x.c0, x.c1]
        uint256[2] y; // [y.c0, y.c1]
    }

    struct VerificationKey {
        G1Point alpha;
        G2Point beta;
        G2Point gamma;
        G2Point delta;
        G1Point[] ic;
        bool exists;
    }

    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    address public owner;
    mapping(uint8 => VerificationKey) internal vkeys;
    mapping(uint8 => string) public circuitNames;
    uint8 public circuitCount;

    event CircuitRegistered(uint8 indexed templateId, string name, uint256 nPublic);
    event ProofVerified(uint8 indexed templateId, bool valid, address indexed verifier);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    /**
     * @notice Register a circuit's verification key
     * @param templateId Unique template identifier (0-255)
     * @param name Human-readable circuit name
     * @param alpha_x Alpha G1 point x coordinate
     * @param alpha_y Alpha G1 point y coordinate
     * @param beta_x G2 point x coordinates [c0, c1]
     * @param beta_y G2 point y coordinates [c0, c1]
     * @param gamma_x G2 point x coordinates [c0, c1]
     * @param gamma_y G2 point y coordinates [c0, c1]
     * @param delta_x G2 point x coordinates [c0, c1]
     * @param delta_y G2 point y coordinates [c0, c1]
     * @param ic_flat Flattened IC points [x0, y0, x1, y1, ...]
     */
    function registerCircuit(
        uint8 templateId,
        string calldata name,
        uint256 alpha_x, uint256 alpha_y,
        uint256[2] calldata beta_x, uint256[2] calldata beta_y,
        uint256[2] calldata gamma_x, uint256[2] calldata gamma_y,
        uint256[2] calldata delta_x, uint256[2] calldata delta_y,
        uint256[] calldata ic_flat
    ) external onlyOwner {
        require(ic_flat.length >= 4 && ic_flat.length % 2 == 0, "Invalid IC length");

        VerificationKey storage vk = vkeys[templateId];
        vk.alpha = G1Point(alpha_x, alpha_y);
        vk.beta = G2Point(beta_x, beta_y);
        vk.gamma = G2Point(gamma_x, gamma_y);
        vk.delta = G2Point(delta_x, delta_y);
        vk.exists = true;

        delete vk.ic;
        uint256 icCount = ic_flat.length / 2;
        for (uint256 i = 0; i < icCount; i++) {
            vk.ic.push(G1Point(ic_flat[i * 2], ic_flat[i * 2 + 1]));
        }

        circuitNames[templateId] = name;
        if (templateId >= circuitCount) {
            circuitCount = templateId + 1;
        }

        emit CircuitRegistered(templateId, name, icCount - 1);
    }

    /**
     * @notice Verify a Groth16 proof for a registered circuit
     * @param templateId Circuit template identifier
     * @param a Proof point A (G1)
     * @param b Proof point B (G2)
     * @param c Proof point C (G1)
     * @param publicInputs Array of public input signals
     * @return valid True if the proof is valid
     */
    function verifyProof(
        uint8 templateId,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[] calldata publicInputs
    ) external returns (bool valid) {
        VerificationKey storage vk = vkeys[templateId];
        require(vk.exists, "Circuit not registered");
        require(publicInputs.length + 1 == vk.ic.length, "Input count mismatch");

        for (uint256 i = 0; i < publicInputs.length; i++) {
            require(publicInputs[i] < PRIME_R, "Input exceeds field size");
        }

        Proof memory proof = Proof(
            G1Point(a[0], a[1]),
            G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]),
            G1Point(c[0], c[1])
        );

        valid = _verify(proof, publicInputs, vk);
        emit ProofVerified(templateId, valid, msg.sender);
    }

    /**
     * @notice Static verification (no event, saves gas for view-like calls)
     */
    function verifyProofStatic(
        uint8 templateId,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[] calldata publicInputs
    ) external view returns (bool) {
        VerificationKey storage vk = vkeys[templateId];
        require(vk.exists, "Circuit not registered");
        require(publicInputs.length + 1 == vk.ic.length, "Input count mismatch");

        for (uint256 i = 0; i < publicInputs.length; i++) {
            require(publicInputs[i] < PRIME_R, "Input exceeds field size");
        }

        Proof memory proof = Proof(
            G1Point(a[0], a[1]),
            G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]),
            G1Point(c[0], c[1])
        );

        return _verify(proof, publicInputs, vk);
    }

    function getCircuitInfo(uint8 templateId) external view returns (
        string memory name, uint256 nPublic, bool registered
    ) {
        VerificationKey storage vk = vkeys[templateId];
        return (
            circuitNames[templateId],
            vk.ic.length > 0 ? vk.ic.length - 1 : 0,
            vk.exists
        );
    }

    // ─── Internal verification logic ────────────────────────────────────

    function _verify(
        Proof memory proof,
        uint256[] calldata inputs,
        VerificationKey storage vk
    ) internal view returns (bool) {
        // Compute linear combination: vk_x = IC[0] + Σ(input[i] * IC[i+1])
        G1Point memory vk_x = vk.ic[0];
        for (uint256 i = 0; i < inputs.length; i++) {
            vk_x = _addition(vk_x, _scalar_mul(vk.ic[i + 1], inputs[i]));
        }

        // Pairing check: e(A, B) == e(alpha, beta) * e(vk_x, gamma) * e(C, delta)
        // Rearranged: e(-A, B) * e(alpha, beta) * e(vk_x, gamma) * e(C, delta) == 1
        return _pairingCheck(
            _negate(proof.a), proof.b,
            vk.alpha, vk.beta,
            vk_x, vk.gamma,
            proof.c, vk.delta
        );
    }

    // ─── BN254 precompile wrappers ──────────────────────────────────────

    function _addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint256[4] memory input;
        input[0] = p1.x;
        input[1] = p1.y;
        input[2] = p2.x;
        input[3] = p2.y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0x80, r, 0x40)
        }
        require(success, "ecAdd failed");
    }

    function _scalar_mul(G1Point memory p, uint256 s) internal view returns (G1Point memory r) {
        uint256[3] memory input;
        input[0] = p.x;
        input[1] = p.y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x60, r, 0x40)
        }
        require(success, "ecMul failed");
    }

    function _negate(G1Point memory p) internal pure returns (G1Point memory) {
        if (p.x == 0 && p.y == 0) return G1Point(0, 0);
        return G1Point(p.x, PRIME_Q - (p.y % PRIME_Q));
    }

    function _pairingCheck(
        G1Point memory a1, G2Point memory a2,
        G1Point memory b1, G2Point memory b2,
        G1Point memory c1, G2Point memory c2,
        G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        uint256[24] memory input = [
            a1.x, a1.y, a2.x[1], a2.x[0], a2.y[1], a2.y[0],
            b1.x, b1.y, b2.x[1], b2.x[0], b2.y[1], b2.y[0],
            c1.x, c1.y, c2.x[1], c2.x[0], c2.y[1], c2.y[0],
            d1.x, d1.y, d2.x[1], d2.x[0], d2.y[1], d2.y[0]
        ];
        uint256[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, input, 768, out, 0x20)
        }
        require(success, "ecPairing failed");
        return out[0] != 0;
    }
}
