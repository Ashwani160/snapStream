import { app } from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config() // loads the enivornment variable from .env file into process.env so it can be accessed anywhere in the app

let port = process.env.port || 8001;

// app.listen(port, ()=>{
//     console.log(`Server is running on port ${port}`)
// })

connectDB()
.then(()=>{  
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
})
.catch((err)=>{
    console.log(err)
})