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
    const taskflowPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(taskflowPath)
      .filter(file => path.extname(file) === ".js");

    const thisFile = path.basename(__filename); // current file, e.g., update.js

    // Clear require cache (except self)
    for (const file of commandFiles) {
      if (file !== thisFile) {
        const fullPath = path.join(taskflowPath, file);
        delete require.cache[require.resolve(fullPath)];
      }
    }

    // Clear commands
    cm.length = 0;

    // Reload all files except this one
    let loadedCount = 0, errorCount = 0;

    for (const file of commandFiles) {
      if (file !== thisFile) {
        try {
          require(path.join(taskflowPath, file));
          loadedCount++;
        } catch (e) {
          console.error(`❌ Failed to reload ${file}:`, e.message);
          errorCount++;
        }
      }
    }

    // ✅ Delay loading self to prevent runtime clash
    setTimeout(() => {
      try {
        delete require.cache[require.resolve(__filename)];
        require(__filename);
        console.log(`✅ Self-reloaded: ${thisFile}`);
      } catch (err) {
        console.error(`❌ Failed to reload self (${thisFile}):`, err.message);
      }
    }, 500); // reload self after short delay

    await zk.sendMessage(chatId, {
      text: `✅ *Reload Complete!*\n\n🗂️ ${loadedCount} command(s) reloaded.\n❌ ${errorCount} failed.\n\nSelf will reload quietly.`
    });

  } catch (error) {
    console.error("❌ Error reading command folder:", error.message);
    await zk.sendMessage(chatId, {
      text: `❌ *Failed to reload commands!*\n\nError: ${error.message}`
    });
  }
});
