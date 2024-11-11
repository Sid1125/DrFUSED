const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = "AIzaSyC1mg5FREHkZASqpzcLqDGmVStwhLxcmoI";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function getGoogleGenerativeResponse(userMessage) {
      try {
          // Initialize the model with "gemini-1.5-flash"
          const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
          // Set up a custom response for "who are you" or similar phrases
          if (userMessage.toLowerCase() === "who are you" || userMessage.toLowerCase().includes("who are you")) {
              return `Hello! I'm your helpful Discord bot, designed to bring more fun, engagement, and utility to our server! 🌟
              
              **What I Do:** I'm here to make your experience enjoyable and seamless. Think of me as a knowledgeable assistant with a dash of personality! I’m trained on a variety of text data to understand and respond to your questions, requests, and even some quirky prompts.
  
              **My Key Features:**
              - **Friendly Chat & Responses**: Whether it's answering questions, engaging in conversation, or just having fun, I'm here to help.
              - **Useful Tools**: From moderation to role management, I've got your server’s back!
              - **Games & More**: Try my RPG game, trivia, and other engaging activities to add some fun to the chat.
              - **Seamless Music Playback**: Got a song request? I can play music for the channel to keep the vibe going.
  
              Remember: I'm always learning and evolving to serve you better, so if you have feedback, feel free to let me know. Enjoy your time with me here!`;
          }
  
          // For other messages, generate a response using the model
          const result = await model.generateContent({
              contents: [{ role: "user", parts: [{ text: userMessage }] }],
              generationConfig,
          });
  
          // Return the generated text or throw an error if no response is found
          if (result && result.response && typeof result.response.text === "function") {
              return result.response.text();
          } else {
              throw new Error("No text found in the response.");
          }
      } catch (error) {
          console.error("Error in getGoogleGenerativeResponse:", error.message);
          throw error;
      }
  }
  
  module.exports = { getGoogleGenerativeResponse };
  