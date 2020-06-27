var targetElement;
var sheet;
var tables, navs;
var xml, xslHeader, xslMenu, xslTable, xslTooltip;
var isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);
let searchbar, searchbutton, spinner;


function detectEdge() {
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

function transformTable(sheet, inputField, overwrite = true) { //Deze functie is misschien overbodig? gewoon direct transformRE aanschrijven?
    return new Promise(function (resolve) {
        var any = false;
        transform(xml, xslTable, { sheet: sheet, input: inputField, edge: isEdge }, targetElement, overwrite).then(function (response) {
            any = makeDataTable(sheet);
            resolve([any, sheet]);
        })
    }, function (error) {
        reject(Error(error));
    });
}

function transformSearch(inputfield) {
    targetElement.textContent = '';
    targetElement.appendChild(spinner.cloneNode(true));
    for (var i = 0; i < navs.length; i++) {
        //transform(xml, xslTable, { sheet: navs[i].id, input: inputField }, targetElement).then(function (response) { OPPASSEN, zou nice zijn om direct te gebruiken, maar de for loop loopt door terwijl de promise bezig is
        transformTable(navs[i].id, inputfield, false).then(function (response) {
            //console.log(response);
            if (!response[0]) document.querySelector("div#" + response[1] + "_wrapper").style.display = "none";
            else document.querySelector("div#" + response[1] + "_wrapper").style.display = "block";
        })
    }
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

        }, function (error) {
            console.error('xsl/sheet-header.xsl', error);
        })

        var promiseTable = loadDoc('xsl/sheet-table.xsl');
        //var promiseHeader = loadDoc('xsl/sheet-header.xsl');
        var promiseMenu = loadDoc('xsl/sheet-menu.xsl', false);

        Promise.all([promiseMenu, promiseTable]).then(function (xslDocs) {

            //xslHeader = xslDocs[0];
            xslMenu = xslDocs[0];
            xslTable = xslDocs[1];


            transform(xml, xslMenu, {}, document.querySelector("nav div#menu")).then(function (response) {

                //ADD EVENT LISTENERS to menu buttons
                navs = document.getElementsByClassName("nav");
                for (var i = 0; i < navs.length; i++) {
                    navs[i].addEventListener('click', function () {
                        targetElement.textContent = '';
                        targetElement.appendChild(spinner.cloneNode(true));
                        sheet = this.id.substring(3);
                        console.log(sheet);
                        transformTable(sheet, '');
                    }, false);
                }
                //alternatieve (betere?) methode
                /* document.addEventListener('click', function(event) {
                    if (event.target.matches('a.nav')) {
                        console.log("`event.target` is", event.target);
                        targetElement.textContent = '';
                        transformTable(event.target.getAttribute("summary"), '');
                    }
                }, false); */

                searchbar = document.getElementById("xslsearch");
                searchbutton = document.getElementById("search");
                //event listener click op inputfield
                searchbutton.addEventListener('click', function () {
                    transformSearch(searchbutton.value);
                }, false);
                //event listener 

                searchbar.addEventListener('keypress', function (e) {
                    if (e.charCode === 13) transformSearch(searchbar.value);
                });
            }, function (error) {
                console.error("sheet-menu.xsl", error);
            })

            //GET REFRESH URL
            var url = window.location.href;
            if (url.indexOf("#") != -1) {
                targetElement.appendChild(spinner);
                // sheet = this.id;
                // transformTable(this.id, '');
                sheet = url.substring(url.indexOf("#") + 1);
                transformTable(sheet, '');
            }
        })
    }, function (error) {
        console.error(datafile, error);
    })
})