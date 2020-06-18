var targetElement;// = document.querySelector("section div#results");
var xml, xslHeader, xslTable;
var isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);

function detectEdge() {
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

document.addEventListener('DOMContentLoaded', function () {

    targetElement = document.querySelector("section div#results");
    console.log("Edge? ", isEdge);

    //LOAD XML, this is the first action where every other action should wait for
    loadDoc(datafile, xml).then(function (xmlDoc) {
        xml = xmlDoc;

        //XSL HEADER
        loadDoc('xsl/sheet-header.xsl').then(function (xsl) {
            xslHeader = xsl;
            if (typeof editLink == 'undefined') editLink = "";
            if (typeof headerTitle == 'undefined') headerTitle = "";
            transformRE(xml, xslHeader, { title: headerTitle, edit: editLink }, document.querySelector("header div#heading"));
            lastUpdated(datafile, "activity");
            let spinner = document.createElement('div');
            spinner.classList.add("spinner");
            targetElement.appendChild(spinner);
        }, function (error) {
            console.error('xsl/sheet-header.xsl', error);
        })

        //XSL TABLE
        loadDoc('xsl/database.xsl', false).then(function (xsl) {
            xslTable = xsl;

            //EXTRA for database version:
            transformRE(xml, xslTable, { edge: isEdge, types: linkedSheetType.join() }, targetElement).then(function () {
                any = makeDataTable(document.querySelector("table.mainsheet").getAttribute("id"));
            })
        })
    }, function (error) {
        console.error('xsl/database.xsl', error);
    })
})