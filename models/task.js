import mongoose from 'mongoose'

const taskSchema =  new mongoose.Schema({
  title : {
    type : String,
    required : true
  },
  description : {
    type : String,
    required : true
  },
  status : {
    type : String,
    enum : ["todo" , "in-progress" , "completed"],
    default : "todo"
  },
  priority : {
    type : String,
    enum : ["low" , "medium" , "high"],
    required : true
  },
  dueDate : {
    type : Date,
    required : true
  },
  projectId : {
    type : mongoose.Schema.Types.ObjectId,
    ref  : "Project",
    required : true
  },
  assignedTo : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  createdAt : {
    type : Date,
    default : Date.now
  }
})

const Task = mongoose.model("Task" , taskSchema)

export default Task