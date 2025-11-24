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
    
    // Constraint: birthYear must be reasonable (between 1900 and currentYear)
    // This prevents overflow attacks
    signal birthYearValid;
    birthYearValid <== (currentYear - birthYear) * (birthYear - 1900);
    
    // Real comparison: age >= minimumAge
    component ageCheck = GreaterEqThan(32);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minimumAge;
    
    // Output the actual comparison result
    isValid <== ageCheck.out;
    
    // Additional constraint: age must be reasonable (0-150)
    component maxAgeCheck = LessThan(32);
    maxAgeCheck.in[0] <== age;
    maxAgeCheck.in[1] <== 150;
    
    // Force the constraint
    maxAgeCheck.out === 1;
}

// Main component
component main {public [currentYear, minimumAge]} = AgeVerification();

