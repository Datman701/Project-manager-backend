import express from 'express'
import {createProject , getProjects , getProjectById , updateProject , deleteProject , addMember , deleteMember ,getMembers } from '../controllers/project_controllers.js'
import isAuth from '../middlewares/isAuth.js'

const projectRouter = express.Router()

projectRouter.post('/createproject' ,isAuth , createProject )
projectRouter.get('/getprojects' ,isAuth ,  getProjects )
projectRouter.post('/addmember/:projectId' , isAuth ,addMember )
projectRouter.get('/getmembers/:projectId' , isAuth, getMembers)
projectRouter.delete('/deletemember/:projectId' , isAuth , deleteMember)
projectRouter.get('/getproject/:projectId' ,isAuth , getProjectById )
projectRouter.patch('/updateproject/:projectId' ,isAuth , updateProject)
projectRouter.delete('/deleteproject/:projectId' , isAuth , deleteProject)

export default projectRouter