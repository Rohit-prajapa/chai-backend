import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
  }),
);

app.use(express.json({ limit: "16Kb" }))
app.unsubscribe(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("Public"))
app.use(cookieparser)


export {app}
