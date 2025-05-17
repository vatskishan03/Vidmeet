const record = require('node-record-lpcm16'); // No `.start` method
const speech = require('@google-cloud/speech');
const path = require('path');

// Set the path to your service account key
const keyFilePath = path.join(__dirname, 'your-service-account-file.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;

// Initialize the Speech-to-Text client
const client = new speech.SpeechClient();

// Configure the request
const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  },
  interimResults: true, // Receive interim results for real-time transcription
};

console.log('Listening... Speak into your microphone.');

// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .on('data', (data) => {
    console.log(
      `Transcription: ${data.results[0]?.alternatives[0]?.transcript}`
    );
    if (data.results[0]?.isFinal) {
      console.log('Final Transcription:', data.results[0].alternatives[0].transcript);
    }
  });

// Start recording and pipe the audio into the Speech API
record({
  sampleRateHertz: 16000,
  threshold: 0.5, // Adjust sensitivity
  verbose: true, // Enable logging
  recordProgram: 'sox', // Explicitly use Sox
  silence: '10.0', // Stop recording after 10 seconds of silence
})
  .on('error', (err) => {
    console.error('Recording error:', err);
  })
  .pipe(recognizeStream);


  //This is a startup-grade full-stack project, I want to build an AI-Powered video conferencing application, the application will support the features which are there in current conventional video conferencing applications like Zoom, Google Meet, etc. but with some additional features like AI-Powered background removal, AI-Powered noise cancellation, AI-Powered video enhancement, AI-Powered virtual avatars, AI-Powered meeting summaries, AI-Powered meeting notes, AI-Powered meeting transcription, AI-Powered meeting highlights, AI-Powered meeting action items, AI-Powered meeting follow-ups, AI-Powered meeting reminders, AI-Powered meeting scheduling, AI-Powered meeting analytics.
