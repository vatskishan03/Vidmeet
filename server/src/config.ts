export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  streamApiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
  streamApiSecret: process.env.STREAM_SECRET_KEY,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  googleCloudCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  bucketName: process.env.BUCKET_NAME || 'default-bucket'
});