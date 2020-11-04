var targetElement;// = document.querySelector("section div#results");
var xml, xslHeader, xslTable, xslTooltip;
let promiseXslHeader, promiseXslTooltip;
const isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);
let spinner, progressBar;
var allElements = new Map();
var allSheets = new Map();
const xmltag = /[^A-Za-z0-9-]/gi;

function detectEdge() {
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

document.addEventListener('DOMContentLoaded', function () {
    if (typeof caching === 'undefined') caching = "true";
    spinner = document.createElement('div');
    spinner.classList.add("spinner");
    progressBar = document.createElement("progress");
    progressBar.id = "progressBar";
    console.log("Edge? ", isEdge);

    targetElement = document.querySelector("section div#results");

    //LOAD XML, this is the first action where every other action should wait for
    loadDoc(datafile, caching, document.getElementById("statusBar")).then(function (xmlDoc) {
        xml = xmlDoc;
        // targetElement.appendChild(progressBar);
        targetElement.appendChild(spinner);
        databaseKeys(xml);

        xml.querySelectorAll('*').forEach(function(node) {
            // Do whatever you want with the node object.
            if (node.hasAttribute) if (node.attributes[0] != null) allElements.set(node.attributes[0].value, node);
        });
        xml.firstElementChild.childNodes.forEach(function(sheet) {
            sheetElements = new Map();
            sheet.childNodes.forEach(function(node) {
                if (node.hasAttribute) if (node.attributes[0] != null) sheetElements.set(node.attributes[0].value, node);
            });
            allSheets.set(sheet.tagName, sheetElements);
        });

        //XSL
        promiseXslHeader = loadDoc('xsl/sheet-header.xsl');
        function reflect(promiseXslHeader) {
            return promiseXslHeader.then(function (xsl) {
                xslHeader = xsl;
                if (typeof editLink == 'undefined') editLink = "";
                if (typeof headerTitle == 'undefined') headerTitle = "";
                transform(xml, xslHeader, { title: headerTitle, edit: editLink }, document.querySelector("header div#heading"));
                lastUpdated(datafile, "activity");
            }, function (error) {
                console.error('xsl/sheet-header.xsl', error);
            })
        }

        //XSL DATABASE
        reflect(promiseXslHeader).then(function (v) {
            loadDoc('xsl/database.xsl', false).then(function (xsl) {
                xslTable = xsl;

                targetElement.appendChild(spinner);
                // transformToXml(xml, xslTable).then(function (optimized) {
                //     console.log(optimized);
                // });

                //EXTRA for database version:
                transform(xml, xslTable, { edge: isEdge, types: Array.from(linkedsheetTypes).join() }, targetElement).then(function () {
                    //document.getElementById("status").appendChild(spinner);
                    makeDataTable(document.querySelector("table.mainsheet").getAttribute("id"), 'database');
                    // loadDoc('xsl/sheet-tooltip.xsl', caching).then(function (xsl) {
                    //     xslTooltip = xsl;
                    // })
                })
            })
        }, function (error) {
            console.error('xsl/database.xsl', error);
        })
    });
})