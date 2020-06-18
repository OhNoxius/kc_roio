var targetElement;
var sheet;
var tables, navs;
var xml, xslHeader, xslMenu, xslTable;
var isEdge = (window.navigator.userAgent.indexOf("Edge") > -1);
let searchbar, searchbutton;

function detectEdge(){
    return (window.navigator.userAgent.indexOf("Edge") > -1)
}

function transformTable(sheet, inputField) { //Deze functie is misschien overbodig? gewoon direct transformRE aanschrijven?
    return new Promise(function (resolve) {
        var any = false;
        transformRE(xml, xslTable, { sheet: sheet, input: inputField, edge: isEdge }, targetElement).then(function (response) {
            any = makeDataTable(sheet);
            resolve([any, sheet]);
        })
    }, function (error) {
        reject(Error(error));
    });
}

function transformSearch(inputfield) {
    targetElement.textContent = '';
    for (var i = 0; i < navs.length; i++) {
        //transformRE(xml, xslTable, { sheet: navs[i].id, input: inputField }, targetElement).then(function (response) { OPPASSEN, zou nice zijn om direct te gebruiken, maar de for loop loopt door terwijl de promise bezig is
        transformTable(navs[i].id, inputfield).then(function (response) {
            //console.log(response);
            if (!response[0]) document.querySelector("div#" + response[1] + "_wrapper").style.display = "none";
            else document.querySelector("div#" + response[1] + "_wrapper").style.display = "block";
        })
    }
}

document.addEventListener('DOMContentLoaded', function () {    
    console.log(isEdge);

    //LOAD XML, this is the first action where every other action should wait for
    loadDocRE(datafile, xml).then(function (xmlDoc) {
        
        var promiseTable = loadDocRE('xsl/sheet-table.xsl');
        var promiseHeader = loadDocRE('xsl/sheet-header.xsl');
        var promiseMenu = loadDocRE('xsl/sheet-menu.xsl');

        Promise.all([promiseHeader, promiseMenu, promiseTable]).then(function (xslDocs) {

            xslHeader = xslDocs[0];
            xslMenu = xslDocs[1];
            xslTable = xslDocs[2];
            xml = xmlDoc;

            targetElement = document.querySelector("section div#results");

            transformRE(xml, xslMenu, {}, document.querySelector("nav div#menu")).then(function (response) {

                //ADD EVENT LISTENERS to menu buttons
                navs = document.getElementsByClassName("nav");
                for (var i = 0; i < navs.length; i++) {
                    navs[i].addEventListener('click', function () {
                        targetElement.textContent = '';
                        sheet = this.id;
                        transformTable(this.id, '');
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

            //XSL TABLE
            //xslTable(sheet, '');

            //XSL HEADER
            transformRE(xml, xslHeader, { title: headerTitle, edit: editLink}, document.querySelector("header div#heading"));
            lastUpdated(datafile, "activity");

            //GET REFRESH URL
            var url = window.location.href;
            if (url.indexOf("#") != -1) {
                sheet = url.substring(url.indexOf("#~") + 2);
                transformTable(sheet, '');
            }
        })
    }, function (error) {
        console.error("data XML could not be loaded:", error);
    })
})