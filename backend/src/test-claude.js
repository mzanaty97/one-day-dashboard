require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{ role: 'user', content: 'Say "One Day Dashboard is connected!" and nothing else.' }],
  });
  console.log(message.content[0].text);
}

test().catch(console.error);
