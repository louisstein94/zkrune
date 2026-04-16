#[test_only]
module zkrune::groth16_verifier_tests {
    use sui::test_scenario;
    use zkrune::groth16_verifier::{Self, AdminCap, VerifierRegistry};

    const ADMIN: address = @0xAD;

    #[test]
    fun test_init_creates_registry_and_admin_cap() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let admin_cap = scenario.take_from_sender<AdminCap>();
            let registry = scenario.take_shared<VerifierRegistry>();

            assert!(groth16_verifier::circuit_count(&registry) == 0);

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_get_circuit_info_unregistered() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let registry = scenario.take_shared<VerifierRegistry>();
            let (_name, _n_public, exists) = groth16_verifier::get_circuit_info(&registry, 0);
            assert!(!exists);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_verify_proof_static_unregistered_returns_false() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let registry = scenario.take_shared<VerifierRegistry>();
            let result = groth16_verifier::verify_proof_static(
                &registry,
                99,
                vector[],
                vector[],
            );
            assert!(!result);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    // Real age-verification Groth16 fixtures from
    // scripts/sui/generate-test-fixtures.ts (snarkjs + lib/sui/converter).
    // Input: birthYear=1990, currentYear=2025, minimumAge=21 → isAdult=1.
    // publicSignals = [1, 2025, 21].
    const AGE_VK: vector<u8> = x"3cb243e5f06bd40f0ef0956afe9225898cc677dc2ca58cedd3e1d92c8bb78a2643d391fc7c91ea12ba2683e7b5535e677a2f9429cc7e161ea5d4ed65923cba0457d943284ca3f3e3e1f26d68e0e462f6d602f51ce336d4b276e9acb8aa2435adedf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e19edf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e1904000000000000000ee64b26fff1d081083c8e168bbffaf63d4a14f8f1620e8cf90b0063c9ed93915dd1b63e06adbacea3c6b7b4e247211bff64c5157ef9416c5a5115c1d5fb232daa33aec6b7b81bd6b6c3c3a29b936712397df1e58e8a373b79785a01bbf1e693078bcdf3c983f8964d79fe956d5d0e3a499101d9ea8d496ec2293450250cdd0e";
    const AGE_PROOF: vector<u8> = x"22ecab9e3cc934ce45e646f306bd854fad97655078578b03e11d60505baf4083e2cafc49f358168e6b237de0db5427f0076a2b1eaf64da691ce46080117ee1204292699bb238e09fceb465677145406307ec032f0cbdbc2e412cdc7b250713a8df07f38749a197326b6341052ffaaa5762de8783d559de32b5318d9e0f35121d";
    const AGE_INPUTS: vector<u8> = x"0100000000000000000000000000000000000000000000000000000000000000e9070000000000000000000000000000000000000000000000000000000000001500000000000000000000000000000000000000000000000000000000000000";

    #[test]
    fun test_verify_real_age_proof_returns_true() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let mut registry = scenario.take_shared<VerifierRegistry>();
            let admin_cap = scenario.take_from_sender<AdminCap>();

            groth16_verifier::register_circuit(
                &admin_cap,
                &mut registry,
                0,
                b"age-verification",
                AGE_VK,
                3,
            );

            let result = groth16_verifier::verify_proof_static(
                &registry,
                0,
                AGE_PROOF,
                AGE_INPUTS,
            );
            assert!(result);

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_verify_tampered_age_proof_returns_false() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let mut registry = scenario.take_shared<VerifierRegistry>();
            let admin_cap = scenario.take_from_sender<AdminCap>();

            groth16_verifier::register_circuit(
                &admin_cap,
                &mut registry,
                0,
                b"age-verification",
                AGE_VK,
                3,
            );

            let mut tampered = AGE_PROOF;
            let first = vector::borrow_mut(&mut tampered, 0);
            *first = *first ^ 0x01;

            let result = groth16_verifier::verify_proof_static(
                &registry,
                0,
                tampered,
                AGE_INPUTS,
            );
            assert!(!result);

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_verify_wrong_inputs_returns_false() {
        let mut scenario = test_scenario::begin(ADMIN);

        {
            groth16_verifier::init_for_testing(scenario.ctx());
        };

        scenario.next_tx(ADMIN);
        {
            let mut registry = scenario.take_shared<VerifierRegistry>();
            let admin_cap = scenario.take_from_sender<AdminCap>();

            groth16_verifier::register_circuit(
                &admin_cap,
                &mut registry,
                0,
                b"age-verification",
                AGE_VK,
                3,
            );

            // Flip first byte of public inputs (changes isAdult from 1 to 0)
            let mut wrong = AGE_INPUTS;
            let first = vector::borrow_mut(&mut wrong, 0);
            *first = 0;

            let result = groth16_verifier::verify_proof_static(
                &registry,
                0,
                AGE_PROOF,
                wrong,
            );
            assert!(!result);

            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }
}
