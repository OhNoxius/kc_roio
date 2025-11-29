// GENERAL VARIABLES
let jason = {};
let SHEETS = [];
let MAINSHEET, LINKSHEET;
let sheetHeaders = null;
let MAINSHEET_keys = [], LINKSHEET_keys = []
let LINKSHEET_types = new Set();

let linkMap = new Map();
let sheetLinkedMap = new Map();

// HTML elements
let HEADER, SECTION, FOOTER, SIDEPANEL, INFOPANEL;
let fixedtable, dfixedtable;
let fixedthead, fixedtbody, fixedtfoot;
let fixedfooter_row;

//OPTIONAL s2w variables in html file
let linktype;
let CE;
let delims, delimsNC, trimdelim;
const delimsDefault = new RegExp(/([;\r\n]+)/, "g");

//specific DT variables
let dt_fixedHeader, dt_layout, dt_order, dt_scrolly;

const tableheight = '50%';

//old school
let jidx = 0, lidx = 0;
let keyIdx = new Map();
let keyPrev = new Map();

document.addEventListener('DOMContentLoaded', function () {
    //json doesn't have node vs attribute distinction, so instead of XML Child Elements there is a prefix for items that should be shown as a (childrow) dropdown
    CE = (typeof s2w_CE === "undefined") ? "CE_" : s2w_CE;

    //HTML
    if (document.body.contains(document.getElementById("s2w_HEADER"))) HEADER = document.getElementById("s2w_HEADER");
    else {
        HEADER = document.body.appendChild(document.createElement("header"));
        HEADER.id = "s2w_HEADER";
    }
    if (document.body.contains(document.getElementById("s2w_TABLE"))) SECTION = document.getElementById("s2w_TABLE");
    else {
        SECTION = document.body.appendChild(document.createElement("section"));
        SECTION.id = "s2w_TABLE";
    }
    if (document.body.contains(document.getElementById("s2w_FOOTER"))) FOOTER = document.getElementById("s2w_FOOTER");
    else {
        FOOTER = document.body.appendChild(document.createElement("footer"));
        FOOTER.id = "s2w_FOOTER";
    }
    if (document.body.contains(document.getElementById("s2w_SIDEPANEL"))) {
        SIDEPANEL = document.getElementById("s2w_SIDEPANEL");
        INFOPANEL = document.createElement("div");
        INFOPANEL.classList.add("info-panel");
        SIDEPANEL.appendChild(INFOPANEL);
        SECTION.classList.add("scrolly");
    }
    HEADER.appendChild(document.createElement("div")).id = "s2w_heading";
    HEADER.appendChild(document.createElement("div")).id = "s2w_status";
    HEADER.appendChild(document.createElement("div")).id = "s2w_activity";
    HEADER.appendChild(document.createElement("progress")).id = "download-progress";
    SECTION.innerHTML = '<table id="fixedtable" class="hover row-border" width="100%" width="100%" style=""></table>';
    SECTION.innerHTML += '<div id="dt_loader" class="spinner"></div>';
    //I had style="display:none" in <table>, why??

    //DELIMS
    if (typeof s2w_delimiter === "undefined") {
        console.log("s2w_delimiter is undefined. Using default delimiter regex: " + delimsDefault.source);
        delims = delimsDefault;
    }
    else {
        try {
            delims = new RegExp(s2w_delimiter, "g");
        } catch (e) {
            console.log("s2w_delimiter='" + s2w_delimiter + "' is an INVALID REGEX");
            delims = delimsDefault;
        }
    }
    console.log("delimiter regex used: " + delims);
    delimsNC = new RegExp("(?:" + delims.source + ")", "g");

    //HEADING
    const heading = document.createElement("h1");
    const heading_a = document.createElement("a");
    try { heading_a.innerText = s2w_title; }
    catch (e) { heading_a.innerText = s2w_datafile; } //DOES NOT WORK
    try { linktype = s2w_typeheader; }
    catch (e) { linktype = ""; } //DOES NOT WORK
    heading_a.setAttribute("href", "");
    heading_a.setAttribute("class", "heading");
    heading.append(heading_a);
    document.getElementById("s2w_heading").append(heading);

    //FILE UPDATED
    lastUpdated(s2w_datafile, "s2w_activity");

    fixedtable = document.getElementById("fixedtable");
    const ext = s2w_datafile.substring(s2w_datafile.indexOf(".") + 1);

    // PROGRESSBAR???? 1. use await fetch instead of fetch.then 2. https://stackoverflow.com/questions/47285198/fetch-api-download-progress-indicator
    // or https://stackoverflow.com/questions/35711724/upload-progress-indicators-for-fetch

    async function main() {
        const response = await fetch(s2w_datafile);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        //  //PROGRESSBAR!!
        // const resbody = response.body;
        // const reader = response.body.getReader();
        // const downloadProgress = document.getElementById("download-progress");
        // let success = true;
        // const totalDownloadBytes = response.headers.get("content-length");
        // let bytesDownloaded = 0;
        // while (true) {
        //     try {
        //         const { value, done } = await reader.read();
        //         if (done) {
        //             break;
        //         }
        //         bytesDownloaded += value.length;
        //         if (totalDownloadBytes != undefined) {
        //             console.log("download progress:", bytesDownloaded / totalDownloadBytes);
        //             downloadProgress.value = bytesDownloaded / totalDownloadBytes;
        //         } else {
        //             console.log("download progress:", bytesDownloaded, ", unknown total");
        //         }
        //     } catch (error) {
        //         console.error("error:", error);
        //         success = false;
        //         break;
        //     }
        // }
        // console.log("success:", success);

        let data;
        let dataLoaded;
        if (ext === "json") {
            jason = await response.json();
            // data = await toJSON(reader);
            // jason = data;
            if (Array.isArray(jason)) {
                // SHEETS = [];
                dfixedtable = makeDataTable(fixedtable, jason, MAINSHEET);
            }
            else {
                SHEETS = Object.keys(jason);
                MAINSHEET = SHEETS[0];
                LINKSHEET = SHEETS.find(e => e.startsWith("+"));

                MAINSHEET_keys = Object.keys(jason[MAINSHEET][0]);
                if (LINKSHEET) LINKSHEET_keys = Object.keys(jason[LINKSHEET][0]);
                else LINKSHEET_keys = [];
            }
            // console.log(jason);
            dataLoaded = Promise.resolve(jason);
            // return jason
        }
        else if (ext === "xlsx") {
            data = await response.arrayBuffer();
            dataLoaded = import("https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.mini.min.js").then(function () {
                const workbook = XLSX.read(data, { type: "array" });
                const workbookHeaders = XLSX.read(data, { type: "array", sheetRows: 1 });

                SHEETS = workbook.SheetNames;
                MAINSHEET = SHEETS[0];
                LINKSHEET = SHEETS.find(e => e.startsWith("+"));

                sheetHeaders = new Map();

                SHEETS.forEach(function (sheet) {
                    jason[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                    //1. GET EXCEL HEADER FIRST (to fix bug where empty headers are being shown with defval:"")
                    const xslxHeader = XLSX.utils.sheet_to_json(workbookHeaders.Sheets[sheet], { header: 1, defval: "" })[0];
                    // sheetHeaders.push(xslxHeader);
                    // console.log(xslxHeader);
                    sheetHeaders.set(sheet, xslxHeader);

                    if (!workbook.Sheets[sheet]["!cols"]) workbook.Sheets[sheet]["!cols"] = [];
                    for (var h = 0; h < xslxHeader.length; h++) {
                        if (xslxHeader[h] === "") {
                            /* create column metadata object if it does not exist */
                            if (!workbook.Sheets[sheet]["!cols"][h]) workbook.Sheets[sheet]["!cols"][h] = { hidden: true };
                        }
                    }
                    // console.log(XLSX.utils.encode_col(xslxHeader[0].length));
                    // //2. get the rest of the sheet
                    // jason[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { range: "A:" + XLSX.utils.encode_col(xslxHeader[0].length), skipHidden: true, defval: "" });
                });

                // console.log(sheetHeaders);

                MAINSHEET_keys = XLSX.utils.sheet_to_json(workbookHeaders.Sheets[MAINSHEET], { header: 1, defval: "" })[0];
                if (LINKSHEET) LINKSHEET_keys = XLSX.utils.sheet_to_json(workbookHeaders.Sheets[LINKSHEET], { header: 1, defval: "" })[0];
                else LINKSHEET_keys = [];

                // console.log({ MAINSHEET_keys, LINKSHEET_keys });
                return jason
            });

            // await workbook.xlsx.load(data);
            // import("https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js").then(function () {
            //     const workbook = new Excel.Workbook();
            //     await workbook.xlsx.load(jason);
            //     console.log(workbook.stringify);
            // });

        }

        dataLoaded.then((jason) => {
            // console.log(jason);
            //PROCESS JSON
            //1. identify important nodes

            //FINAL CALL:
            //detect '#...' in url to choose initial sheet
            let urlHash = "";
            if (window.location.href.indexOf("#") > 0) urlHash = window.location.href.substring(window.location.href.indexOf("#") + 1,);

            if (urlHash) dfixedtable = makeDataTable(fixedtable, jason[urlHash], urlHash);
            else dfixedtable = makeDataTable(fixedtable, jason[MAINSHEET], MAINSHEET);

            //CREATE NAVIGATION FOOTER
            const navfooter = createNavFooter(SHEETS);
            document.getElementById("s2w_FOOTER").append(navfooter);

        });
    }
    main().catch(console.error);

    // //USING .THen ....
    // fetch(s2w_datafile)
    //     .then(function (res) {
    //         switch (ext) {
    //             case "json": return res.json()
    //             case "xlsx": return res.arrayBuffer()
    //             default: console.log("s2w_datafile has unknown extension. Only .json and .xlsx supported");
    //         }
    //     })
    //     .then(data => {
    //         if (ext === "json") jason = data;
    //         else if (ext === "xlsx") {
    //             ///// CHECK THIS TO DYNAMICALLY LOAD excel library https://stackoverflow.com/questions/14521108/dynamically-load-js-inside-js#answer-14521217
    //             var script = document.createElement('script');
    //             script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.mini.min.js";
    //             script.onload = function () {
    //                 // const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    //                 const workbook = XLSX.read(data, { type: "array" });
    //                 //console.log("html ", wb);

    //                 workbook.SheetNames.forEach(function (name) {
    //                     jason[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
    //                 });
    //             };

    //             document.head.appendChild(script); //or something of the likes
    //             // $.getScript("https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.mini.min.js", function () {
    //             //     alert("Script loaded but not necessarily executed.");
    //             // });
    //         }

    //         let urlHash = "";
    //         if (window.location.href.indexOf("#") > 0) urlHash = window.location.href.substring(window.location.href.indexOf("#") + 1,);

    //         //PROCESS JSON
    //         //1. identify important nodes
    //         if (Array.isArray(jason)) {
    //             SHEETS = [];
    //             dfixedtable = makeDataTable(fixedtable, jason, MAINSHEET);
    //         }
    //         else {
    //             SHEETS = Object.keys(jason);

    //             MAINSHEET = SHEETS[0];
    //             LINKSHEET = SHEETS.find(e => e.startsWith("+"));
    //             MAINSHEET_keys = Object.keys(jason[MAINSHEET][0]);
    //             if (LINKSHEET) {
    //                 LINKSHEET_keys = Object.keys(jason[LINKSHEET][0]);
    //                 //find longest Object and create keys
    //                 // jlen = Object.keys(jason[LINKSHEET]).length, i = 0, imax = -Infinity;
    //                 // while (i < jlen) {
    //                 //     let ilen = Object.keys(jason[LINKSHEET][i]).length;
    //                 //     if (ilen > imax) {
    //                 //         imax = ilen;
    //                 //         lidx = i;
    //                 //     }
    //                 //     i++;
    //                 // }
    //                 // LINKSHEET_keys = Object.keys(jason[LINKSHEET][lidx]);
    //             }
    //             else LINKSHEET_keys = [];

    //             //CREATE NAVIGATION FOOTER
    //             // fixedfooter_row = document.createElement("tr");
    //             // fixedfooter_row.setAttribute('id', "fixedfooterrow");
    //             // const th = document.createElement("th");
    //             // th.setAttribute('id', "LOOKAHERE");
    //             // th.append(navfooter);
    //             // fixedfooter_row.append(th);
    //             // fixedtfoot.append(fixedfooter_row);

    //             //FINAL CALL:
    //             //detect '#...' in url to choose initial sheet

    //             if (urlHash) dfixedtable = makeDataTable(fixedtable, jason[urlHash], urlHash);
    //             else dfixedtable = makeDataTable(fixedtable, jason[MAINSHEET], MAINSHEET);

    //             const navfooter = createNavFooter(SHEETS);
    //             document.getElementById("s2w_FOOTER").append(navfooter);
    //         }
    //     })
});

function makeDataTable(table, jsondata, sheetName) {
    if (table.getAttribute("id") == "fixedtable") {
        fixedthead = fixedtable.appendChild(document.createElement("thead"));
        fixedtbody = fixedtable.appendChild(document.createElement("tbody"));
    }

    const maintableKeys = sheetHeaders ? sheetHeaders.get(sheetName) : Object.keys(jsondata[jidx]);
    //OPTIONAL: remove rows with empty 1st column
    jsondata = jsondata.filter(x => x[maintableKeys[0]] != null && x[maintableKeys[0]] != ""); //logical AND?? but this work, OR doesn't

    const maintable = sheetName;
    let linktable;

    let columns = [], mergecolumns = [];

    const childrowsHeaders = maintableKeys.filter(x => x.startsWith(CE));
    const htmlTagHeaders = maintableKeys.filter(x => x.startsWith("<"));

    //detect mode
    if (sheetName == LINKSHEET) linktable = MAINSHEET;
    else if (sheetName == MAINSHEET) linktable = LINKSHEET;
    else if (MAINSHEET_keys.includes(sheetName)) linktable = MAINSHEET;
    else if (LINKSHEET_keys.includes(sheetName)) linktable = LINKSHEET;

    let linktable_types = new Set();
    // try { jason[linktable].forEach(x => linktable_types.add(x[s2w_typeheader])); }
    // catch (e) { console.log("no s2w_typeheader"); }
    if (linktype) jason[linktable].forEach(x => (x[linktype] instanceof Array) ? linktable_types.add(x[linktype][0]) : linktable_types.add(x[linktype]));
    [null, undefined, ""].forEach(Set.prototype.delete, linktable_types);
    for (const type of linktable_types) {
        if (type.startsWith("?")) {
            linktable_types.delete(type);
            linktable_types.add(type.substring(1));
        }
    }
    linktable_types.delete("");

    //LOG    
    console.log("create new DataTable from table#id = '" + table.id + "'");
    //console.log(linktable_types);
    //console.log(table.getAttribute("id").substr(0, table.getAttribute("id").indexOf(":")));
    const parenttable = table.id.substr(0, table.getAttribute("id").indexOf(":"));

    //2. create Map() of mainsheet<->linksheet
    if (maintable && LINKSHEET) {
        const linkKeyIdx = maintableKeys.indexOf("LINKIDXS");
        if (linkKeyIdx > -1) maintableKeys.splice(linkKeyIdx, 1);
        else if (parenttable != linktable) {
            if (sheetLinkedMap.has(maintable)) {
                console.log("maintable:" + maintable + " already linked");
            }
            else {
                const linktableMap = new Map();
                let linktableErrors = [];
                //OPTION 1: what usecase is this?
                if (maintable == LINKSHEET) {
                    jason[MAINSHEET].forEach(function (MAINel, idx, arr) {
                        linktableMap.set(MAINel[MAINSHEET_keys[0]].toString().toLowerCase(), idx);
                    });
                    //console.log(linktableMap);
                    let MAINid_trim, MAINidx, obj;
                    jsondata.forEach(function (LINKel, LINKidx, LINKarr) {
                        if (LINKel[MAINSHEET]) {
                            LINKel[MAINSHEET].toString().split(delimsNC).forEach(function (MAINid) {
                                MAINid_trim = MAINid.trim().toLowerCase(); //POEH! Google Sheet can have hidden &#xD;
                                if (linktableMap.has(MAINid_trim)) {
                                    MAINidx = linktableMap.get(MAINid_trim);
                                    if (linktable_types.size > 0) {
                                        let MAINType = jason[MAINSHEET][MAINidx][linktype];//MAINel[s2w_typeheader];
                                        if (MAINType == null || MAINType == '') MAINType = linktable;
                                        if (LINKarr[LINKidx]["LINKIDXS"]) {
                                            if (LINKarr[LINKidx]["LINKIDXS"][MAINType]) LINKarr[LINKidx]["LINKIDXS"][MAINType].push(MAINidx);
                                            else {
                                                obj = LINKarr[LINKidx]["LINKIDXS"];
                                                obj[MAINType] = [MAINidx];
                                                LINKarr[LINKidx]["LINKIDXS"] = obj;
                                            }
                                        }
                                        else {
                                            obj = {};
                                            obj[MAINType] = [MAINidx];
                                            LINKarr[LINKidx]["LINKIDXS"] = obj; //{[MAINType] : [MAINidx]}
                                        }
                                    }
                                    else {
                                        if (LINKel["LINKIDXS"]) LINKarr[LINKidx]["LINKIDXS"].push(MAINidx);
                                        else LINKarr[LINKidx]["LINKIDXS"] = [MAINidx];
                                    }
                                }
                                else {
                                    //console.log("unknown " + MAINSHEET + " id " + MAINid_trim);
                                    linktableErrors.push(MAINid_trim);
                                }
                            });
                        }
                    });
                    console.log("linktableMap created between maintable:'" + maintable + "' and linktable:'" + linktable + "'");
                    sheetLinkedMap.set(maintable, 1);
                    if (linktableErrors.size > 0) {
                        console.log("unknown " + MAINSHEET + " id's:");
                        console.log(linktableErrors);
                    }
                }
                //OPTION 2
                else {
                    //console.log(jsondata);
                    //first create index from mainsheet
                    jsondata.forEach(function (MAINel, idx, arr) {
                        linktableMap.set(MAINel[maintableKeys[0]].toString().toLowerCase(), idx);
                    });
                    //then loop through linkedsheet ONCE, and add info into above Map
                    if (LINKSHEET) {
                        let linkElArr;
                        jason[linktable].forEach(function (linkEl, linkIdx, linkArr) {
                            if (linkEl[maintable]) {
                                //column exported as JSON array => CONCERTS ARE PROBABLY NOT IN SEPARATE CELLS, split again for every \n
                                if (Array.isArray(linkEl[maintable])) {
                                    linkElArr = [];
                                    for (var i = 0; i < linkEl[maintable].length; i++) {
                                        linkElArr = linkElArr.concat(linkEl[maintable][i].split(delimsNC));
                                    }
                                    // linkElArr = linkEl[maintable];
                                }
                                //column exported as normal string
                                else linkElArr = linkEl[maintable].split(delimsNC);

                                if (linkElArr) {
                                    let linkid_trim, mainIdx, obj;
                                    linkElArr.forEach(function (linkid) { //ERRORS when id column contains delimiter (; for example) => exports as Array instead of string
                                        linkid_trim = linkid.toString().trim().toLowerCase(); //POEH! Google Sheet can have hidden &#xD;
                                        if (linktableMap.has(linkid_trim)) {
                                            mainIdx = linktableMap.get(linkid_trim);
                                            if (linktable_types.size > 0) {
                                                let linkType = linkEl[linktype];
                                                if (linkType == null || linkType == '') linkType = linktable;
                                                if (jsondata[mainIdx]["LINKIDXS"]) {
                                                    if (jsondata[mainIdx]["LINKIDXS"][linkType]) jsondata[mainIdx]["LINKIDXS"][linkType].push(linkIdx);
                                                    else {
                                                        obj = jsondata[mainIdx]["LINKIDXS"];
                                                        obj[linkType] = [linkIdx];
                                                        jsondata[mainIdx]["LINKIDXS"] = obj;
                                                    }
                                                }
                                                else {
                                                    obj = {};
                                                    obj[linkType] = [linkIdx];
                                                    jsondata[mainIdx]["LINKIDXS"] = obj; //{[linkType] : [linkIdx]}
                                                }
                                            }
                                            else {
                                                if (jsondata[mainIdx]["LINKIDXS"]) jsondata[mainIdx]["LINKIDXS"].push(linkIdx);
                                                else jsondata[mainIdx]["LINKIDXS"] = [linkIdx];
                                            }
                                        }
                                        else {
                                            //console.log("unknown " + maintable + " id in " + linktable + ": " + linkid_trim);
                                            linktableErrors.push(linkid_trim);
                                        }
                                    });
                                }
                            }
                        });
                    }
                    console.log("linktableMap created between maintable:'" + maintable + "' and linktable:'" + linktable + "'");
                    sheetLinkedMap.set(maintable, 1);
                    if (linktableErrors.size > 0) {
                        console.log("unknown " + maintable + " id's in " + linktable + ":");
                        console.log(linktableErrors);
                    }
                }
            }
            //console.log(linktableMap);
        }
    }
    //console.log(jsondata);

    //prepare HTML
    const header_row = document.createElement("tr");
    table.getElementsByTagName("thead")[0].append(header_row);
    // const footer_row = document.createElement("tr");
    // table.getElementsByTagName("tfoot")[0].prepend(footer_row);
    if (maintable != LINKSHEET) table.classList.add('rowheaders');
    else table.classList.remove('rowheaders');

    //FORMAT JSON DATA for use in DataTables
    let startIndex = 0, visIndex = 0;

    //1stcolumn: ID's and general sort
    const IDcol = {
        "width": '0px',
        "className": 'IDcol',
        "orderable": true,
        "defaultContent": '',
        "data": maintableKeys[0],
        "render": function (data, type, rowData, meta) {
            if (type === 'display') return null
            else return data
        },
        "createdCell": function (cell, cellData, rowData, rowIndex, colIndex) {
            //balloon.css
            if (maintable != LINKSHEET) {
                //     cell.classList.add('tipdiv');
                //     cell.setAttribute('data-balloon-visible', true);
                //     cell.setAttribute('aria-label', cellData);
                //     cell.setAttribute('data-balloon-pos', 'up-left');

                //     //dropdown +/- 'button'
                //     //if (rowData["LINKIDXS"]) cell.classList.add('plus-ctrl');

                // cell.innerHTML = `<button class="btn" data-clipboard-text="` + cellData + `"></button>`;
                cell.innerHTML = `<button class="btn"></button>`;
                if (rowData["LINKIDXS"]) cell.classList.add('plus-ctrl');
            }
        },
        "cellIndex": startIndex
    }
    header_row.prepend(document.createElement("th"));
    columns.push(IDcol)
    visIndex += 1;
    startIndex += 1;

    //EXTRA: LINKcol
    let className = "LINKcol";
    if (linktable_types.size > 0) className += " types";
    // console.log(className);

    if (maintableKeys.indexOf(linktable) == -1) {
        if (linktable) {
            let DTcolumn = {
                "width": '0px', //makes width fit content!
                "title": linktable,
                "className": className,
                // "orderable": false,
                "defaultContent": '',
                "data": "LINKIDXS",
                "cellIndex": startIndex,
                // "createdCell": function (cell, cellData, rowData, rowIndex, colIndex) {
                //     //balloon.css
                //     // if (maintable != LINKSHEET) {
                //         //dropdown +/- 'button'
                //         if (rowData["LINKIDXS"]) cell.classList.add('plus-ctrl');
                //     // }
                // }
            };
            if (linktable_types.size > 0) {
                DTcolumn.render = function (data, type, rowData, meta) {
                    let innerhtml = "";
                    if (data) {
                        const props = Object.getOwnPropertyNames(data);
                        let propstrim;
                        for (var i = 0; i < props.length; i++) {
                            // IN ROW SHOW THE "?" before the media item?
                            // if (props[i].startsWith("?")) propstrim = props[i].substring(1);
                            // else propstrim = props[i];
                            propstrim = props[i];
                            innerhtml += '<div class="nowrap typeicon ' + props[i] + '" title="' + props[i] + '">' + propstrim + ':<span class="padleft typenum ">' + data[props[i]].length + '</span></div > ';
                        }
                    }
                    return innerhtml
                };
            }
            else {
                DTcolumn.render = function (data, type, rowData, meta) {
                    return data?.length
                }
            }
            header_row.prepend(document.createElement("th"));
            columns.push(DTcolumn);//columns.unshift(DTcolumn);
            startIndex += 1;
            visIndex += 1;
        }
    }

    //LOOP THROUGH KEYS
    let keyIdx;
    if (maintable && maintable == LINKSHEET) {
        keyIdx = 0;
        columns[0].data = null;
    }
    else {
        keyIdx = 1;
        columns[0].data = maintableKeys[0];
    }
    startIndex = startIndex - keyIdx; //DO I STILL NEED THIS?
    // console.log({startIndex, keyIdx});
    // keyIdx = startIndex;

    while (keyIdx < maintableKeys.length) {
        //1. datatables column element
        const key = maintableKeys[keyIdx].replace(/\./g, '\\\\.');
        //BASIC TEMPLATE
        let DTcolumn = {
            //"title": el,
            "data": key,
            "defaultContent": '',
        };
        //create <span> only in columns which have separate sheet
        if (SHEETS.includes(key)) {
            //render
            DTcolumn.render = function (data, type, row, meta) {
                if (data) { //data can be =null
                    if (Array.isArray(data)) data = data.join(";"); //DANGEROUS
                    //how can I be sure that ";" is a valid delimiter???????
                    const result = '<span class="delim^ match">' + data.replaceAll(delims, '</span>$&<span class="delim$& match">') + '</span>';
                    //console.log(result);
                    return result.replaceAll('"></span>', ' '); // = HACK! quotation mark doesn't close so next item is included in the element class => see css [class*='delim;?<span class=']
                }
            }
            // if (Array.isArray(jsondata[jidx][key]){ //checks first value in column, but can be the case that values later on are different!
            //     DTcolumn.render = function (data, type, row, meta) {
            //         //FOR NOW, until all the data is already split in json/xml, I join the Array to a string again, and split it up with the extra delimiters
            //         if (data) {
            //             // console.log(data);
            //             data = data.join(";").split(delims);
            //             let i = 0, len = data.length, result = "", span = "";
            //             while (i < len - 2) {
            //                 if (data[i + 1].indexOf("\n") == -1) span = '<span class="padright">' + data[i + 1] + '</span>'
            //                 else span = '<br class="padbottom">'
            //                 result += '<span class="match">' + data[i].trim().replace(trimdelim, "</span>$&") + span; //trimdelim for cutting of instrument brackets
            //                 i += 2;
            //             }
            //             return result += '<span class="match">' + data[i].trim().replace(trimdelim, "</span>$&");// + '<span class="padright">' //last one without delimiter span
            //         }
            //     }
            // }
            // else DTcolumn.render = function (data, type, row, meta) {
            //     if (data) return '<span class="match">' + data + '</span>';
            // }
            //createdCell
            DTcolumn.createdCell = function (td, cellData, rowData, rowIndex, colIndex) {
                //OR USE BALLOON.CSS instead of Tooltipster?? for performance
                $(td).find('span.match').tooltipster({
                    functionBefore: function (instance, helper) {
                        const textContent = helper.origin.textContent;
                        const doubt = helper.origin.classList.contains("?<span");
                        const firstkey = Object.keys(jason[key][0])[0];
                        // console.log({textContent, doubt, firstkey, key});
                        const query = jason[key].filter(x => { if (x[firstkey]) return x[firstkey].toString().toLowerCase() === textContent.toLowerCase() }); //use if in case x["id"] DOESN't EXIST!
                        if (query.length > 0) instance.content((doubt ? ["<p>?</p>"] : []).concat(formatTooltip(query[0])));
                    },
                    interactive: true
                });
            };
        }
        else if (key.startsWith("<")) {
            DTcolumn.render = function (data, type, row, meta) {
                if (type === 'display') {
                    if (key == "<img>") {
                        return '<img class="inline" src="' + data + '"></img>'
                    }
                    else {
                        return key + data + key.slice(0, 1) + "/" + key.slice(1)
                    }
                }
                else return data;
            }
        }
        else {
            DTcolumn.render = function (data, type, row, meta) {
                if (data) {
                    if (typeof (data) === "string") {
                        return anchorme({
                            input: data,
                            options: {
                                truncate: 25,
                                middleTruncation: true,
                                attributes: {
                                    target: "_blank"
                                }
                            }
                        })
                    }
                    else return data
                }
            }
        }

        //type column
        const namespace = key.substring(0, key.indexOf(":"));
        if (key == MAINSHEET) {
            DTcolumn.className = "match";
        }
        else if (key == linktype) {
            // DTcolumn.className = "middle";
            DTcolumn.render = function (data, type, row, meta) {
                if (data) return '<div class="typeicon ' + data + '" title="' + data + '">' + data + '</div>'
            }
        }
        //merger columns
        else if (key.startsWith(".") || key.startsWith("-")) {
            DTcolumn.className = "merger";
            DTcolumn.visible = false;
            //const maincolumn = columns[columns.length - 1];
            const merger = { "cellIndex": columns.length - 1, "cat": key, "type": key[0] }; //"con": maincolumn.data, 
            mergecolumns.push(merger);
        }
        //namespace column
        else if (namespace.length && maintableKeys.includes(namespace)) {
            DTcolumn.className = "namespace";
            DTcolumn.visible = false;
            //const maincolumn = columns.find(x => x.data == key.substring(0, key.indexOf(":")));
            const merger = { "cellIndex": columns.findIndex(x => x.data == namespace), "cat": key, "type": ':' }; //"con": maincolumn.data, 
            mergecolumns.push(merger);
        }
        //child rows
        else if (key.startsWith(CE)) {
            DTcolumn.className = "childrow";
            DTcolumn.visible = false;
        }
        else if (key.startsWith("<")) {
            DTcolumn.className = "htmltag";
            // DTcolumn.visible = false;
        }
        else {
            //DTcolumn.cellIndex = startIndex + keyIdx; //not used anymore
            visIndex += 1;
        }
        //ADD COLUMN to DATATABLE
        columns.push(DTcolumn);

        //2. HTML
        const th = document.createElement("th");
        th.append(document.createTextNode(key));
        header_row.append(th);

        keyIdx++;
    }

    //FINAL column: (v)(^)
    const LASTcol = {
        "width": '0px',
        "className": 'LASTcol',
        "orderable": false,
        "defaultContent": '',
        "createdCell": function (cell, cellData, rowData, rowIndex, colIndex) {
            let i = 0;
            const len = childrowsHeaders.length;
            while (i < len) {
                if (rowData[childrowsHeaders[i]]) {
                    cell.classList.add('arrow-ctrl');
                    break;
                }
                i++;
            }
        },
        "cellIndex": startIndex
    }
    header_row.append(document.createElement("th"));
    columns.push(LASTcol)
    visIndex += 1;
    startIndex += 1;


    // if (maintable && maintable == LINKSHEET) dt_order = [[startIndex + LINKSHEET_keys.indexOf(MAINSHEET), 'asc']];
    // else dt_order = [[0, 'asc']];//[[startIndex + 1, 'asc']];
    dt_order = [[0, 'asc']];

    if (table.getAttribute("id") == "fixedtable") {
        if (SECTION.classList.contains("scrolly")) dt_scrolly = tableheight;
        else {
            dt_scrolly = '';
            dt_fixedHeader = {
                header: true,
                footer: true
            };
        }
        //OLD: dom = "lfrti";
        dt_layout = {
            top:
            {
                search: {
                    text: '',
                    placeholder: "Type to start search in '" + sheetName + "' tab..."

                }
            },
            topStart: null,
            topEnd: null,
            // bottomStart: createNavFooter(SHEETS), //THIS IS NOT THE TABLE FOOTER!!! so doesn't stick
            bottom: [
                'pageLength',
                'paging',
                'info'
            ],
            bottomStart: null,
            bottomEnd: null,
        };
    }
    else {
        dt_fixedHeader = false;
        dt_scrolly = '';
        //OLD: dom = "lfti";
        dt_layout = {
            topStart: null,
            topEnd: null,
            bottomStart: null,
            bottomEnd: 'info'
        };
    }

    if (jsondata.length < 250) dt_pageLength = -1
    else dt_pageLength = 100

    //if (visIndex > 8) fixedtable.classList.add("compact");
    //console.log("!(dt_scrolly === undefined) => " + dt_scrolly.length);
    console.log("dt_scrolly  => " + dt_scrolly);
    // console.log(mergecolumns);
    //DATATABLE    
    const dTable = $(table).DataTable({
        "fixedHeader": dt_fixedHeader,
        // pageResize: true,
        // responsive: true,
        scrollResize: dt_scrolly.length,
        scrollY: dt_scrolly,
        // scrollX: true,
        // scrollCollapse: true,
        // lengthChange: false,
        columnDefs: [
            { type: 'natural-ci', target: 0 },
        ],
        "data": jsondata,
        "layout": dt_layout,
        "deferRender": true,
        "pageLength": dt_pageLength,
        "lengthMenu": [25, 50, 75, 100, { label: 'All', value: -1 }],
        "autoWidth": false,
        "order": dt_order,
        "orderCellsTop": true,
        "columns": columns,
        "createdRow": function (row, data, dataIndex, cells) {
            //create summary attribute in aria-label="...id..."
            if (maintable && maintable == LINKSHEET) row.setAttribute("summary", data[MAINSHEET] + LINKSHEET);
            else {
                row.setAttribute('aria-label', data[maintableKeys[0]]);

                row.classList.add('IDtip');
                row.setAttribute('data-balloon-visible', true);
                row.setAttribute('data-balloon-pos', 'up-left');

                // cells[0].innerHTML = `<button class="btn"></button>`;
                // //copy ID <btn> for ClipboardJS (not necessary anymore!!!!!)
                // cells[0].innerHTML = `<button class="btn" data-clipboard-text="` + data[maintableKeys[0]] + `"></button>`;
            }
            // if (maintable != LINKSHEET) row.classList.add('IDheader');
            //balloon.css MESSES UP TABLE LAYOUT!!!??
            // if (maintable != LINKSHEET) {
            //     row.classList.add('IDtip');
            //     row.setAttribute('data-balloon-visible', true);
            //     row.setAttribute('aria-label', data[maintableKeys[0]]);
            //     row.setAttribute('data-balloon-pos', 'up-left');
            // }

            //CONCAT COLUMNS (concat data is not available for column search this way)
            //OR ... do earlier in column.render (rowData is available there)

            //OR ... make formatting function based on 1st row, see how many mergers there are, where they should go and do for each row
            let catdata;

            mergecolumns.forEach(function (mergecolumn, i) {
                catdata = data[mergecolumn.cat];
                if (catdata) {
                    let mergeDOM;
                    if (mergecolumn.type === "-") {
                        mergeDOM = document.createElement("span");
                        mergeDOM.classList.add("inlinedetails");
                        mergeDOM.innerText = "-";
                    }
                    else {
                        mergeDOM = document.createElement("p");
                        mergeDOM.classList.add("subdetails");
                        if (mergecolumn.type === ":") mergeDOM.innerHTML = "<span class='inlinedetails'>" + mergecolumn.cat.substring(mergecolumn.cat.indexOf(":") + 1) + ": " + "</span>";
                    }
                    if (typeof (catdata) === "string") {
                        mergeDOM.innerHTML += anchorme({
                            input: catdata,
                            options: {
                                truncate: 50,
                                middleTruncation: true,
                                attributes: {
                                    target: "_blank"
                                }
                            }
                        });
                    }
                    else mergeDOM.innerHTML += catdata;

                    cells[mergecolumn.cellIndex].append(mergeDOM);
                }
            });

            //html attributes
            //ROW
            //const rowid = maintable?.replace(/\s+/g, '') + ":" + dataIndex;
            const rowid = maintable + ":" + dataIndex;
            row.setAttribute("id", rowid);

        },
        //TAKES ALMOST 10 seconds!! ===>
        // "drawCallback": function (settings) {
        //     this.api().columns.adjust().draw();
        // },
        "initComplete": function (settings, json) {

            // this.api().columns.adjust().draw();

            console.log("table#" + table.id + " DataTable: initComplete");
            // $(table).show(); //do here, otherwise dropdown <input> aren't generated...
            $('div#dt_loader').hide();

            //FIXED TOOLTIPS on ID column
            //create tooltips
            //createTooltips(table);


            if (table.getAttribute("id") == "fixedtable") {
                headerfilters_row = header_row.cloneNode(true);
                headerfilters_row.classList.add("columnfilters");
                // headerfilters_row.setAttribute("class", "columnfilters");
                if (SECTION.classList.contains("scrolly")) $("div.dt-scroll thead")[0].append(headerfilters_row);
                else table.getElementsByTagName("thead")[0].append(headerfilters_row);

                //document.getElementById("LOOKAHERE").setAttribute("colspan", columns.length);

                //COLUMN FILTERS
                this.api().columns(':visible').every(function () {
                    const column = this;
                    const jqth = column.header();
                    const jqthfilter = $(headerfilters_row).find('th').eq(column.index('visible'));

                    jqthfilter.empty(); //empty cell, not yet attributes
                    // while (jqthfilter.get(0).attributes.length > 0) //remove attributes WHY?????
                    //     jqthfilter.get(0).removeAttribute(jqthfilter.get(0).attributes[0].name);

                    //setting <td> classes depending on <th> classlist 
                    if (jqth.classList.contains("IDcol")) {
                        // jqthfilter.get(0).setAttribute("class", jqth.className)
                        //$("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                    }
                    else if (jqth.classList.contains("LASTcol")) {
                        // jqthfilter.get(0).setAttribute("class", jqth.className)
                        //$("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                    }
                    else if (jqth.classList.contains("htmltag")) {

                    }
                    else if (jqth.classList.contains("LINKcol")) {
                        // jqthfilter.get(0).setAttribute("class", jqth.className)
                        //if (linktable_types.size == 0) linktable_types.add(""); //=> do it another way...breaks code further on
                        if (linktable_types.size == 0) {
                            $('<div class="nowrap"><input type="checkbox" id="" name="linkcheckbox" value=".+" class="headercheckbox" />' +
                                '<label for=""></label></div>')
                                .appendTo(jqthfilter);
                        }
                        else {
                            linktable_types.forEach(function (value, index, array) {
                                $('<div class="nowrap"><input type="checkbox" id="' + value + '" name="linkcheckbox" value="' + value + '" class="headercheckbox" />' +
                                    '<label for="' + value + '">' + value + '</label></div>')
                                    .appendTo(jqthfilter);
                            });
                        }
                        jqthfilter.find('input:checkbox').on('change', function (e) {
                            //build a regex filter string with an or(|) condition
                            const checkboxes = jqthfilter.find('input:checkbox:checked').map(function () {
                                return this.value;
                            }).get().join('|');
                            //filter in column 1, with an regex, no smart filtering, not case sensitive
                            column.search(checkboxes, true, false, true).draw(false);
                        });
                    }
                    else {
                        //if (Array.isArray(column.data()[0]);
                        // if (Array.isArray(ARR[0])) ARR = [...new Set(ARR.flat())];//.sort();
                        // else ARR = ARR = [...new Set(ARR)];//.sort();
                        //above condition doesn't always work! First item can be different (array or non-array) than other items

                        // WHERE TO PERFORM UNIQUE?
                        // 1. on ARRAY from DataTables column (otherwise every array has the lenght of the total number of rows = i.e. 150.000 in case of +MEDIA in slave)
                        // 2. on SET with all 
                        // 3. on MAP
                        //if (Array.isArray(column.data()[0]);

                        //* ONLY WHEN DATA IS NOT FULLY SPLIT inside json *//
                        let a, ajtrim;
                        const MAP = new Map();
                        let RES, RESlength;

                        // //SPLIT data option 1 : use DataTables
                        // column.data().each(function (val, i) {
                        //     if (Array.isArray(val)) {
                        //         a = [];
                        //         for (var i = val.length - 1; i >= 0; i--) {
                        //             a = a.concat(val[i].toString().split(delimsNC));
                        //         }
                        //     }
                        //     else a = val.toString().split(delimsNC);
                        //     for (var j = a.length - 1; j >= 0; j--) {
                        //         atrim = a[j].trim();
                        //         MAP.set(atrim.toLowerCase(), atrim);
                        //     }
                        // }); //.unique().toArray()

                        // SPLIT data option 2 : use JS
                        const ARR = column.data().toArray().flat();//unique().filter(i => i != undefined);
                        let i = ARR.length;
                        while (i > 0) {
                            a = ARR[--i].toString().split(delimsNC);
                            for (var j = a.length - 1; j >= 0; j--) {
                                ajtrim = a[j].trim();
                                MAP.set(ajtrim.toLowerCase(), ajtrim);
                            }
                        }

                        // FINISH UP : clean up and sort
                        [null, undefined, "", ":", "?", "(", ")"].forEach(Map.prototype.delete, MAP);
                        // console.log(ARR);
                        RES = [...MAP.values()].sort((a, b) => a[0].localeCompare(b[0], undefined, { 'sensitivity': 'base' })); //String(a[0]) but is already string by using toString() above?
                        RESlength = RES.length;
                        // console.log(RES);

                        //OPTION 1: HTML5 datalists
                        if (RESlength > 6) {
                            let input = $('<input type="search" size="10" autocomplete="off" list="' + jqth.innerText + '-list" id="' + jqth.innerText + '-input" name="' + jqth.innerText + '" class="headersearch" />').appendTo(jqthfilter)
                                .on('change search', function () {
                                    if (column.search() !== this.value) {
                                        column
                                            .search(this.value)
                                            .draw('page');
                                    }
                                });
                            let jqdatalist = $('<datalist id="' + jqth.innerText + '-list"></datalist>').insertAfter($(input));
                            let datalist = jqdatalist[0];
                            let o;
                            // RES.forEach(function (value) {
                            for (var r = 0; r < RESlength; r++) {
                                o = document.createElement("option");
                                // o.setAttribute("value", value);
                                o.setAttribute("value", RES[r]);
                                datalist.appendChild(o);
                            }
                            // });
                        }
                        else {
                            // RES.forEach(function (value) {
                            let value;
                            for (var r = 0; r < RESlength; r++) {
                                value = RES[r];
                                $('<div class="nowrap"><input type="checkbox" id="' + value + '" name="linkcheckbox" value="' + value + '" class="headercheckbox" />' +
                                    '<label for="' + value + '">' + value + '</label></div>')
                                    .appendTo(jqthfilter);
                            }
                            // });

                            jqthfilter.find('input:checkbox').on('change', function (e) {
                                //build a regex filter string with an or(|) condition
                                const checkboxes = jqthfilter.find('input:checkbox:checked').map(function () {
                                    return RegExp.escape(this.value);
                                }).get().join('|');
                                //filter in column 1, with an regex, no smart filtering, not case sensitive
                                column.search(checkboxes, true, false, true).draw(false);
                            });
                        }
                    }
                });

                $(table).find(".btn").each(function () {
                    this.addEventListener("click", () => navigator.clipboard.writeText(this.parentElement.parentElement.getAttribute("aria-label")).then(() => {
                        console.log("copy to clipboard: '" + this.parentElement.parentElement.getAttribute("aria-label") + "'");
                    })
                        .catch(() => {
                            alert("copy to clipboard failed");
                        }));
                });

            }

            //CHILDROW: details
            $(table).children('tbody').on('click', '> tr > td.LASTcol', function () {
                const tr = this.parentElement;
                // const jqtr = $(this.parentElement);
                const dRow = dTable.row($(tr));

                // console.log(dRow);
                if (typeof SIDEPANEL === "undefined") {

                    if (dRow.child.isShown()) {
                        // This row is already open - close it
                        dRow.child.hide();
                        $(tr).removeClass('LASTshown');
                    }
                    else {
                        // Open this row
                        //detailsTableDOM = "";
                        let detailsTable = "";
                        const childcells = dTable.cells(dRow, ".childrow");//, idx);
                        for (var i = 0; i < childcells.data().length; i++) {
                            if (childcells.data()[i]) detailsTable += formatChildRows(childrowsHeaders[i].substring(CE.length), childcells.data()[i]);
                        }
                        if (detailsTable != "") {
                            detailsTable = '<table class="detailstable row-border">' + detailsTable + '</table>';
                            // detailsTableDOM = document.createElement('div');
                            // detailsTableDOM.innerHTML = detailsTable;
                        }
                        dRow.child(detailsTable, "child").show();
                        // [$(tr).next('tr.child'), $(tr).next('tr.child').next('tr.child')].forEach(childtr => {
                        //     childtr.children('td').attr("colspan", (i, val) => val--);
                        //     childtr[0].prepend(document.createElement("td"));
                        // });

                        $(tr).addClass('LASTshown');
                    }
                }
                else {
                    let detailsTable = "";

                    // ALL AT ONCE
                    // for (var i = 0; i < maintableKeys.length; i++) {
                    //     detailsTable += formatSidePanel(maintableKeys[i], dRow.data()[maintableKeys[i]]);
                    // }

                    //or First visible cells
                    const viscells = dTable.cells(dRow, ':visible');
                    const viscellsIdx = viscells.indexes().pluck('column')
                    for (var i = 0; i < viscells.data().length; i++) {
                        detailsTable += formatSidePanel(maintableKeys[viscellsIdx[i]], viscells.data()[i]);
                    }
                    //then unvisible Childcells (with different layout)
                    const childcells = dTable.cells(dRow, ".childrow");//, idx);
                    for (var i = 0; i < childcells.data().length; i++) {
                        if (childcells.data()[i]) detailsTable += formatSidePanel(childrowsHeaders[i].substring(CE.length), childcells.data()[i]);
                    }
                    //then HTML tag headers
                    const htmlcells = dTable.cells(dRow, ".htmltag");//, idx);
                    for (var i = 0; i < htmlcells.data().length; i++) {
                        if (htmlcells.data()[i]) detailsTable += formatHtmlTag(htmlTagHeaders[i], htmlcells.data()[i]);
                    }


                    if (detailsTable != "") {
                        detailsTable = '<table class="detailstable row-border">' + detailsTable + '</table>';
                        // detailsTableDOM = document.createElement('div');
                        // detailsTableDOM.innerHTML = detailsTable;
                    }
                    INFOPANEL.innerHTML = detailsTable;
                }
            });

            //CHILDROW: linked elements
            $(table).children('tbody').on('click', ' > tr > td.plus-ctrl', function () {
                const tr = this.parentElement;
                // const jqtr = $(this.parentElement);
                const dRow = dTable.row($(tr));
                console.log(" (+)-->CLICK : '" + maintable + "' / linktable: '" + linktable + "' / id: '" + tr.id + "'");

                if (dRow.child.isShown()) {
                    // This row is already open - close it
                    dRow.child.hide();
                    $(tr).removeClass('LINKshown');
                }
                else {
                    // Open this row
                    let linkTableDOM = "";
                    const linkcellData = dTable.cells(dRow, ".LINKcol").data()[0];
                    let linkedItems = [];
                    if (linkcellData) {
                        //filter linked elements                            
                        if (linktable_types.size > 0) {
                            for (const [type, typeIdxArr] of Object.entries(linkcellData)) { // for ... of ... is slow? short loop, but occurs many times
                                linkedItems.push(...typeIdxArr.map((item) => jason[linktable][item]));
                            }
                        }
                        else linkedItems.push(...linkcellData.map((item) => jason[linktable][item]));

                        linkTableDOM = document.createElement('table');
                        linkTableDOM.setAttribute("id", tr.id + "." + linktable);
                        linkTableDOM.setAttribute("class", "linktable row-border"); //compact
                        linkTableDOM.innerHTML = '<thead></thead>' +
                            '<tbody></tbody>' +
                            '<tfoot></tfoot>';
                    }
                    dRow.child(linkTableDOM, "child").show();
                    if (linkcellData) makeDataTable(document.getElementById(tr.id + "." + linktable), linkedItems, linktable);
                    //this.scrollIntoView(); //used to fix clicked line getting out of view, but now is not necessary anymore?
                    $(tr).addClass('LINKshown');
                }
            });
        }
    });
    //.columns.adjust().draw() MAKES NAVIGATION FOOTER DISAPPEAR??????????????
    // this.api().columns.adjust().draw();
    // dTable.columns.adjust().draw();




    dTable.on('draw', function () {
        console.log('redraw occurred at: ' + new Date().getTime());
        $(table).find(".tooltipstered").tooltipster('enable');
    });
    // dTable.on('destroy', function () {
    //     console.log('destroy occurred at: ' + new Date().getTime());
    //     //table = document.getElementById(tableid);
    //     //createTooltips(table);
    // });

    return dTable;
}

function formatChildRows(h, d) {
    if (d) {
        const formated = anchorme({
            input: d.toString(),
            options: {
                truncate: 50,
                middleTruncation: true,
                attributes: {
                    target: "_blank"
                }
            }
        });
        return '<tr class="detailsRow">' +
            '<td class="detailsHeader">' + h + ':</td>' +
            '<td>' + formated + '</td>' +
            '</tr>'
    }
    else return ''
}
function formatHtmlTag(h, d) {
    if (h == "<img>") {
        return '<tr class="detailsRow">' +
            '<td class="detailsHeader"><img class="sidepanel" src="' + d + '"></img></td>' +
            '</tr>'
    }
    else {
        return '<tr class="detailsRow">' +
            '<td class="detailsHeader">' + h + d + h.slice(0, 1) + "/" + h.slice(1) + '</td>' +
            '</tr>'
    }
}
function formatSidePanel(h, d) {
    if (d) {
        const formated = anchorme({
            input: d.toString(),
            options: {
                truncate: 50,
                middleTruncation: true,
                attributes: {
                    target: "_blank"
                }
            }
        });
        return '<tr class="sidepanelRow">' +
            '<td class="sidepanelHeader">' + h + ':</td>' +
            '</tr>' + '<tr>' +
            '<td>' + formated + '</td>' +
            '</tr>'
    }
    else return ''
}

function createNavFooter(sheets) {
    //NAV
    const navfooter = document.createElement("div");
    navfooter.setAttribute("id", "navfooter");
    const tabs_ul = document.createElement("ul");
    let tab_li, tab_a;
    sheets.forEach(function (sheet) {
        if (sheet == LINKSHEET || MAINSHEET_keys.includes(sheet) || LINKSHEET_keys.includes(sheet)) {
            tab_li = document.createElement("li");
            tab_li.setAttribute("class", "menu tab");
            tabs_ul.append(tab_li);
            tab_a = document.createElement("a");
            tab_a.setAttribute("id", "btn-" + sheet);
            tab_a.setAttribute("class", "menu tab");
            tab_a.setAttribute("href", "#" + sheet);
            tab_a.setAttribute("sheet", sheet);
            tab_li.addEventListener('click', function () {
                $(this).addClass('active');
                $(this).siblings().removeClass('active');

                if (DataTable.isDataTable(fixedtable)) {
                    dfixedtable.clear().destroy();
                }

                //ISSUE: you have to completely destroy the <thead> en <tbody> elements of the table before you can create a new DataTable on it (for the child rows to work at least...)
                fixedthead.innerHTML = "";
                fixedtbody.innerHTML = "";
                fixedtable.removeChild(fixedthead);
                fixedtable.removeChild(fixedtbody);
                // fixedtfoot.querySelectorAll("tr:not(#fixedfooterrow)").forEach(tr => tr.remove());

                dfixedtable = makeDataTable(fixedtable, jason[sheet], sheet);
            }, false);
            // if (sheet == MAINSHEET) $(tab_li).addClass('active');
            //set names
            tab_a.innerText = sheet;
            //set colors
            if (sheet == MAINSHEET || MAINSHEET_keys.includes(sheet)) $(tab_a).addClass("MAINclr");
            else $(tab_a).addClass("LINKclr");
            //set outline
            if (sheet == MAINSHEET || sheet == LINKSHEET) $(tab_a).addClass("MAINLINK");

            tab_li.append(tab_a);
        }
    });
    navfooter.append(tabs_ul);
    return navfooter;
}

function formatTooltip(object) {
    let result = [];
    const props = Object.getOwnPropertyNames(object);
    const linkKeyIdx = props.indexOf("LINKIDXS");
    if (linkKeyIdx > -1) props.splice(linkKeyIdx, 1);
    for (var i = 1; i < props.length; i++) {
        if (object[props[i]]) result.push($("<li style='list-style-type:none;'><span class='inlinedetails'>" + props[i] + ": </span>" + anchorme({ input: object[props[i]].toString(), options: { attributes: { target: "_blank" } } }) + "</li>"));
    }
    return result;
}

async function toJSON(reader) {
    //   const reader = body.getReader(); // `ReadableStreamDefaultReader`
    const decoder = new TextDecoder();
    const chunks = [];
    //PROGRESSBAR!!
    const downloadProgress = document.getElementById("download-progress");
    let success = true;
    const totalDownloadBytes = response.headers.get("content-length");
    let bytesDownloaded = 0;
    async function read() {
        const { done, value } = await reader.read();


        // all chunks have been read?
        if (done) {
            return JSON.parse(chunks.join(''));
        }
        bytesDownloaded += value.length;
        if (totalDownloadBytes != undefined) {
            console.log("download progress:", bytesDownloaded / totalDownloadBytes);
            downloadProgress.value = bytesDownloaded / totalDownloadBytes;
        } else {
            console.log("download progress:", bytesDownloaded, ", unknown total");
        }


        const chunk = decoder.decode(value, { stream: true });
        chunks.push(chunk);
        return read(); // read the next chunk
    }

    return read();
}