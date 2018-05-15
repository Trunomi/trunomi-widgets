This is a demo for a mail event flow using the Trunomi platform and the TRUNOMI widgets hosted in AWS.
This example uses the express authentication through a JWT token. 


## Requisites

- Node 8.x or greater
- npm or yarn (latest versions if possible)

## Instructions

- Run `yarn` or `npm install`
- Fill the configuration object in the server file with the proper parameters
- Add the private key used in the enterprise onboarding in `src/mock-key.pem`
- Run the server with `node src/server.js`
- In the browser open http://localhost:5555 and follow the event flow