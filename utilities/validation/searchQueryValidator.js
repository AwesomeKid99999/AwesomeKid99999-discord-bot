exports.transformQuery = async ({ query, filePath, executionId }) => {


    if (query.startsWith('https://open.spotify.com/')) {
        try {
            // regex to check for country-based Spotify url
            const regex = new RegExp(
                'https://open.spotify.com/((?:[a-z]{2,4}-[a-z]{2,4}/)|(?:[a-z]{2,4}/))(track|playlist)/([a-zA-Z0-9]+)'
            );
            const isCountryBased = regex.test(query);

            // if country-based, transform to normal Spotify url
            if (isCountryBased) {
                console.debug(`Transforming country-based Spotify url to normal Spotify url from query '${query}'.`);
                const type = query.match(regex)[2];
                const trackId = query.match(regex)[3];
                query = `https://open.spotify.com/${type}/${trackId}`;
            }
        } catch (error) {
            console.error(error, 'Error while validating or transforming Spotify url.');
        }
    }

    return query;
};
