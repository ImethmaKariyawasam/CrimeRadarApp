import express from 'express';
import { dialogflow, playAudio, speechToText } from '../controllers/dialogflow.controller';
const dialogflowRouter = express.Router();

dialogflowRouter.post('/getdialogflow', dialogflow);
dialogflowRouter.post('/play-text', playAudio);
dialogflowRouter.post('/speech-to-text', speechToText);

export default dialogflowRouter;