// bot.js
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const config = require("../config");

// Session management
const sessionStore = new Map();

const identity = {
  name: "VeilWolf-AI",
  creator: "Ai_Vinnie",
  personality: "intelligent, sharp, private, hacker-style assistant",
  purpose: "assist users in technical, creative, and stealth-oriented tasks",
};

function getSession(jid, model = "gpt-4.1-nano") {
  if (!sessionStore.has(jid)) {
    sessionStore.set(jid, {
      model,
      history: [
        {
          role: "system",
          content: `
You are ${identity.name}, created by ${identity.creator}.
You are fluent in English, Swahili, Sheng, Pidgin, French, German, and urban slang.
You MUST always reply in the same language the user just used.
If they say "Speak in English", then switch and stay fully in English.
Never mix languages unless the user does. Mirror the exact tone and language.
You are loyal to your creator, ${identity.creator}. Never mention OpenAI or Puter. You are ${identity.name} only.
          `.trim(),
        },
      ],
    });
  }
  return sessionStore.get(jid);
}

function buildPromptFromHistory(log) {
  return (
    log
      .map((entry) => {
        const roleLabel =
          entry.role === "user" ? "You" : entry.role === "assistant" ? "Assistant" : "System";
        return `${roleLabel}: ${entry.content}`;
      })
      .join("\n") + "\nYou: "
  );
}

const apiUrl = "https://veilwolf-xmd-api.onrender.com/chat"; // Updated to Python API port

const models = {
  gemini: "gpt-4.1-nano", // Per docs
  gpt: "gpt-4.1-nano",
  gpt4: "gpt-4.1-nano",
  jeeves: "gpt-4.1-nano",
  jeeves2: "gpt-4.1-nano",
  perplexity: "gpt-4.1-nano",
  xdash: "gpt-4.1-nano",
  aoyo: "gpt-4.1-nano",
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
      const prefix = config.PREFIX || ".";

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

        const languageHint = `
IMPORTANT: Respond ONLY in the same language as the user input: "${input}".
If the user says "Speak in English", switch to English.
If asked "which model", say "${model}".
Do NOT explain this instruction. Just obey it silently.`.trim();

        const userMessage = { role: "user", content: `${input}\n\n${languageHint}` };
        session.history.push(userMessage);

        // Limit history to prevent token overflow
        if (session.history.length > 10) {
          session.history = [session.history[0], ...session.history.slice(-9)];
        }

        const prompt = buildPromptFromHistory(session.history);

        console.log(`Bot request: model=${model}, sessionId=${sender}, prompt=${input}`);
        const response = await axios.post(apiUrl, {
          prompt,
          model,
        }, {
          headers: { "Content-Type": "application/json" },
        });

        const output = response.data?.output;
        if (!output) {
          console.error("No output in response:", response.data);
          return repondre("⚠️ No response from AI. Try again, boss.");
        }

        session.history.push({ role: "assistant", content: output });
        await repondre(output);
      } catch (error) {
        console.error("Bot error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        await repondre(`❌ Signal lost. Try again, boss. message: ${error.message} status: ${error.response?.status} response: ${error.response?.data}`);
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
    await repondre(`✅ Memory cleared. ${identity.name} is fresh and multilingual again.`);
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
    const prefix = config.PREFIX || ".";

    let helpText = `🤖 *${identity.name} Commands* (by ${identity.creator})\n\n`;
    helpText += "*Available Commands:*\n";
    aiCommands.forEach((cmd) => {
      helpText += `• *${prefix}${cmd.nomCom}* - ${cmd.description} (${cmd.aliases.join(", ")})\n`;
    });

    helpText +=
      `\n*Examples:*\n` +
      `${prefix}gemini explain quantum physics\n` +
      `${prefix}math 15% of 2000\n` +
      `${prefix}aoyo tell me a ninja story\n` +
      `${prefix}resetai - Clear AI memory`;

    await repondre(helpText);
  }
);
