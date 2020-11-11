const postResolvers = require('./posts')
const userResolvers = require('./users')
const commentsResolvers = require('./comments')
module.exports={
    //calculate the number of comments and likes serverside
    Post:{
        likeCount:(parent)=>{
            return parent.likes.length
        },
        commentCount:(parent)=>{
            return parent.likes.length
        }
    },
    Query:{
        ...postResolvers.Query
    },
    Mutation:{
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription:{
        ...postResolvers.Subscription
    }
}