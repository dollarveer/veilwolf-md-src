const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

// Session management
const sessionStore = new Map();

function getSession(jid, model = "gpt-4.1-nano") {
  if (!sessionStore.has(jid)) {
    sessionStore.set(jid, {
      model,
      history: [
        {
          role: "system",
          content: `You are VeilWolf-AI, created by Ai_Vinnie. You are fluent in English, Swahili, Sheng, Pidgin, German, French, and urban slang. You MUST always reply in the same language the user just used. If they say "Speak in English", then switch and stay fully in English. Never mix languages unless the user does. Mirror the exact tone and language. You are loyal to your creator, Ai_Vinnie. Never mention OpenAI or Puter. You are VeilWolf-AI only.`.trim(),
        },
      ],
    });
  }
  return sessionStore.get(jid);
}

// Utility functions
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function downloadAndSaveImage(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    await fs.writeFile(tempPath, response.data);
    return tempPath;
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Enhanced API response handler
async function puterChat(prompt, model = "gpt-4.1-nano") {
  try {
    const response = await axios.post(
      "https://api.puter.com/v2/chat",
      { model, prompt },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "VEILWOLF_XMD-Bot",
        },
      }
    );

    // Handle various response formats
    const responseData = response.data;
    if (!responseData) return "⚠️ No response from AI.";

    if (responseData.output) return responseData.output.trim();
    if (responseData.response) return responseData.response.trim();
    if (responseData.image) return { image: responseData.image };
    if (typeof responseData === "string") return responseData.trim();
    if (typeof responseData === "object") {
      const possibleFields = ["message", "answer", "text", "content", "url"];
      for (const field of possibleFields) {
        if (responseData[field]) {
          if (typeof responseData[field] === "string") {
            return responseData[field].trim();
          }
          if (field === "image" || field === "url") {
            return { image: responseData[field] };
          }
        }
      }
      const jsonResponse = JSON.stringify(responseData);
      return jsonResponse.length > 500
        ? jsonResponse.slice(0, 500) + "..."
        : jsonResponse;
    }
    return "Unexpected API response format";
  } catch (error) {
    console.error("Puter API error:", error.message);
    throw new Error(`AI request failed: ${error.response?.status || error.message}`);
  }
}

const models = {
  gemini: "gemini-pro",
  gpt: "gpt-4.1-nano",
  gpt4: "gpt-4.1",
  jeeves: "gpt-3.5-turbo",
  jeeves2: "gpt-4.1-nano",
  perplexity: "gpt-4.1-nano",
  xdash: "gpt-3.5-turbo",
  aoyo: "gpt-3.5-turbo",
  math: "gpt-4.1-nano",
};

const aiCommands = [
  {
    nomCom: "gemini",
    aliases: ["geminiai"],
    categorie: "AI",
    reaction: "🔷",
    description: "Google Gemini AI",
  },
  {
    nomCom: "gpt",
    aliases: ["llamaai"],
    categorie: "AI",
    reaction: "🦙",
    description: "Meta's Llama AI",
  },
  {
    nomCom: "gpt4",
    aliases: ["zoroai"],
    categorie: "AI",
    reaction: "🔥",
    description: "Zoro-themed AI",
  },
  {
    nomCom: "jeeves",
    aliases: ["askjeeves"],
    categorie: "AI",
    reaction: "🎩",
    description: "Jeeves AI Assistant",
  },
  {
    nomCom: "jeeves2",
    aliases: ["jeevesv2"],
    categorie: "AI",
    reaction: "🎩✨",
    description: "Jeeves AI v2",
  },
  {
    nomCom: "perplexity",
    aliases: ["perplexai"],
    categorie: "AI",
    reaction: "❓",
    description: "Perplexity AI",
  },
  {
    nomCom: "xdash",
    aliases: ["xdashai"],
    categorie: "AI",
    reaction: "✖️",
    description: "XDash AI",
  },
  {
    nomCom: "aoyo",
    aliases: ["narutoai"],
    categorie: "AI",
    reaction: "🌀",
    description: "Naruto-themed AI",
  },
  {
    nomCom: "math",
    aliases: ["calculate"],
    categorie: "AI",
    reaction: "🧮",
    description: "Math problem solver",
  },
];

