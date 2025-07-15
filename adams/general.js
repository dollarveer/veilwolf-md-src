
const { adams } = require("../Ibrahim/adams");
const conf = require("../config");

adams({ nomCom: "owner", categorie: "General", reaction: "🚘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;
    
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + conf.OWNER_NAME + '\n' +
      'ORG:VEILWOLF_XMD\n' +
      'TEL;TYPE=CELL,VOICE:+'+ conf.OWNER_NUMBER + '\n' +
      'END:VCARD';
    
    zk.sendMessage(dest, {
        contacts: {
            displayName: conf.OWNER_NAME,
            contacts: [{ vcard }],
        },
    }, { quoted: ms });
});

adams({ nomCom: "dev", categorie: "General", reaction: "🚘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;

    const devs = [
      { nom: "Ai_Vinnie", number:  "254702528705"}
    ];

    let message = "WELCOME TO VEILWOLF_XMD HELP CENTER! CONTACT THE DEVELOPER:\n\n";
    for (const dev of devs) {
      message += `• ${dev.nom} : https://wa.me/${dev.number}\n`;
    }
    
    var lien = mybotpic;
    if (lien.match(/\.(mp4|gif)$/i)) {
        try {
            zk.sendMessage(dest, { video: { url: lien }, caption: message }, { quoted: ms });
        }
        catch (e) {
            console.log("Error sending message: " + e);
            repondre("Error sending message: " + e);
        }
    } 
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        try {
            zk.sendMessage(dest, { image: { url: lien }, caption: message }, { quoted: ms });
        }
        catch (e) {
            console.log("Error sending message: " + e);
            repondre("Error sending message: " + e);
        }
    } 
    else {
        repondre("Error: Invalid media link");
    }
});

adams({ nomCom: "support", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage } = commandeOptions; 
    
    const supportMessage = `
THANK YOU FOR CHOOSING VEILWOLF_XMD

SUPPORT LINKS:
☉ Channel: https://whatsapp.com/channel/0029VbAZSQ0J93wVFOS5rT26
☉ Twitter/X: https://x.com/ai_vinnie_?t=-30S0vuMr2p74OZWLRNFNA&s=08
☉ Main Link: https://veilwolf.site
☉ Email: ai_vinnie@veilwolf.site

Created by Ai_Vinnie
`;
    
    repondre(supportMessage);
    await zk.sendMessage(auteurMessage, {
        text: `THANK YOU FOR CHOOSING VEILWOLF_XMD, MAKE SURE YOU FOLLOW THESE LINKS.`
    }, { quoted: ms });
});
