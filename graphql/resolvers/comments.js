const { UserInputError, AuthenticationError } = require("apollo-server")
const Post = require("../../models/Post")
const checkAuth = require("../../utils/check-auth")

module.exports = {
    Mutation: {
        createComment: async(_,{postId,body},context)=>{
            const {username} = checkAuth(context)//check if user is authenticated
            //check if body of comment is not null
            if(body.trim()===""){
                throw new UserInputError('Empty comment',{
                    errors:{
                        body:'Comment body cannot be empty'
                    }
                })
            }
            //find post 
            const post = await Post.findById(postId)
            if(post){
                post.comments.unshift({
                    body,
                    username,
                    createdAt:new Date().toISOString()
                })
                await post.save()
                return post
            }else {
                throw new UserInputError('Post not found')
            }
        },
        deleteComment: async(_,{postId,commentId},context)=>{
            const {username} = checkAuth(context)//user auth

            //get post
            const post = await Post.findById(postId)
            if(post){
                const commentIndex = post.comments.findIndex(c => c.id ===commentId)
                if(post.comments[commentIndex].username === username){
                    post.comments.splice(commentIndex,1)
                    await post.save()
                    return post;

                }else {
                    throw new AuthenticationError('Action not allowed')
                }
            }else {
                throw new UserInputError('Post not found')
            }

        }
    }
}