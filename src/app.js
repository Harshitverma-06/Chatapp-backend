import express, { urlencoded } from 'express'
import cors from "cors"
import cookieParser from "cookie-parser"
import messageRoutes from './routes/message.routes.js'
import authRoutes from './routes/auth.routes.js'
import arcjetProtection from './middlewares/arcjet.middleware.js'

const app = express()

app.use(urlencoded({extended: true , limit: "16kb"}))
app.use(express.json({limit: "16kb"}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
app.use(arcjetProtection)



//Routes declaration
app.use("/api/auth",authRoutes)
app.use("/api/message", messageRoutes)


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || []
  })
})


export default app