const bcrypt = require('bcryptjs')
const jtw = require('jsonwebtoken')
const {UserInputError} = require('apollo-server')

const {validateRegisterInput,validateLoginInput} =require('../../utils/validators')
const User = require('../../models/User')
const {SECRET_KEY} = require('../../config')


function generateToken(user){
    return jtw.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' })
}

module.exports = {
    Mutation:{
        async login(_,{username,password}){
          const {errors,valid} = validateLoginInput(username,password)
          if(!valid){
              throw new UserInputError('Wrong Credentials', { errors })
          }
          const user = await User.findOne({username})
          if(!user) {
              errors.general = 'User not found'
                throw new UserInputError('User not found',{errors})
            }  
            const match = await bcrypt.compare(password,user.password)
            if(!match){
                errors.general = 'Wrong Credentials'
                throw new UserInputError('Wrong Credentials', { errors })
            }
            //login is correct at this point
            //issue a token
            const token = generateToken(user)
            return {
                ...user._doc,
                id: user.id,
                token
            }

        },
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
            const token = generateToken(res)
            return {
                ...res._doc,
                id:res.id,
                token
            }
        }
    }
}