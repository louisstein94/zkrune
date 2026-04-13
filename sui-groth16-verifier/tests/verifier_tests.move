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
}
