
// utils/contextManager.js
const NEWS_LETTER_JID = "120363285388090068@newsletter";
const BOT_INFO = {
    name: process.env.BOT_NAME || "VEILWOLF_XMD",
    version: "8.6Q",
    mode: process.env.NODE_ENV === "production" ? "Production" : "Development"
};
const thumbnails = [
"https://raw.githubusercontent.com/dollarveer/veilwolf-md-src/refs/heads/main/fotor_1752486419384.jpg",
"https://raw.githubusercontent.com/dollarveer/veilwolf-md-src/refs/heads/main/fotor_1752486485098.jpg"
  ];
const DEFAULT_THUMBNAIL = thumbnails[Math.floor(Math.random() * thumbnails.length)];
const createContext2 = (userJid, options = {}) => ({
    contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWS_LETTER_JID,
            newsletterName: BOT_NAME,
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: options.title || BOT_NAME,
            body: options.body || "Premium WhatsApp Bot Solution",
            thumbnailUrl: options.thumbnail || DEFAULT_THUMBNAIL,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true 
        }
    }
});

module.exports = {
    createContext2,
    BOT_INFO
};
