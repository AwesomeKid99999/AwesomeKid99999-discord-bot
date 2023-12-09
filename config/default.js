// Import Discord.js types for TypeScript support.
const { ActivityType, PresenceUpdateStatus } = require('discord.js');

// Description: Config file for Cadence Discord bot.

// General metadata about the bot displayed in certain embeds.
module.exports.botOptions = {
    name: 'Powered by Cadence',
    botInviteUrl: '',
    serverInviteUrl: 'https://discord.gg/TPndG5k7tb'
};

// Configuration for bot sharding. Refers to splitting a Discord bot into multiple processes.
// For more information, refer to Discord.js sharding documentation: https://discordjs.guide/sharding/
module.exports.shardingOptions = {
    totalShards: 'auto',
    shardList: 'auto',
    mode: 'process',
    respawn: true
};

// Configuration for logging bot actions.
// You can set logging level to file and console separately.
module.exports.loggerOptions = {
    minimumLogLevel: 'debug',
    minimumLogLevelConsole: 'info',
    discordPlayerDebug: false
};

// Options for identifying specific system command.
module.exports.systemOptions = {
    // List of guild IDs where system commands can be executed. e.g. ['123456789012345678', '123456789012345678']
    systemGuildIds: ['819333019365670932'],
    // Channel for sending system messages, such as bot errors and disconnect events. e.g. '123456789012345678'
    systemMessageChannelId: '819333019365670932',
    // Bot administrator user ID for specific notifications through mentions in system channel. e.g. '123456789012345678'
    systemUserId: '582305323063312384'
};

// Configuration for the bot's presence and activity status.
// Incude const { ActivityType, PresenceUpdateStatus } = require('discord.js'); at the top of config file.


// Configurations for visual embed messages.
// Includes design elements like colors and custom emojis/symbols.
module.exports.embedOptions = {
    info: {
        fallbackThumbnailUrl:
            'https://media.discordapp.net/attachments/1116081062670508122/1134228893398732910/music.png'
    },
    colors: {
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#00ffff',
        note: '#80848E'
    },
    icons: {
        logo: '🤖',
        beta: '`beta`',
        new: '`new`',
        rule: '📒',
        support: '❓',
        bot: '🤖',
        server: '🖥️',
        discord: '🌐',
        audioPlaying: '🎶',
        audioStartedPlaying: '🎶',
        success: '✅',
        error: '⚠️',
        warning: '⚠️',
        disable: '🚫',
        enable: '✅',
        disabled: '✅',
        enabled: '✅',
        nextTrack: '⏭️',
        previousTrack: '⏮️',
        pauseResumeTrack: '⏯️',
        shuffleQueue: '🔀',
        loop: '🔁',
        loopAction: '🔁',
        autoplay: '♾️',
        autoplayAction: '♾️',
        looping: '🔁',
        autoplaying: '♾️',
        skipped: '⏭️',
        back: '⏮️',
        pauseResumed: '⏯️',
        shuffled: '🔀',
        volume: '🔊',
        volumeIsMuted: '🔇',
        volumeChanged: '🔊',
        volumeMuted: '🔇',
        queue: '🎶',
        sourceArbitrary: '🎵',
        sourceAppleMusic: '🎵',
        sourceYouTube: '🎵',
        sourceSoundCloud: '🎵',
        sourceSpotify: '🎵',
        liveTrack: '🔴'
    }
};

// Configuration for the audio player. Includes behavior upon various events and UI components.
module.exports.playerOptions = {
    leaveOnEmpty: false,
    leaveOnEmptyCooldown: 1_800_000,
    leaveOnEnd: false,
    leaveonEndCooldown: 1_800_000,
    leaveOnStop: false,
    leaveOnStopCooldown: 1_800_000,
    defaultVolume: 50,
    maxQueueSize: 10_000,
    maxHistorySize: 100,
    bufferingTimeout: 3_000,
    connectionTimeout: 30_000,
    progressBar: {
        length: 14,
        timecodes: false,
        separator: '┃',
        indicator: '🔘',
        leftChar: '▬',
        rightChar: '▬'
    }
};

