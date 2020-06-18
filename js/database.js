var targetElement;// = document.querySelector("section div#results");
var xml, xslHeader, xslTable;
var isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);
let spinner;

function detectEdge() {
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

document.addEventListener('DOMContentLoaded', function () {
    spinner = document.createElement('div');
    spinner.classList.add("spinner");    
    console.log("Edge? ", isEdge);

    targetElement = document.querySelector("section div#results");

    //LOAD XML, this is the first action where every other action should wait for
    loadDoc(datafile, xml).then(function (xmlDoc) {
        xml = xmlDoc;

        //XSL HEADER
        loadDoc('xsl/sheet-header.xsl').then(function (xsl) {
            xslHeader = xsl;
            if (typeof editLink == 'undefined') editLink = "";
            if (typeof headerTitle == 'undefined') headerTitle = "";
            transform(xml, xslHeader, { title: headerTitle, edit: editLink }, document.querySelector("header div#heading"));
            lastUpdated(datafile, "activity");
            targetElement.appendChild(spinner);
        }, function (error) {
            console.error('xsl/sheet-header.xsl', error);
        })

        //XSL DATABASE
        loadDoc('xsl/database.xsl', false).then(function (xsl) {
            xslTable = xsl;

            //EXTRA for database version:
            transform(xml, xslTable, { edge: isEdge, types: linkedSheetType.join() }, targetElement).then(function () {
                any = makeDataTable(document.querySelector("table.mainsheet").getAttribute("id"));
            })
        })
    }, function (error) {
        console.error('xsl/database.xsl', error);
    })
})