import Post from "../models/article.model.js";

export const createPost = async (req, res) => {
    const { title, content, image, category, isVerified } = req.body;
    if(!title || !content || !category){
        return res.status(400).json({message:"Please fill in all fields"});
    }
    if(title.length<5){
        return res.status(400).json({message:"Title must be at least 5 characters long"});
    }
    if(content.length<20){
        return res.status(400).json({message:"Content must be at least 20 characters long"});
    }
    if(category.length<3){
        return res.status(400).json({message:"Category must be at least 3 characters long"});
    }
    const post = { title, content, image, category, isVerified };
    try {
        const newPost = new Post(post);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        const totalArticles = posts.length;
        const verifiedArticles = posts.filter(post=>post.isVerified).length;
        const unverifiedArticles = totalArticles-verifiedArticles;
        res.status(200).json({posts,totalArticles,verifiedArticles,unverifiedArticles});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updatePosts=async(req,res)=>{
    
}