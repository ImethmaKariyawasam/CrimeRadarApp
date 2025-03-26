import express from 'express';
import { getPosts } from '../controllers/article.controller';
const articleRouter = express.Router();

articleRouter.get('/posts', getPosts);

export default articleRouter;
