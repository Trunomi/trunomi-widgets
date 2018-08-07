import * as React from 'react';
import jsPDF from 'jspdf';
import * as BS from 'react-bootstrap';
import * as _ from 'lodash';
import moment from 'moment';
import trunomi_logo_data from './TrunomiLogo';

export default class DownloadPDF extends React.Component {

    title = (doc, x) => {

        let {general, events} = this.props;
        x += 20;
        doc.addImage(trunomi_logo_data, 'JPEG', 20, x, 30.125, 11.25);
        x += 7.5; // 27.5
        doc.text(55, x, "TruCert for " + _.startCase(general[0][1]));
        doc.setFontSize(16);
        doc.setFontType("italic");

        x += 12.5; // 40
        doc.text(20, x, events[0].event + " Created At " + events[0].timestamp);

        return {
            doc: doc,
            x: x
        }
    }

    general = (doc, x) => {

        x += 10; // 50
        doc.setFillColor(225,225,225);
        doc.rect(15, x, 175, 10, 'F');
        doc.setFontSize(14);
        doc.setFontType("bold");

        x += 8; // 58
        doc.text(20, x, 'General');

        doc.setFontSize(12);
        doc.setFillColor(92, 191, 222);
        x += 2; // 60
        doc.setFontType("normal");
        _.map(this.props.general, (gen) => {
            x += 10;
            doc.text(20, x, gen[0]);
            doc.text(90, x, gen[1]);

        });

        return {
            doc: doc,
            x: x
        }
    }

    arrayToString(input) {
        let output = '';
        _.map(input, (inp) => {
            output += inp + ', '
        });

        output = output.substring(0, output.length - 2);
        return output
    }

    history = (doc, x) => {
        x += 20; // 110
        doc.setFillColor(225,225,225);
        doc.rect(15, x, 175, 10, 'F');
        doc.setFontSize(14);
        doc.setFontType("bold");

        x += 8; // 118
        doc.text(20, x, "History");

        let payload = {}
        let preferences, products, res = [];
        let moc, message, justification = ''
        _.map(this.props.events, (event) => { // each event
            payload = JSON.parse(event.payload);
            message = payload["message"];
            moc = payload["moc"];
            products = payload["gf_products"];
            justification = payload["justification"];
            preferences = payload["gf_preferences"];

            if (message && message !== '')
                res.push(["Message", message]);
            if (moc && moc !== '')
                res.push(["Method of Collection", moc]);
            if (justification && justification !== '')
                res.push(["Justification", justification]);
            if (products && _.size(products))
                res.push(["Products", this.arrayToString(products)])
            if (preferences && _.size(preferences))
                res.push(["Preferences", this.arrayToString(preferences)])

            if (_.size(res)) {
                x += 7;
                doc.setFontSize(12);
                doc.setFillColor(217, 237, 247); // info colour header
                doc.rect(15, x, 175, 10, 'F');
                doc.setFontType("normal");
                x += 8;
                doc.text(20, x, event.event);
                doc.text(90, x, moment.unix(_.toInteger(event.capturedAt) / 1000).format("MMMM Do YYYY, h:mm a"))

                _.map(res, (fields) => { // each event field
                    if (fields) {
                        x += 12;
                        doc.setTextColor(0);
                        doc.text(20, x, fields[0]);
                        doc.text(90, x, fields[1]);
                    }
                })
            }
        });

        return {
            doc: doc,
            x: x
        }
    }

    downloadTrucert = () => {
        let x = 0;
        let doc = new jsPDF();
        doc.setFont("helvetica");
        doc.setFontSize(20);
        let title = this.title(doc, x);
        let general = this.general(title.doc, title.x);
        let history = this.history(general.doc, general.x);
        doc = history.doc;
        doc = history.doc;
        doc.save('trucert.pdf');
    }

    render() {
        return <div>
            <BS.Button onClick={this.downloadTrucert} className='quod-button' bsStyle="primary" disabled>
                <BS.Glyphicon glyph="download-alt"/>&nbsp;Download
            </BS.Button>
        </div>
    }
}
