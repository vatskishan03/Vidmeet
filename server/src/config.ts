export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  streamApiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
  streamApiSecret: process.env.STREAM_SECRET_KEY,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
});