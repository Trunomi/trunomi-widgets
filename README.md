# Trunomi Widgets [Preference centre demo](https://trunomi.github.io/trunomi-widgets/prefcentre) [Widgets demo](https://trunomi.github.io/trunomi-widgets/widgets)
Set of React components that makes the implementation of the Trunomi platform on a react application easier. Contains a number of fully customizable widgets.
# NEW UI IN - Custom styles broken, you will need to branch and customize css, I want to go another direction here with White Label abilities.
## Getting Started
### Prerequisites
npm or yarn and React/React-dom to be used. Fully compatible with react 16 and 0.15, more testing pending

### Set Up
This module can be installed using **npm** or **yarn**. It is currently not hosted in npm yet but can be installed manually. 
* Clone this project: `git clone https://github.com/Trunomi/trunomi-widgets.git`
* Install the module: `npm install --save ../trunomi-widgets` (being **../trunomi-widgets** the locatione of the cloned repository)

### Deployment
To deploy this kibrary to npm follow this steps:
* Update the package version inside the `package.json` file
* Properly configure the npm authentication
* Run ```yarn publish```: this will bundle the library and push it to npm

### Usage
Import the wanted widgets from the **trunomi-widgets**: 
```js
import {ConsentsWidget, ActiveDSRWidget, DSRWidget, CaptureConsent, CaptureDSR, Trucert, UserPreferences} from 'trunomi-widgets';
```
Use the component specifyin the appropiate props. For example, the user preferences widget:
```js
<UserPreferences truConfig={...} title='Preferences' dataPane={false}/>
```

## Configuration object (required)
Prop required by all the widgets (unless a Session has started) that contains the configuration required to interact with the TRUNOMI platform. There are 2 ways of doing this: using static authentication with an API token or using express authenticaion with a JWT token.
The config objects has to follow one of the 2 structures:

* **Static Authentication**

```js
truConfig = {
    apiToken: '...',
    enterpriseId: '...',
    customerId: '...',
    host_addr: '...',
    locale: '...'
}
```

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| apiToken | String | **yes** | API token provided by Trunomi upon enterprise setup | 
| enterpriseId | String | **yes** | UUID v1 assigned to the enterpise upon setup by Trunomi |
| customerId | String | **yes** | Customer identifier |
| host_addr | String | **yes** | Trunomi API address |
| locale | String | **no** | Language for the widgets and the data in the Trunomi platform. It follows the 'languagy'_'country' notation. **en_US** by default |

* **Express Authentication**
```js
truConfig = {
    jwtToken: '...',
    host_addr: '...',
    locale: '...'
}
```

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| jwtToken | String | **yes** | JWT token signed by Trunomi, for more information check https://api.trunomi.com/docs/#!/default/auth. The user is responsible for refreshing it. |
| customerId | String | **yes*** | Customer identifier |
| host_addr | String | **yes** | Trunomi API address |
| locale | String | **no** | Language for the widgets and the data in the Trunomi platform. It follows the 'languagy'_'country' notation. **en_US** by default |

\* customerId is only required if it's not already specified in the jwt_token. If both are specified, only the one in the JWT token will be considered.

* **Using a Session**: with the functions startSession(truConfig) and stopSession() a Session can be managed between the widgets and the Trunomi platform. With this, the user is able to use the widgets without having to pass the truConfig every time and in the case of using a jwt token, to send a new boolean parameter 'refreshToken' to specify whether to refresh the token or not. The validation of the token with Trunomi can be handled by the module.   

For example:
```js
setTimeout(stopSession, 20000);

startSession({
    jwtToken: '...', //Unvalidated or validated token
    host_addr: 'http://trunomi.local',
    refreshJWT: true
}).then(()=>{
    ReactDOM.render(<App />, document.getElementById('root'));
});
```

