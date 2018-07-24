import React from 'react'
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import PrefCentre from './prefCentre';
import Widgets from './widgets';


class Test extends React.Component {
    render() {
        console.log('Pathname: ', this.props.location.pathname)
        console.log(this.props)
        return (<div></div>)
    }
}

class AppRouter extends React.Component {

    render() {
        let {host, pathname} = window.location;

        let path = host.includes('github') ? '/trunomi-widgets' : '';
        path += pathname.includes('preview') ? '/preview' : '';

        return (
            <BrowserRouter>
                <Switch>
                    <Route path={path + "/widgets"} component={Widgets}/>
                    <Route path={path + "/prefcentre"} component={PrefCentre}/>
                    <Route component={Test} />
                </Switch>
            </BrowserRouter>
        )
    }
}

export default AppRouter;