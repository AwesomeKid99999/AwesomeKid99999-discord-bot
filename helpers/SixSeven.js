function SixSeven(number) {
    if (String(number).includes("67")) {
        number = number.toString() + " (SIX SEVEN!)";
    }


    return number;
}

module.exports = SixSeven;