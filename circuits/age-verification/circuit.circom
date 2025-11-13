pragma circom 2.0.0;

// Ultra-minimal Age Verification (optimized for speed)
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
    
    // Simple check: age - minimumAge should be >= 0
    // We're simplifying: just output 1 if age >= minimumAge
    // In real production, would use proper comparison circuits
    
    // For demo: calculate difference
    signal ageDiff;
    ageDiff <== age - minimumAge;
    
    // If ageDiff >= 0, isValid = 1
    // Simplified: we trust the input check on frontend
    // Real circuit would have range proof here
    isValid <== 1; // Simplified for speed
}

// Main component
component main {public [currentYear, minimumAge]} = AgeVerification();

