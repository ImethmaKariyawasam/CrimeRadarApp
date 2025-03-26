import { json, Request, Response } from "express";
import dialogflowAPI from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
require("dotenv").config();

//Credentails

// Dialogflow project ID from the environment
const projectId = "sociallogin-409512";

//config
const CONFIGURATION = {
  credentials: {
    private_key: process.env.PRIVATE_KEY,
    client_email: "test-851@sociallogin-409512.iam.gserviceaccount.com",
  },
};

// Initialize Dialogflow session client
const sessionClient = new dialogflowAPI.SessionsClient(CONFIGURATION);

// Function to send a query to Dialogflow
export const dialogflow = async (req: Request, res: Response) => {
  let { text } = req.body;

  // Generate a unique session ID for each request
  const sessionId = uuidv4();

  try {
    // Define the session path
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    // Create the Dialogflow request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text.toLowerCase(), // The user's query
          languageCode: "en-US", // Modify the language code if needed
        },
      },
    };

    // Send the request to Dialogflow and get the response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Return the response from Dialogflow
    return res.status(200).json({
      response: result?.fulfillmentText,
    });

  } catch (error) {
    console.error("Dialogflow error:", error);
    return res.status(500).json({ error: "Failed to process the inquiry." });
  }
};

export const playAudio = async (req: Request, res: Response) => {
  const text = req.body.text;
  const apiKey = "AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps";
  const endPoint =
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const audioData = {
    input: { text: text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };
  try {
    const response = await axios.post(endPoint, audioData);
    const audioContent = response.data.audioContent;
    res.json({ audioContent });
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
};

export const speechToText = async (req: Request, res: Response) => {
  const data = req.body;
  const audioUrl = data?.audioUrl;
  const audioConfig = data?.config;

  if (!audioUrl) return res.status(422).send("No audio URL was provided.");
  if (!audioConfig)
    return res.status(422).send("No audio config was provided.");

  try {
    const speechResults = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize",
      {
        method: "POST",
        body: JSON.stringify({
          audio: {
            content: audioUrl,
          },
          config: audioConfig,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-goog-api-key": `${process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY}`,
        },
      }
    ).then((response) => response.json());
    console.log("Speech-to-text results: ", speechResults);
    return res.send(speechResults);
  } catch (err) {
    console.error("Error converting speech to text: ", err);
    res.status(404).send(err);
    return err;
  }
};