// Configuration for ffmpeg filters for audio processing.
module.exports.ffmpegFilterOptionsPage1 = {
    threadAmount: '2',
    availableFilters: [
        {
            label: 'Bass boost low',
            value: 'bassboost_low',
            description: 'Boost the bass of the audio.',
            emoji: '🔈'
        },
        {
            label: 'Bass boost normal',
            value: 'bassboost',
            description: 'Boost the bass of the audio a lot.',
            emoji: '🔉'
        },
        {
            label: 'Bass boost high',
            value: 'bassboost_high',
            description: 'Boost the bass of the audio even more.',
            emoji: '🔊'
        },
        {
            label: 'Mario Kart Final Lap',
            value: 'final_lap',
            description: 'Speed up the audio slightly because it\'s the final lap.',
            emoji: '🏎️'
        },
        {
            label: 'Night core (slower)',
            value: 'nightcore_slower',
            description: 'Speed up the audio (a little higher pitch).',
            emoji: '✨'
        },
        {
            label: 'Night core (normal)',
            value: 'nightcore',
            description: 'Speed up the audio (higher pitch).',
            emoji: '🌙'
        },
        {
            label: 'Night core (faster)',
            value: 'nightcore_faster',
            description: 'Speed up the audio (even higher pitch).',
            emoji: '🌕'
        },
        {
            label: 'Fast',
            value: 'fast',
            description: 'Speed up the audio by 2x. (2x speed)',
            emoji: '🏃'
        },
        {
            label: 'Extra Fast',
            value: 'extra_fast',
            description: 'Speed up the audio by 4x. (4x speed)',
            emoji: '🐇'
        },
        {
            label: 'Slow',
            value: 'slow',
            description: 'Slow down the audio by 2x. (0.5x speed)',
            emoji: '🐌'
        },
        {
            label: 'Extra Slow',
            value: 'extra_slow',
            description: 'Slow down the audio by 4x. (0.25x speed)',
            emoji: '🐢'
        },
        {
            label: 'Lo-fi',
            value: 'lofi',
            description: 'Low fidelity effect (lower quality).',
            emoji: '📻'
        },
        {
            label: 'Vaporwave',
            value: 'vaporwave',
            description: 'Slow down the audio (a little lower pitch).',
            emoji: '🌸'
        },
        {
            label: 'Vaporwave (slower)',
            value: 'vaporwave_slower',
            description: 'Slow down the audio (lower pitch).',
            emoji: '🚶'
        },
        {
            label: 'Ear rape',
            value: 'earrape',
            description: 'Extremely loud and distorted audio.',
            emoji: '👂'
        },
        {
            label: '8D',
            value: '8D',
            description: 'Simulate 8D audio effect (surround).',
            emoji: '🎧'
        },
        {
            label: 'Reverse',
            value: 'reverse',
            description: 'Reverse the audio.',
            emoji: '⏪'
        },
        {
            label: 'Treble',
            value: 'treble',
            description: 'Increase the high frequencies.',
            emoji: '🎼'
        },
        {
            label: 'Low Quality',
            value: 'low_quality',
            description: 'Lower audio quality by decreasing sample rate.',
            emoji: '⬇️'
        },
        {
            label: 'Back Rooms',
            value: 'backrooms',
            description: 'Lower audio quality by decreasing sample rate a lot.',
            emoji: '🚪'
        },
        {
            label: 'High Quality',
            value: 'high_quality',
            description: 'Raise audio quality by increasing sample rate.',
            emoji: '⬆️'
        },
        {
            label: 'Phaser',
            value: 'phaser',
            description: 'Make the audio have a distortion effect.',
            emoji: '💫'
        },
        {
            label: 'Tremolo',
            value: 'tremolo',
            description: 'Make the audio increase and decrease volume.',
            emoji: '🎚️'
        },
        {
            label: 'Vibrato',
            value: 'vibrato',
            description: 'Make the audio increase and decrease pitch.',
            emoji: '🎛️'
        },
        {
            label: 'Normalizer',
            value: 'normalizer',
            description: 'Normalize the audio (avoid distortion).',
            emoji: '🎶'
        }
    ]
};

module.exports.ffmpegFilterOptionsPage2 = {
    threadAmount: '2',
    availableFilters: [
        {
            label: 'Pulsator',
            value: 'pulsator',
            description: 'Makes the audio move left and right.',
            emoji: '↔️'
        },
        {
            label: 'Flanger',
            value: 'flanger',
            description: 'Another distortion effect?',
            emoji: '🌀'
        },
        {
            label: 'Mono audio',
            value: 'mono',
            description: 'Audio plays from one sound channel.',
            emoji: '1️⃣'
        },
        {
            label: 'Compressor',
            value: 'compressor',
            description: 'Compresses audio?',
            emoji: '📉'
        },
        {
            label: 'Expander',
            value: 'expander',
            description: 'Expands audio?',
            emoji: '📈'
        },
        {
            label: 'Fade In',
            value: 'fadein',
            description: 'Fades in audio.',
            emoji: '➕'
        },
        {
            label: 'Karaoke',
            value: 'karaoke',
            description: 'karaoke',
            emoji: '🎤'
        }
    ]
};

