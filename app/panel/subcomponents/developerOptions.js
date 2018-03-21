import React from 'react';
import ReactJson from 'react-json-view';

export default class DeveloperOptions extends React.Component {

    renderDeveloperOptions = () => {
        let {config, dev, params, updateJSON, stateChange} = this.props;

        if (dev) {
            return <div className="main-section">
                <h3 style={{marginTop: '6px'}}>Main Configuration Object</h3>
                <ReactJson src={config} name={'truConfig'} collapsed={true}
                           onEdit={(edit) => {
                               updateJSON(edit, true)
                           }}
                           onAdd={(edit) => {
                               updateJSON(edit, true)
                           }}
                           onDelete={(edit) => {stateChange([{config: edit.updated_src}, {randKey: Math.random()}])}}
                           style={{wordBreak: 'break-all'}}
                           validationMessage={'Invalid type'}/>
                <h3>Other Props</h3>
                <ReactJson src={params} name={false} enableClipboard={false}
                           onEdit={updateJSON}
                           onAdd={updateJSON}
                           onDelete={(edit) => {stateChange([{params: edit.updated_src}, {randKey: Math.random()}])}}
                           validationMessage={'Invalid type'}/>
            </div>
        }
        else {
            return <div></div>
        }
    }

    render() {
        return this.renderDeveloperOptions()
    }
}