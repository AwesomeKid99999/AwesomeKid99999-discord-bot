function SixSeven(number, enabled = true) {
    if (!enabled) return number;
    
    const numberStr = String(number);
    let memeText = "";
    
    // Check for various meme numbers (ordered by specificity - longer patterns first)
    if (numberStr == "1337") {
        memeText = " (LEET!)";
    } else if (numberStr == ("1488")) {
        memeText = " (14 WORDS!)";
    } else if (numberStr == "420") {
        memeText = " (BLAZE IT!)";
    } else if (numberStr == "404") {
        memeText = " (ERROR 404 NOT FOUND)";
    } else if (numberStr == "911") {
        memeText = " (WHAT'S YOUR EMERGENCY?)";
    } else if (numberStr == "411") {
        memeText = " (INFORMATION!)";
    } else if (numberStr == "666") {
        memeText = " (NUMBER OF THE BEAST!)";
    } else if (numberStr == "777") {
        memeText = " (LUCKY SEVENS!)";
    } else if (numberStr == "69") {
        memeText = " (NICE!)";
    } else if (numberStr.includes("67")) {
        memeText = " (SIX SEVEN!)";
    } else if (numberStr == "42") {
        memeText = " (ANSWER TO EVERYTHING!)";
    } else if (numberStr == "21") {
        memeText = " (BLACKJACK!)";    
    }
    
    if (memeText) {
        number = number.toString() + memeText;
    }
    
    return number;
}

module.exports = SixSeven;