# Widgets 
[Here](https://trunomi.github.io/trunomi-widgets/widgets)the widgets can be seen in action. Clicking on the developer view will display more information about the props as well as an interactive way of setting them in real time.
## Consents widget (`ConsentsWidget`)
Widget that lists all the consent definitions and the status of those for the the given configuration. It allows the end user to grant and deny/revoke consents and check the Trucert generated for each consent definition. 

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| contextIds | string array | **no** | `null` | Prop to specify to only show processing definitions from an specific list of purpose IDs | 
| disableRevoke | object | **no** | `{}` | Prop to specify the processing definitions where the user will only be ale to grant (not revoke). The object keys must be the context ids and the values, arrays of processing definition ids (integers) | 
| table | object | **no** | `...` | Customization object for the table |
| contextTags | string array | **no** | `null` | Tags to only show specific processing definitions or purposes |
| showAll | boolean | **no** | `true` | If it is false, only the processing definitions which the customer has already acted on will be displayed |

The table object allows for the following keys and have the following default values: 
```js
table = {
    striped: false,
    bordered: true,
    condensed: true,
    hover: true,
    responsive: false,
    headerClass: 'greyHeader'
}
``` 
The first 5 are parameters that can be passed to a bootstrap table. The last parameter defines a custom class for the header, which allos for further customization.
This prop and it's default values are the same for the DSRWidget and the ActiveDSRWidget.

## Data Subject Requests widget (`DSRWidget`)
Widget that lists all the personal informatio the customer has given consent to use and allows them to make access/erasure/obect/rectify if the data type definition in the trunomi platform allows for it. It props the end user to submit a reason for the request.

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| dataTypeIds | string array | **no** | `null` | Prop to specify to only show an specific list of data type ids | 
| showAll | boolean | **no** | `false` | Prop to specify to only whether to show all data types or only the ones that the customer has rights linked to it | 
| table | object | **no** | `...` | Customization object for the table |

## Active Data Subject Requests widget (`ActiveDSRWidget`)
Widget that lists all the data subject requests in process from the customer.

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| type | string | **no** | `''` | Prop to specify to show only one type of active DSRs. Must be one of **rectify**, **object**, **access**, **erasure** or **''**| 
| table | object | **no** | `...` | Customization object for the table |

## User Preferences widget (`UserPreferences`)
Component that displays the three previous widgets to form a user preference center where the end user can view it's rights and data subject requests and act on them.

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| title | string | **no** | `''` | If specified, it will displayed on top of the widget |
| consentPane | string | **no** | `true` | To specify whether to display the Consents pane (ConsentsWidget) |
| consentTitle | string | **no** | `'My Consents'` | Title for the consents pane |
| dataPane | string | **no** | `true` | To specify whether to display the Data pane (DSRWidget) |
| dataTitle | string | **no** | `'My Data'` | Title for the data pane |
| dsrPane | string | **no** | `true` | To specify whether to display the active DSR pane (ActiveDSRWidget) |
| dsrTitle | string | **no** | `'My Data Requests'` | Title for the active dsr pane |
| helpLink | string | **no** | `''` | If specified, a help icon with this link will be created on top of the widget |
| dataTypeIds | string array | **no** | `null` | Prop to specify to only show an specific list of data type ids | 
| contextIds | string array | **no** | `null` | Prop to specify to only show processing definitions from an specific list of context IDs | 
| disableRevoke | object | **no** | `{}` | Prop to specify the processing definitions where the user will only be ale to grant (not revoke). The object keys must be the context ids and the values, arrays of processing definition ids (integers) | 
| contextTags | string array | **no** | `null` | Tags to only show specific processing definitions or purposes |
| showAll | boolean | **no** | `false` | Prop to specify to only whether to show all data types or only the ones that the customer has rights linked to it | 
    
## Capture Consent widget (`CaptureConsent`)
Widget that prompts a customer to consent or deny consent for a given consent program. 

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| contextId | string | **yes** | | Context ID | 
| consentId | integer | **yes** | | Consent ID |  
| onError | function | **no** | do nothing | Function to be executed upon an error (on reaching Trunomi or conflict errors) |  
| onSuccess | function | **no** | do nothing | Function to be executed upon success in granting/denying/revoking consent |  
| onClose | function | **no** | do nothing | Function to be executed upon closing the widget |  
| show | boolean | **no** | `true` | Determines whether to display the widget |  

The combination of Context ID and Consent ID must exist in the Trunomi platform or the widget will display an error.

## Capture Data Subject Request widget (`CaptureDSR`)
Widget that prompts a customer to create a data subject request (access, rectification, ereasure, object). 

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| dataTypeId | string | **yes** |  | Data type ID | 
| type | string | **yes** |  | Type of the data subject request. Must be one of **rectify**, **object**, **access** or **erasure** | 
| onError | function | **no** | do nothing | Function to be executed upon an error (on reaching Trunomi or conflict errors) |  
| onSuccess | function | **no** | do nothing | Function to be executed upon success in sending the data subject request |  
| onClose | function | **no** | do nothing | Function to be executed upon closing the widget |  
| show | boolean | **no** | `true` | Determines whether to display the widget |

The data type with id=dataTypeId must exists in the Trunomi platform and must allow for the type of data subject request specified in type or else an error will be displayed in the widget.

## Trucert (`Trucert`)
Widget that displays the trucert information for a ledger id.

* Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| truConfig | object | **yes** | | Configuration object |
| ledgerId | string | **yes** |  | Ledger ID from which to display the Trucert |

The ledger must exist on the Trunomi platform. 
