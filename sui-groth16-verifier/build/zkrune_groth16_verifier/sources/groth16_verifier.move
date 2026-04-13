/// zkRune Groth16 Verifier for Sui
/// On-chain zero-knowledge proof verifier using Groth16 pairing checks via Sui's native BN254 support.
/// Supports multiple circuit templates via a dynamic verification key registry.
module zkrune::groth16_verifier {
    use sui::groth16;
    use sui::event;
    use sui::table::{Self, Table};

    const E_UNKNOWN_TEMPLATE: u64 = 0;
    const E_PROOF_VERIFICATION_FAILED: u64 = 1;
    const E_TEMPLATE_ALREADY_EXISTS: u64 = 2;
    const E_INVALID_PUBLIC_INPUTS: u64 = 3;

    public struct AdminCap has key, store {
        id: UID,
    }

    public struct VerifierRegistry has key {
        id: UID,
        circuits: Table<u8, CircuitConfig>,
        circuit_count: u8,
    }

    public struct CircuitConfig has store {
        name: vector<u8>,
        pvk: groth16::PreparedVerifyingKey,
        n_public: u8,
    }

    public struct ProofVerified has copy, drop {
        template_id: u8,
        verifier: address,
        valid: bool,
    }

    public struct CircuitRegistered has copy, drop {
        template_id: u8,
        name: vector<u8>,
        n_public: u8,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx),
        );

        transfer::share_object(VerifierRegistry {
            id: object::new(ctx),
            circuits: table::new(ctx),
            circuit_count: 0,
        });
    }

    /// Register a circuit template's verification key.
    /// The vk_bytes must be in Arkworks canonical compressed serialization format.
    /// The VK is prepared once at registration time to save gas during verification.
    public fun register_circuit(
        _cap: &AdminCap,
        registry: &mut VerifierRegistry,
        template_id: u8,
        name: vector<u8>,
        vk_bytes: vector<u8>,
        n_public: u8,
    ) {
        assert!(
            !table::contains(&registry.circuits, template_id),
            E_TEMPLATE_ALREADY_EXISTS,
        );

        let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk_bytes);

        table::add(&mut registry.circuits, template_id, CircuitConfig {
            name,
            pvk,
            n_public,
        });

        if (template_id >= registry.circuit_count) {
            registry.circuit_count = template_id + 1;
        };

        event::emit(CircuitRegistered { template_id, name, n_public });
    }

    /// Replace an existing circuit template's verification key.
    public fun update_circuit(
        _cap: &AdminCap,
        registry: &mut VerifierRegistry,
        template_id: u8,
        name: vector<u8>,
        vk_bytes: vector<u8>,
        n_public: u8,
    ) {
        assert!(
            table::contains(&registry.circuits, template_id),
            E_UNKNOWN_TEMPLATE,
        );

        let config = table::borrow_mut(&mut registry.circuits, template_id);
        config.name = name;
        config.pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk_bytes);
        config.n_public = n_public;

        event::emit(CircuitRegistered { template_id, name, n_public });
    }

    /// Verify a Groth16 proof for a registered circuit template.
    /// proof_points_bytes: Arkworks compressed proof (A_G1 + B_G2 + C_G1 = 128 bytes)
    /// public_inputs_bytes: Concatenated 32-byte LE field elements
    /// Aborts if the proof is invalid.
    public fun verify_proof(
        registry: &VerifierRegistry,
        template_id: u8,
        proof_points_bytes: vector<u8>,
        public_inputs_bytes: vector<u8>,
        ctx: &TxContext,
    ) {
        assert!(
            table::contains(&registry.circuits, template_id),
            E_UNKNOWN_TEMPLATE,
        );

        let config = table::borrow(&registry.circuits, template_id);

        let expected_len = (config.n_public as u64) * 32;
        assert!(
            vector::length(&public_inputs_bytes) == expected_len,
            E_INVALID_PUBLIC_INPUTS,
        );

        let proof = groth16::proof_points_from_bytes(proof_points_bytes);
        let inputs = groth16::public_proof_inputs_from_bytes(public_inputs_bytes);

        let valid = groth16::verify_groth16_proof(
            &groth16::bn254(),
            &config.pvk,
            &inputs,
            &proof,
        );

        assert!(valid, E_PROOF_VERIFICATION_FAILED);

        event::emit(ProofVerified {
            template_id,
            verifier: tx_context::sender(ctx),
            valid,
        });
    }

    /// Verify a proof without aborting, returns the result as a boolean.
    public fun verify_proof_static(
        registry: &VerifierRegistry,
        template_id: u8,
        proof_points_bytes: vector<u8>,
        public_inputs_bytes: vector<u8>,
    ): bool {
        if (!table::contains(&registry.circuits, template_id)) {
            return false
        };

        let config = table::borrow(&registry.circuits, template_id);

        let expected_len = (config.n_public as u64) * 32;
        if (vector::length(&public_inputs_bytes) != expected_len) {
            return false
        };

        let proof = groth16::proof_points_from_bytes(proof_points_bytes);
        let inputs = groth16::public_proof_inputs_from_bytes(public_inputs_bytes);

        groth16::verify_groth16_proof(
            &groth16::bn254(),
            &config.pvk,
            &inputs,
            &proof,
        )
    }

    /// Query circuit info by template ID.
    public fun get_circuit_info(
        registry: &VerifierRegistry,
        template_id: u8,
    ): (vector<u8>, u8, bool) {
        if (!table::contains(&registry.circuits, template_id)) {
            return (b"", 0, false)
        };

        let config = table::borrow(&registry.circuits, template_id);
        (config.name, config.n_public, true)
    }

    /// Returns the number of registered circuits.
    public fun circuit_count(registry: &VerifierRegistry): u8 {
        registry.circuit_count
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
