var targetElement;// = document.querySelector("section div#results");
var xml, xslHeader, xslTable, xslTooltip;
let promiseXslHeader, promiseXslTooltip;
const isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);
let spinner;

function detectEdge() {
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

document.addEventListener('DOMContentLoaded', function () {
    if (typeof caching === 'undefined') caching = "true";
    spinner = document.createElement('div');
    spinner.classList.add("spinner");
    console.log("Edge? ", isEdge);

    targetElement = document.querySelector("section div#results");

    //LOAD XML, this is the first action where every other action should wait for
    loadDoc(datafile, caching).then(function (xmlDoc) {
        xml = xmlDoc;
        targetElement.appendChild(spinner);

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
            loadDoc('xsl/database.xsl').then(function (xsl) {
                xslTable = xsl;

                //EXTRA for database version:
                transform(xml, xslTable, { edge: isEdge, types: linkedSheetType.join() }, targetElement).then(function () {
                    any = makeDataTable(document.querySelector("table.mainsheet").getAttribute("id"), 'database');
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