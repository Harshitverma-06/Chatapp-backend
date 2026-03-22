import dotenv from "dotenv"
dotenv.config()
import app from './app.js'
import connectDB from "./db/db.js"

const port = process.env.PORT || 8000

connectDB()
.then(()=>{
    app.listen(port, (req,res) => console.log(`server is listening on http://localhost:${port}`));
    app.get('/',(req,res)=>{
        res.send("konichiwa twen")
    })
})
.catch((error)=>{
    console.log("MONGODB CONNECTION FAILED 2!!",error);   
})






