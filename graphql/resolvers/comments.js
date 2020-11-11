const { UserInputError } = require("apollo-server")
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
        }
    }
}