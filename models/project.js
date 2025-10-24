import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title : {
    type : String,
    required : true
  } ,
  description : {
    type : String,
    required : true
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",

  },
  members : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  }],

  tasks : [{
    type : mongoose.Schema.Types.ObjectId,
    ref :"Task"
  }],
  status : {
    type : String,
    enum : ["active" , "completed" , "on-hold", "cancelled"],
    default : "active"
  },
  priority : {
    type : String,
    enum : ["low" , "medium" , "high"],
    default : "medium"
  },
  dueDate : {
    type : Date,
    required : false
  },
  createdAt : {
    type : Date,
    default : Date.now
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
})

const Project = mongoose.model("Project" , projectSchema)

export default Project

