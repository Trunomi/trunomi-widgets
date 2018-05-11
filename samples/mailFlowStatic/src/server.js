const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');

const config = {
    enterpriseId: '',
    apiToken: '',
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
        await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.password
            }
        })
        .sendMail({
            from: config.email,
            to: email,
            subject: 'Consent request for ' + config.contextId,
            html: `<h1>Hello ${firstName} ${lastName}, will you grant consent for ............?</h1></br>
            <p>Yes?</p>
            <p>Click <a href="http://localhost:5555/grant/${email}">HERE</a></p>
                
            <p>To view your preferences click <a href="${config.widgetHost}/user_preferences?apiToken=${config.apiToken}&enterpriseId=${config.enterpriseId}&customerId=${email}&host_addr=${config.trunomiHost}&locale=es-ES">HERE</a></p>
            `
        });

        res.sendFile(path.join(__dirname + '/thankYou.html'));
    }
    catch(e){
        console.log(e);
        res.sendFile(path.join(__dirname + '/error.html'));
    }
});

// Endpoint for the initial consent grant
app.get('/grant/:customerId', async (req, res) => {
    let queryString = `?enterpriseId=${config.enterpriseId}&customerId=${req.params.customerId}`;

    try {
        await axios.post(`${config.trunomiHost}/ledger/context/${config.contextId}/consent-grant${queryString}`, {
            payload: {
                "dataTypeId": config.dataTypeId,
                "consentDefinitionId": config.consentId
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Trunomi-Version": "2017-02-28",
                "X-Trunomi-Enterprise-Api-Token": config.apiToken,
                "X-Trunomi-Api-Policy": "enterprise on behalf of customer"
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