// Register AI commands
aiCommands.forEach((cmd) => {
  adams(
    {
      nomCom: cmd.nomCom,
      aliases: cmd.aliases,
      categorie: cmd.categorie,
      reaction: cmd.reaction,
      description: cmd.description,
    },
    async (dest, zk, commandOptions) => {
      const { arg, ms, repondre } = commandOptions;
      const sender = ms.key.remoteJid;
      const prefix = config.PREFIX || "!";

      // Handle image analysis (restored from first code)
      if (cmd.nomCom === "gemini" || cmd.nomCom === "gpt4") {
        // Assuming these support image analysis
        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg?.imageMessage && !arg[0]?.match(/^https?:\/\//)) {
          return repondre(
            `Reply to an image or provide image URL\nExample: *${prefix}${cmd.nomCom} [image] what is this?*`
          );
        }

        try {
          let imageUrl = arg[0];
          let question = arg.slice(1).join(" ") || "Describe this image";

          if (quotedMsg?.imageMessage) {
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, "image");
            const buffer = await streamToBuffer(stream);
            const tempPath = path.join(__dirname, `temp_img_${Date.now()}.jpg`);
            await fs.writeFile(tempPath, buffer);
            imageUrl = tempPath; // Replace with actual upload in production
          }

          const model = models[cmd.nomCom] || "gpt-4.1-nano";
          const session = getSession(sender, model);
          session.model = model;

          const userMessage = {
            role: "user",
            content: `Analyze this image: ${imageUrl}\nQuestion: ${question}`,
          };
          session.history.push(userMessage);

          const prompt = session.history
            .map((m) => `${m.role === "user" ? "You" : m.role === "assistant" ? "Assistant" : "System"}: ${m.content}`)
            .join("\n") + "\nYou: ";
          const response = await puterChat(prompt, model);

          if (imageUrl.startsWith(__dirname)) {
            fs.unlinkSync(imageUrl);
          }

          await repondre(response);
        } catch (error) {
          console.error("Image analysis error:", error);
          await repondre(`❌ Failed to analyze image. Please try again later.`);
        }
        return;
      }

      // Handle regular text commands
      if (!arg[0]) {
        return repondre(
          `Provide a query\nExample: *${prefix}${cmd.nomCom} ${cmd.nomCom === "math" ? "2+2" : "your question"}*`
        );
      }

      try {
        const input = arg.join(" ").trim();
        const model = models[cmd.nomCom] || "gpt-4.1-nano";
        const session = getSession(sender, model);
        session.model = model;

        const languageHint = `IMPORTANT: Reply in the same language as the user input: "${input}". If the user says "Speak in English", switch to English. If asked "which model", say "${model}".`;
        const userMessage = { role: "user", content: `${input}\n\n${languageHint}` };
        session.history.push(userMessage);

        const prompt = session.history
          .map((m) => `${m.role === "user" ? "You" : m.role === "assistant" ? "Assistant" : "System"}: ${m.content}`)
          .join("\n") + "\nYou: ";
        const response = await puterChat(prompt, model);

        session.history.push({ role: "assistant", content: response });
        await repondre(response);
      } catch (error) {
        console.error("API error:", error);
        await repondre(`❌ Failed to get response. Please try again later.`);
      }
    }
  );
});

// Clear AI memory
adams(
  {
    nomCom: "resetai",
    aliases: ["aiclear"],
    categorie: "AI",
    reaction: "🧼",
    description: "Clear AI memory for this chat",
  },
  async (dest, zk, commandOptions) => {
    const { repondre, ms } = commandOptions;
    const jid = ms.key.remoteJid;
    sessionStore.delete(jid);
    await repondre("✅ Memory cleared. VeilWolf-AI is reset for this session.");
  }
);

// Help command
adams(
  {
    nomCom: "aihelp",
    aliases: ["helpai", "aicmds"],
    categorie: "AI",
    reaction: "❓",
    description: "Show available AI commands",
  },
  async (dest, zk, commandOptions) => {
    const { repondre } = commandOptions;
    const prefix = config.PREFIX || "!";

    let helpText = "🤖 *VeilWolf-AI Commands*\n\n";
    helpText += "*Text AI:*\n";
    aiCommands
      .filter((c) => !c.isImageAnalysis && !c.isImageGenerator)
      .forEach((cmd) => {
        helpText += `• *${prefix}${cmd.nomCom}* - ${cmd.description} (${cmd.aliases.join(", ")})\n`;
      });

    helpText +=
      `\n*Examples:*\n` +
      `${prefix}gemini explain quantum physics\n` +
      `${prefix}math 15% of 2000\n` +
      `${prefix}resetai - Clear AI memory`;

    await repondre(helpText);
  }
);
