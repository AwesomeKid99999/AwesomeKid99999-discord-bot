exports.getUptimeFormatted = async ({ executionId }) => {
    
    try {
        let uptimeFormattedString = '';

        const uptimeInSeconds = process.uptime();
        let uptimeDate = new Date(0);
        uptimeDate.setSeconds(uptimeInSeconds.toFixed(0));
        uptimeFormattedString = `${
            uptimeDate.getUTCDate() - 1
        }d ${uptimeDate.getUTCHours()}h ${uptimeDate.getUTCMinutes()}m ${uptimeDate.getUTCSeconds()}s`;

        return uptimeFormattedString;
    } catch (error) {
        console.error('Error retrieving or transforming uptime to formatted string.', error);
        throw error;
    }
};
