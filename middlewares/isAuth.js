import jwt from "jsonwebtoken"
const isAuth=async (req,res,next) => {
    try {
        const cookieToken=req.cookies?.token
        const authHeader=req.headers?.authorization
        const bearerToken=authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
        const token=cookieToken || bearerToken
        if(!token){
            return res.status(401).json({message:"token not found"})
        }
        const decodeToken=jwt.verify(token,process.env.JWT_SECRET)
        if(!decodeToken){
 return res.status(401).json({message:"token not verify"})
        }
        req.userId=decodeToken.userId
        next()
    } catch (error) {
         return res.status(401).json({message:"isAuth error"})
    }
}

export default isAuth