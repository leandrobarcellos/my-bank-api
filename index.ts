import express, {json} from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import {AccountResource} from "./features/account/AccountResource";

const app = express();
const port = 3000;
const BEARER_PREFIX = "BEARER";
const secretKey = "klsghefslgihgkdlsgh";
const accountRoutes = new AccountResource();

app.use(json());

/**
 * Olhar a doc do cors para mais detalhes sobre sua utilização:
 *
 * https://expressjs.com/en/resources/middleware/cors.html
 */
app.use(cors());

app.use("/doc", swaggerUi.serve, swaggerUi.setup());
app.use("/", accountRoutes.router);

const extrairTokenString = function (token: string) {
    if (token.toUpperCase().includes(BEARER_PREFIX)) {
        return token.substr(BEARER_PREFIX.length).trim();
    }
    return token;
};

const validaToken = (req: express.Request, res: express.Response, next: any) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).end();
    }
    let base64 = extrairTokenString(token);
    jwt.verify(base64, secretKey, (err: any, decoded: any) => {
        if (err) {
            console.log(err);
            return res.status(500).end();
        }
        req.body.userId = decoded.id;
        next();
    });
};

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World!')
})

app.get('/simples', (req: express.Request, res: express.Response) => {
    res.end();
})

app.post('/login', (req: express.Request, res: express.Response, next: any) => {
    if (req.body.user === "joao" && req.body.pwd === "1234") {
        const id = 1;
        const token = jwt.sign({id}, secretKey, {
            expiresIn: 300
        });
        res.json({token});
    }
})

app.get('/cliente', validaToken, (req: express.Request, res: express.Response) => {
    console.log(req);
    res.send(`Hello user ${req.body.userId}`);
})


app.get('/tsc', (req, res) => {
    res.json({msg: 'Hello TypeScript!'})
})

app.listen(port, () => {
    console.log(`my-bank-api app listening at http://localhost:${port}`)
})