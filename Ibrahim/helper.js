const NEWS_LETTER_JID = "120363285388090068@newsletter"; // Replace with your real one
const BOT_NAME = "VEILWOLF_XMD";
const DEFAULT_THUMBNAIL = "https://raw.githubusercontent.com/dollarveer/veilwolf-md-src/refs/heads/main/fotor_1752486419384.jpg";

const createContext = (userJid, options = {}) => ({
  contextInfo: {
    mentionedJid: [userJid]
  }
});

module.exports = {
    createContext
};
