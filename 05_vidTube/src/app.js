import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app =express()


// const uri = "mongodb+srv://ashwani11002004:<db_password>@cluster0.k9vfrom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use( //cross origin resource sharing
    cors({
        origin: process.env.CORS_ORIGIN,
        // origin: "http://localhost:5173", 
        credentials: true  // allows cookies, authorization headers and tls client certificates to be sent in cross-origin requests 
    })
)
app.use(express.json({limit: "16kb"})) // parse incoming JSON bodies (like from POST, PUT) and make them available under req.body. 
//                                        limit set the maximum size of the JSON payload that the server will accept.
//                                        handle data of type application/json 
//                                        parses JSON strings '{"name:"ashwani, "age": 21}'
app.use(express.urlencoded({extended: true, limit: "16kb"})) // parses incoming form data and put the parsed in req.body
//                                                              handle data of type application/x-www-form-urlencoded
//                                                              parses URL-encoded strings (name=Ashwani&email=test)
app.use(express.static("public"))//If a file exists in the public folder, it can be directly accessed from the browser without creating a route for it.
app.use(cookieParser()) // parses cokkie and make them available in req.cookies

//import routes
import healthcheckrouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js"
import subscriptionrouter from "./routes/subscription.routes.js"
import videorouter from "./routes/video.routes.js"
//routes
app.use('/api/v1/healthcheck', healthcheckrouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/subs', subscriptionrouter)
app.use('/api/v1/videos', videorouter);


app.use(errorHandler)

export {app}