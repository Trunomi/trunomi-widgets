import * as React from 'react';
import WidgetsPanel from './panel/screen';

export default class Widgets extends React.Component {

    render() {
        return <WidgetsPanel title="Trunomi Widgets" prefCentre={false} />
    }
}