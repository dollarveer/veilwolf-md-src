const fs = require("fs");
const path = require("path");
const { adams, cm } = require("../Ibrahim/adams");

adams({
  nomCom: 'update',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  try {
    const taskflowPath = path.join(__dirname); // Folder where this command lives
    const commandFiles = fs.readdirSync(taskflowPath)
      .filter(file => path.extname(file).toLowerCase() === ".js");

    // Clear require cache for each command
    for (const file of commandFiles) {
      const fullPath = path.join(taskflowPath, file);
      delete require.cache[require.resolve(fullPath)];
    }

    // Clear current command list
    cm.length = 0;

    // Reload all command files (body.js style)
    let loadedCount = 0;
    let errorCount = 0;

    commandFiles.forEach((fichier) => {
      try {
        require(path.join(taskflowPath, fichier));
        loadedCount++;
      } catch (e) {
        errorCount++;
        console.error(`❌ Failed to load ${fichier}: ${e.message}`);
      }
    });

    await zk.sendMessage(chatId, {
      text: `✅ *Reload Complete!*\n\n🗂️ ${loadedCount} command(s) reloaded.\n❌ ${errorCount} failed.\n\nUse commands as usual.`
    });

  } catch (error) {
    console.error("❌ Error reading Taskflow folder:", error.message);
    await zk.sendMessage(chatId, {
      text: `❌ *Failed to reload commands!*\n\nError: ${error.message}`
    });
  }
});
