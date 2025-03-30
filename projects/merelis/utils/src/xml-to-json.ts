/**
 * Convert DOM xml to JSON.
 * https://davidwalsh.name/convert-xml-json
 *
 * @param xml
 */
export function xmlToJson(xml: any): any {
    // Create the return object
    let obj: any = {};

    // tslint:disable-next-line:triple-equals
    if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes?.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
        // tslint:disable-next-line:triple-equals
    } else if (xml.nodeType == 3 || xml.nodeType == 4) {
        // text || cdata
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}
