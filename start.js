const express = require('express')
const app = express()
const crypto = require('crypto')
const urlencodedParser = express.urlencoded({extended: false});
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const code = "secret"
const user = {
    login: "yulia",
    password: "4c0860f68178047c8bc26678dc37953bd57220f4",
    info: { id: 1, role: "MAIN_ADMIN" }
}

const authorization = (req, res, next) => {
    if (!req.cookies.access_token) {
        return res.status(401)
            .sendFile(__dirname + '/views/401.html')
    }

    try {
        const data = jwt.verify(req.cookies.access_token, code)
        req.userId = data.id
        req.userRole = data.role
        return next()
    } catch {
        return res.sendStatus(401)
    }
};

app.use(cookieParser());
app.listen(1313)

app.get('/v1/authorization', function (req, res) {
    res.sendFile(__dirname + '/views/auth.html')
});

app.post("/v1/authorization", urlencodedParser, function (req, res) {
        let hex = crypto.createHash('sha1').update(req.body.password).digest('hex')

        if (!(req.body.login === user.login && hex === user.password)) {
            return res.status(401).sendFile(__dirname + '/views/401.html')
        }

        return res
            .cookie("access_token", jwt.sign(user.info, code), {
                httpOnly: true
            })
            .status(200)
            .redirect("/v1/cars")
    });

app.get("/v1/cars", authorization, (req, res) => {
    return res.json([
        {
            "id": 1,
            "model": "m3",
            "price": 10000000,
            "power": 500,
            "description": null,
            "brandName": "BMW"
        },
        {
            "id": 2,
            "model": "m2 competition",
            "price": 100000000,
            "power": 1000,
            "description": null,
            "brandName": "BMW"
        }
    ])
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/views/auth.html')
});