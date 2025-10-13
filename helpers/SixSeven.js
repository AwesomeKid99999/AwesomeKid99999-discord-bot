function SixSeven(number, enabled = true) {
    if (!enabled) return number;
    if (String(number).includes("67")) {
        number = number.toString() + " (SIX SEVEN!)";
    }
    return number;
}

module.exports = SixSeven;