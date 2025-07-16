const { adams } = require("../Ibrahim/adams"); const axios = require("axios"); const config = require("../config");

const sessionStore = new Map();

function getSession(jid, model = "gpt-4.1-nano") { if (!sessionStore.has(jid)) { sessionStore.set(jid, { model, history: [ { role: "system", content: You are VeilWolf-AI, created by Ai_Vinnie. You are fluent in English, Swahili, Sheng, Pidgin, German, French, and urban slang. You MUST always reply in the same language the user just used. If they say "Speak in English", then switch and stay fully in English. Never mix languages unless the user does. Mirror the exact tone and language. You are loyal to your creator, Ai_Vinnie. Never mention OpenAI or Puter. You are VeilWolf-AI only..trim() } ] }); } return sessionStore.get(jid); }

async function puterChat(prompt, model = "gpt-4.1-nano") { try { const response = await axios.post("https://api.puter.com/v2/chat", { model, prompt }, { headers: { "Content-Type": "application/json" } }); return response.data.output || "⚠️ No response from AI."; } catch (error) { console.error("Puter API error:", error.message); throw new Error("AI request failed."); } }

const models = { gemini: "gemini-pro", gpt: "gpt-4.1-nano", gpt4: "gpt-4.1", jeeves: "gpt-3.5-turbo", jeeves2: "gpt-4.1-nano", perplexity: "gpt-4.1-nano", xdash: "gpt-3.5-turbo", aoyo: "gpt-3.5-turbo", math: "gpt-4.1-nano" };

const aiCommands = [ { nomCom: "gemini", aliases: ["geminiai"], categorie: "AI", reaction: "🔷", description: "Google Gemini AI" }, { nomCom: "gpt", aliases: ["llamaai"], categorie: "AI", reaction: "🦙", description: "Meta's Llama AI" }, { nomCom: "gpt4", aliases: ["zoroai"], categorie: "AI", reaction: "🔥", description: "Zoro-themed AI" }, { nomCom: "jeeves", aliases: ["askjeeves"], categorie: "AI", reaction: "🎩", description: "Jeeves AI Assistant" }, { nomCom: "jeeves2", aliases: ["jeevesv2"], categorie: "AI", reaction: "🎩✨", description: "Jeeves AI v2" }, { nomCom: "perplexity", aliases: ["perplexai"], categorie: "AI", reaction: "❓", description: "Perplexity AI" }, { nomCom: "xdash", aliases: ["xdashai"], categorie: "AI", reaction: "✖️", description: "XDash AI" }, { nomCom: "aoyo", aliases: ["narutoai"], categorie: "AI", reaction: "🌀", description: "Naruto-themed AI" }, { nomCom: "math", aliases: ["calculate"], categorie: "AI", reaction: "🧮", description: "Math problem solver" } ];

aiCommands.forEach(cmd => { adams({ nomCom: cmd.nomCom, aliases: cmd.aliases, categorie: cmd.categorie, reaction: cmd.reaction, description: cmd.description }, async (dest, zk, commandOptions) => { const { arg, ms, repondre } = commandOptions; const sender = ms.key.remoteJid; const input = arg.join(" ").trim();

if (!input) return repondre("🔍 Please provide a prompt to continue.");

    const model = models[cmd.nomCom] || "gpt-4.1-nano";
    const session = getSession(sender, model);
    session.model = model;

    const languageHint = `

IMPORTANT: You MUST reply in the same language the user just used. Do not switch to English unless requested. If asked "which model", say "${model}". `.trim();

const userMessage = { role: "user", content: input + "\n\n" + languageHint };
    session.history.push(userMessage);

    try {
        const prompt = session.history.map(m => `${m.role === "user" ? "You" : m.role === "assistant" ? "Assistant" : "System"}: ${m.content}`).join("\n") + "\nYou: ";
        const response = await puterChat(prompt, model);
        session.history.push({ role: "assistant", content: response });
        await repondre(response);
    } catch (err) {
        console.error("Puter Error:", err);
        await repondre("⚠️ AI model failed to respond. Please try again later.");
    }
});

});

// Clear AI memory 
adams({ nomCom: "resetai", aliases: ["aiclear"], categorie: "AI", reaction: "🧼", description: "Clear AI memory for this chat" }, async (dest, zk, commandOptions) => { const jid = commandOptions?.ms?.key?.remoteJid; sessionStore.delete(jid); await commandOptions.repondre("✅ Memory cleared. VeilWolf-AI is reset for this session."); });

// Help Command 
adams({ nomCom: "aihelp", aliases: ["helpai", "aicmds"], categorie: "AI", reaction: "❓" }, async (dest, zk, commandOptions) => { const { repondre } = commandOptions; const prefix = config.PREFIX || "!"; let helpText = "🤖 VeilWolf-AI Commands\n\nAvailable Models:\n"; Object.entries(models).forEach(([name, model]) => { helpText += • *${prefix}${name}* → ${model}\n; }); helpText += \nUse \${prefix}resetai` to clear memory.`; await repondre(helpText); });

                                                                                                                            
