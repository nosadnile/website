import express from "express";
import httpProxy from "express-http-proxy";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import axios from "axios";

const port = process.env.PORT || 9996;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res, next) => {
    if(!req.query || !req.query.host || !req.query.port) {
        if(req.cookies.host && req.cookies.port) {
            req.query.host = req.cookies.host;
            req.query.port = req.cookies.port;
        } else {
            return res.status(400).type("text/plain").send("Missing parameters: [ host, port ]");
        }
    }
    let host = req.query.host;
    const port = req.query.port;
    if(port == "80" || port == "443") return res.status(400).type("text/plain").send(`Cannot use port ${port}.`);
    switch(host) {
        case "vm1":
            host = "dns.nosadnile.net";
            res.cookie("host", "vm1", { path: "/" });
            break;
        case "vm2":
            host = "dns2.nosadnile.net";
            res.cookie("host", "vm2", { path: "/" });
            break;
        default:
            res.status(400);
            res.type("text/plain");
            res.send("Invalid host! Valid hosts: [ vm1, vm2 ]");
            return;
    }
    const url = `http://${host}:${port}`;
    const proxy = httpProxy(url, { proxyErrorHandler: (err, res) => {
        res.status(500).type("text/plain").send("500 | An internal error occured.");
    } });
    res.cookie("port", port, { path: "/" });
    return proxy(req, res, next);
});

app.post("/", (req, res, next) => {
    if(!req.query || !req.query.host || !req.query.port) {
        if(req.cookies.host && req.cookies.port) {
            req.query.host = req.cookies.host;
            req.query.port = req.cookies.port;
        } else {
            return res.status(400).type("text/plain").send("Missing parameters: [ host, port ]");
        }
    }
    let host = req.query.host;
    const port = req.query.port;
    if(port == "80" || port == "443") return res.status(400).type("text/plain").send(`Cannot use port ${port}.`);
    switch(host) {
        case "vm1":
            host = "dns.nosadnile.net";
            res.cookie("host", "vm1", { path: "/" });
            break;
        case "vm2":
            host = "dns2.nosadnile.net";
            res.cookie("host", "vm2", { path: "/" });
            break;
        default:
            res.status(400);
            res.type("text/plain");
            res.send("Invalid host! Valid hosts: [ vm1, vm2 ]");
            return;
    }
    const url = `http://${host}:${port}`;
    const proxy = httpProxy(url, { proxyErrorHandler: (err, res) => {
        res.status(500).type("text/plain").send("500 | An internal error occured.");
    } });
    res.cookie("port", port, { path: "/" });
    return proxy(req, res, next);
});

app.get("/*", (req, res, next) => {
    if(!req.query || !req.query.host || !req.query.port) {
        if(req.cookies.host && req.cookies.port) {
            req.query.host = req.cookies.host;
            req.query.port = req.cookies.port;
        } else {
            return res.status(400).type("text/plain").send("Missing parameters: [ host, port ]");
        }
    }
    let host = req.query.host;
    const port = req.query.port;
    if(port == "80" || port == "443") return res.status(400).type("text/plain").send(`Cannot use port ${port}.`);
    switch(host) {
        case "vm1":
            host = "dns.nosadnile.net";
            res.cookie("host", "vm1", { path: "/" });
            break;
        case "vm2":
            host = "dns2.nosadnile.net";
            res.cookie("host", "vm2", { path: "/" });
            break;
        default:
            res.status(400);
            res.type("text/plain");
            res.send("Invalid host! Valid hosts: [ vm1, vm2 ]");
            return;
    }
    const url = `http://${host}:${port}`;
    const proxy = httpProxy(url, { proxyErrorHandler: (err, res) => {
        res.status(500).type("text/plain").send("500 | An internal error occured.");
    } });
    res.cookie("port", port, { path: "/" });
    return proxy(req, res, next);
});

app.post("/*", (req, res, next) => {
    if(!req.query || !req.query.host || !req.query.port) {
        if(req.cookies.host && req.cookies.port) {
            req.query.host = req.cookies.host;
            req.query.port = req.cookies.port;
        } else {
            return res.status(400).type("text/plain").send("Missing parameters: [ host, port ]");
        }
    }
    let host = req.query.host;
    const port = req.query.port;
    if(port == "80" || port == "443") return res.status(400).type("text/plain").send(`Cannot use port ${port}.`);
    switch(host) {
        case "vm1":
            host = "dns.nosadnile.net";
            res.cookie("host", "vm1", { path: "/" });
            break;
        case "vm2":
            host = "dns2.nosadnile.net";
            res.cookie("host", "vm2", { path: "/" });
            break;
        default:
            res.status(400);
            res.type("text/plain");
            res.send("Invalid host! Valid hosts: [ vm1, vm2 ]");
            return;
    }
    const url = `http://${host}:${port}`;
    const proxy = httpProxy(url, { proxyErrorHandler: (err, res) => {
        res.status(500).type("text/plain").send("500 | An internal error occured.");
    } });
    res.cookie("port", port, { path: "/" });
    return proxy(req, res, next);
});

app.listen(port, () => { console.log(`Server listening on port ${port}!`); });