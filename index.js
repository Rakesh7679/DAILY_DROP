import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app=express()
const server=http.createServer(app)
const port = Number(process.env.PORT) || 5000

const defaultOrigins = [
  "http://localhost:5173",
  "https://boisterous-melba-c3a63a.netlify.app",
]

const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins

const corsOrigin = (origin, callback) => {
  // Allow non-browser requests (origin can be undefined in tools/postman/mobile webviews)
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
    return
  }
  callback(new Error("Not allowed by CORS"))
}

const io=new Server(server,{
   cors:{
    origin:allowedOrigins,
    credentials:true,
    methods:['POST','GET']
}
})

app.set("io",io)

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/shop",shopRouter)
app.use("/api/item",itemRouter)
app.use("/api/order",orderRouter)

socketHandler(io)
server.listen(port,()=>{
    connectDb()
    console.log(`server started at ${port}`)
})

