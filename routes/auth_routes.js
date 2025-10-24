import express from 'express'
import {signUp , signIn , getMe} from '../controllers/auth_controllers.js'
import isAuth from '../middlewares/isAuth.js'

const authRouter = express.Router()

authRouter.post('/signup' , signUp)
authRouter.post('/signin' , signIn)
authRouter.get('/me' , isAuth , getMe)

export default authRouter;