import jwt from 'jsonwebtoken'

const generateToken = async (id) =>{
  try{
    const token = jwt.sign({userId: id} , process.env.JWT_TOKEN , {
      expiresIn :"30d"
    })
    console.log("token created successfully")
    return token

  }catch(err){
    console.log("could not generate token" , err)
  }
}

export default generateToken