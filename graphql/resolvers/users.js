const bcrypt = require('bcryptjs')
const jtw = require('jsonwebtoken')
const {UserInputError} = require('apollo-server')

const {validateRegisterInput} =require('../../utils/validators')
const User = require('../../models/User')
const {SECRET_KEY} = require('../../config')



module.exports = {
    Mutation:{
        async register(_,{registerInput:{username,password,email,confirmPassword}},context,info){
            //validate user data
            const {valid,errors} = validateRegisterInput(username,email,password,confirmPassword)
            if(!valid){
                throw new UserInputError('Errors',{errors})
            }
            //Makes sure user doesnt already exist
            const user = await User.findOne({username})
            if(user){
                throw new UserInputError("Username already exists",{
                    erros:{
                        username:'Username already exists'
                    }
                })
            }


            //hash password and create an auth token
            password = await bcrypt.hash(password,12);
            const newUser = new User({
                email,
                password,
                username,
                createdAt: new Date().toISOString()

            })
            const res = await newUser.save()
            const token = jtw.sign({
                id:res.id,
                email:res.email,
                username:res.username
            },SECRET_KEY,{expiresIn:'1h'})
            return {
                ...res._doc,
                id:res.id,
                token
            }
        }
    }
}