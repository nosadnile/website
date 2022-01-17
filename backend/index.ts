import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import httpProxy from "express-http-proxy";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const port = process.env.PORT || 9998;
const frontendPort = process.env.FRONTEND_PORT || 9997;
const frontend = httpProxy(`http://localhost:${frontendPort}`, {});

const app = express();
const servlet = http.createServer(app);
const io = new Server(servlet);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", frontend);
app.get("/*", frontend);
app.post("/", frontend);
app.post("/*", frontend);

servlet.listen(port, () => { console.log(`Server listening on port ${port}!`); });