const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require("fs");
const uuid = require('uuid');
const jwt = require('jsonwebtoken');


const privateKey = fs.readFileSync(path.join(__dirname + '/mock-key.pem'), 'utf8');

const config = {
    enterpriseId: '',
    contextId: '',
    dataTypeId: '',
    consentId: 0,
    email: '',
    password: '',
    serverPort: 5555,
    trunomiHost: '',
    widgetHost: ''
};



const app = express();

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Endpoint to send email
app.post('/mail', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    let {email, firstName, lastName} = req.body;

    try {
        let token = await generateJWT(config.enterpriseId, email)

        await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.password
            }
        }).sendMail({
            from: config.email,
            to: email,
            subject: 'Consent request for .........',
            html: `<h1>Hello ${firstName} ${lastName}, will you grant consent for ............?</h1></br>
            <p>Yes?</p>
            <p>Click <a href="http://localhost:5555/grant?token=${token}">HERE</a></p>
                
            <p>To view your preferences click <a href="${config.widgetHost}/user_preferences?jwtToken=${token}&host_addr=${config.trunomiHost}&locale=es-ES">HERE</a></p>
            <small>This links will expire in 30 mins</small>
            `
        });

        res.sendFile(path.join(__dirname + '/thankYou.html'))
    }
    catch(e){
        if (e.response) console.log(`Error ${e.response.code}: ${e.response.message}`)
        res.sendFile(path.join(__dirname + '/error.html'))
    }
});

// Endpoint for the initial consent grant
app.get('/grant', async(req, res) => {

    try {
        await axios.post(`${config.trunomiHost}/ledger/context/${config.contextId}/consent-grant`, {
            payload: {
                "dataTypeId": config.dataTypeId,
                "consentDefinitionId": config.consentId
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Trunomi-Version": "2018",
                "Authorization": req.query.token
            }
        });

        res.sendFile(path.join(__dirname + '/thankYou2.html'));
    }
    catch(e){
        if (e.response && e.response.data && e.response.data.code === 409){
            console.log(`Error ${e.response.data.code}: ${e.response.data.message}`)
            res.sendFile(path.join(__dirname + '/alreadyGranted.html'));
        }
        res.sendFile(path.join(__dirname + '/error.html'));
    }
});


// Starting up the server
app.listen(config.serverPort, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${config.serverPort}`)
});


// Function to generate and authorize a token
async function generateJWT(enterpriseId, customerId) {
    let claims = {
        iss: enterpriseId,
        aud: ["Trunomi", enterpriseId, customerId],
        jti: uuid.v1(),
        pol: 'enterprise on behalf of customer',
        sub: `${enterpriseId}::${customerId}`,
        iat: Date.now()/1000
    };

    let token = jwt.sign(claims, privateKey, {algorithm: 'RS512'});

    // Authorizing the token with trunomi
    let resp = await axios.post(`${config.trunomiHost}/auth`, null, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    return resp.headers['www-authenticate']
}