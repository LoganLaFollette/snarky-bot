require("dotenv/config");
const { Client, IntentsBitField } = require("discord.js");
const { OpenAI } = require("openai");

const KIANS_ID = "696172599688036397";

const aiClient = new OpenAI();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Snarky is online!");
});

client.on("messageCreate", async (message) => {
  //   console.log(message);
  if (message.author.id !== KIANS_ID) return;

  let conversationLog = [
    {
      role: "system",
      content:
        "you are a snarky chat bot hoping to refute any message sent to you",
    },
  ];

  let prevMessages = await message.channel.messages.fetch({ limit: 15 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (msg.author.id !== client.user.id && message.author.bot) return;
    if (msg.author.id !== message.author.id) return;

    conversationLog.push({
      role: "user",
      content: msg.content,
    });
  });

  await message.channel.sendTyping();

  const chatCompletion = await aiClient.chat.completions.create({
    messages: conversationLog,
    model: "gpt-3.5-turbo",
  });

  message.reply(chatCompletion.choices[0].message);
});

client.login(process.env.TOKEN);
