pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// Real Age Verification with proper range proof
template AgeVerification() {
    // Private input - user's birth year (kept secret)
    signal input birthYear;
    
    // Public inputs
    signal input currentYear;
    signal input minimumAge;
    
    // Output - is user old enough?
    signal output isValid;
    
    // Calculate age
    signal age;
    age <== currentYear - birthYear;

    // Constraint: birthYear >= 1900
    component minBirthYear = GreaterEqThan(32);
    minBirthYear.in[0] <== birthYear;
    minBirthYear.in[1] <== 1900;
    minBirthYear.out === 1;

    // Constraint: birthYear <= currentYear
    component maxBirthYear = LessEqThan(32);
    maxBirthYear.in[0] <== birthYear;
    maxBirthYear.in[1] <== currentYear;
    maxBirthYear.out === 1;

    // Real comparison: age >= minimumAge
    component ageCheck = GreaterEqThan(32);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minimumAge;
    
    // Output the actual comparison result
    isValid <== ageCheck.out;
    // Enforce: proof is only satisfiable when user meets the age requirement
    isValid === 1;
    
    // Additional constraint: age must be reasonable (0-150)
    component maxAgeCheck = LessThan(32);
    maxAgeCheck.in[0] <== age;
    maxAgeCheck.in[1] <== 150;
    maxAgeCheck.out === 1;
}

// Main component
component main {public [currentYear, minimumAge]} = AgeVerification();

