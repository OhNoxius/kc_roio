//HTML
document.body = document.createElement("body");
const HEADER = document.body.appendChild(document.createElement("header"));
const SECTION = document.body.appendChild(document.createElement("section"));
const FOOTER = document.body.appendChild(document.createElement("footer"));
HEADER.appendChild(document.createElement("div")).id = "heading";
HEADER.appendChild(document.createElement("div")).id = "status";
HEADER.appendChild(document.createElement("div")).id = "activity";
SECTION.innerHTML = '<table id="fixedtable" class="hover row-border" width="100%" style="display:none"></table><div id="dt_loader" class="spinner"></div>';
FOOTER.id = "navigation";

//document.body.innerHTML = '<header>    < div id = "heading" ></div >		<div id="status"></div>		<div id="activity"></div>	</header >	<section id="database">		<table id="fixedtable" class="hover row-border" width="100%" style="display:none"></table>	<div id="dt_loader" class="spinner"></div>	</section>	<footer id="navigation"></footer>';

// DON'T TOUCH
let linkMap = new Map();
let fixedtable, dfixedtable;
let fixedthead, fixedtbody, fixedtfoot;
let fixedfooter_row;
let linktype;
let sheetLinkedMap = new Map();

// DON'T TOUCH

let jason;
let SHEETS, MAINSHEET, LINKSHEET;
let MAINSHEET_keys = [], LINKSHEET_keys = []
let LINKSHEET_types = new Set();

const delims = /([;:\r\n]+)/g
const trimdelim = /((?<!\s)\()|$/ //not global => to trim
const delimsNC = /(?:[;:?\r\n]+)|(?:(?<!\s)\()/g //includes "?" as delimiter (non capturing)
const nospacebrack = /((?<=[^\s\\])\()/g
const charBeforeBrack = /[^\s\\](?=\()/g
//const delims = /([:\r\n]+)|((?<=[^\s\\])\()/g
//const delims = /([:\r\n]+)|((?<!\s)\()/g ///([:+\r\n]+)|((?<!\s)\()/g //BROKE SAFARI!!!!!!!!
//old school
let jidx = 0, lidx = 0;
let keyIdx = new Map();
let keyPrev = new Map();

document.addEventListener('DOMContentLoaded', function () {

    //HEADING
    const heading = document.createElement("h1");
    const heading_a = document.createElement("a");
    try { heading_a.innerText = s2w_heading; }
    catch (e) { heading_a.innerText = s2w_datafile; }
    try { linktype = s2w_typeheader; }
    catch (e) { linktype = ""; }
    heading_a.setAttribute("href", "");
    heading_a.setAttribute("class", "heading");
    heading.append(heading_a);
    document.getElementById("heading").append(heading);
    //FILE UPDATED
    lastUpdated(s2w_datafile, "activity");

    fixedtable = document.getElementById("fixedtable");
    // fixedthead = fixedtable.appendChild(document.createElement("thead"));
    // fixedtbody = fixedtable.appendChild(document.createElement("tbody"));
    // fixedtfoot = fixedtable.appendChild(document.createElement("tfoot"));

    fetch(s2w_datafile)
        .then(res => res.json())
        .then(json => {
            jason = json;

            //PROCESS JSON
            //1. identify important nodes
            SHEETS = Object.keys(jason);
            MAINSHEET = SHEETS[0];
            LINKSHEET = SHEETS.find(e => e.startsWith("+"));
            MAINSHEET_keys = Object.keys(jason[MAINSHEET][0]);
            /////////////// ORRRRRRRRRRRRRRRRRRRRRRRRRR NOT
            //let jlen = Object.keys(jason[MAINSHEET]).length, j = 0, imax = -Infinity;
            // while (j < jlen) {
            //     let jkeys = Object.keys(jason[MAINSHEET][j]);
            //     let jkeyslen = jkeys.length;

            //     //k = 0 first key
            //     if (!keyIdx.get(jkeys[0]) > 0) {
            //         keyIdx.set(jkeys[0], 0);
            //         //keyPrev.set(jkeys[1], jkeys[0]);
            //     }
            //     let k = 1;
            //     //k > 0 other keys
            //     while (k < jkeyslen) {
            //         //keyIdx
            //         if (keyIdx.has(jkeys[k])) {
            //             if (k > keyIdx.get(jkeys[k])) {
            //                 keyIdx.set(jkeys[k], k);
            //             }
            //         }
            //         else {
            //             keyIdx.set(jkeys[k], k);
            //         }
            //         //keyPrev
            //         if (keyPrev.has(jkeys[k])) {
            //             if (keyIdx.get(jkeys[k - 1]) > keyIdx.get(keyPrev.get(jkeys[k]))) {
            //                 keyPrev.set(jkeys[k], jkeys[k - 1]);
            //             }
            //         }
            //         else {
            //             keyPrev.set(jkeys[k], jkeys[k - 1]);
            //         }
            //         k++;
            //     }
            //     // k last key
            //     // if (keyIdx.has(jkeys[k])) {
            //     //     if (jkeyslen > keyIdx.get(jkeys[jkeyslen])) keyIdx.set(jkeys[jkeyslen], jkeyslen);
            //     // }
            //     // else keyIdx.set(jkeys[jkeyslen], jkeyslen);
            //     //if (!MAINSHEET_keys.slice(j).includes(jkeys[j])) MAINSHEET_keys.splice(j + 1, 0, jkeys[j])
            //     j++
            // }

            // MAINSHEET_keys = []; //new Array(keyIdx.size);
            // for (const [key, value] of keyIdx) {
            //     if (typeof MAINSHEET_keys[value] === "undefined") {
            //         MAINSHEET_keys.splice(value, 0, key);
            //         keyPrev.delete(key);
            //     }
            // }
            // console.log(MAINSHEET_keys);
            // let keyPrevSorted = new Array(keyIdx.size);
            // for (const [key, value] of keyPrev) {
            //     keyPrevSorted[keyIdx.get(key)] = key;
            // }
            // console.log(keyPrevSorted);
            // for (const key of keyPrevSorted) {
            //     if (!(typeof key === "undefined")) MAINSHEET_keys.splice(MAINSHEET_keys.indexOf(keyPrev.get(key)) + 1, 0, key);
            // }
            // console.log(MAINSHEET_keys);

            if (LINKSHEET) {
                LINKSHEET_keys = Object.keys(jason[LINKSHEET][0]);
                //find longest Object and create keys
                // jlen = Object.keys(jason[LINKSHEET]).length, i = 0, imax = -Infinity;
                // while (i < jlen) {
                //     let ilen = Object.keys(jason[LINKSHEET][i]).length;
                //     if (ilen > imax) {
                //         imax = ilen;
                //         lidx = i;
                //     }
                //     i++;
                // }
                // LINKSHEET_keys = Object.keys(jason[LINKSHEET][lidx]);
            }
            else LINKSHEET_keys = [];

            //CREATE NAVIGATION FOOTER
            const navfooter = createNavFooter(SHEETS);
            // fixedfooter_row = document.createElement("tr");
            // fixedfooter_row.setAttribute('id', "fixedfooterrow");
            // const th = document.createElement("th");
            // th.setAttribute('id', "LOOKAHERE");
            // th.append(navfooter);
            // fixedfooter_row.append(th);
            // fixedtfoot.append(fixedfooter_row);            
            document.getElementById("navigation").append(navfooter);

            //FINAL CALL:
            //detect '#...' in url to choose initial sheet
            let urlHash = "";
            if (window.location.href.indexOf("#") > 0) urlHash = window.location.href.substring(window.location.href.indexOf("#") + 1,);
            if (urlHash) dfixedtable = makeDataTable(fixedtable, jason[urlHash], urlHash);
            else dfixedtable = makeDataTable(fixedtable, jason[MAINSHEET], MAINSHEET);
        })
});

function makeDataTable(table, jsondata, sheet) {
    if (table.getAttribute("id") == "fixedtable") {
        fixedthead = fixedtable.appendChild(document.createElement("thead"));
        fixedtbody = fixedtable.appendChild(document.createElement("tbody"));
    }

    const maintableKeys = Object.keys(jsondata[jidx]);
    //OPTIONAL: remove rows with empty 1st column
    jsondata = jsondata.filter(x => x[maintableKeys[0]] != null && x[maintableKeys[0]] != ""); //logical AND?? but this work, OR doesn't

    const maintable = sheet;
    let linktable;

    let columns = [], mergecolumns = [];

    const childrowsHeaders = maintableKeys.filter(x => x.startsWith("CE_"));

    //detect mode
    if (sheet == LINKSHEET) linktable = MAINSHEET;
    else if (sheet == MAINSHEET) linktable = LINKSHEET;
    else if (MAINSHEET_keys.includes(sheet)) linktable = MAINSHEET;
    else if (LINKSHEET_keys.includes(sheet)) linktable = LINKSHEET;

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
                        LINKel[MAINSHEET].toString().split("\n").forEach(function (MAINid) {
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
                console.log("linktableMap created between maintable:" + maintable + " and linktable:" + linktable);
                sheetLinkedMap.set(maintable, 1);
                if (linktableErrors.size > 0) {
                    console.log("unknown " + MAINSHEET + " id's:");
                    console.log(linktableErrors);
                }
            }
            //OPTION 2
            else {
                console.log(jsondata);
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
                                    linkElArr = linkElArr.concat(linkEl[maintable][i].split("\n"));
                                }
                                // linkElArr = linkEl[maintable];
                            }
                            //column exported as normal string
                            else linkElArr = linkEl[maintable].split("\n");

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
                console.log("linktableMap created between maintable:" + maintable + " and linktable:" + linktable);
                sheetLinkedMap.set(maintable, 1);
                if (linktableErrors.size > 0) {
                    console.log("unknown " + maintable + " id's in " + linktable + ":");
                    console.log(linktableErrors);
                }
            }
        }
        //console.log(linktableMap);
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
                cell.classList.add('tipdiv');
                cell.setAttribute('data-balloon-visible', true);
                cell.setAttribute('aria-label', cellData);
                cell.setAttribute('data-balloon-pos', 'up-left');

                //dropdown +/- 'button'
                //if (rowData["LINKIDXS"]) cell.classList.add('plus-ctrl');

                cell.innerHTML = `<button class="btn"></button>`;
                //copy ID <btn> for ClipboardJS (not necessary anymore!!!!!)
                cell.innerHTML = `<button class="btn" data-clipboard-text="` + cellData + `"></button>`;
            }
        },
        "cellIndex": startIndex
    }
    header_row.prepend(document.createElement("th"));
    columns.push(IDcol)
    visIndex += 1;
    startIndex += 1;

    //EXTRA: LINKcol
    if (maintableKeys.indexOf(linktable) == -1) {
        if (linktable) {
            let DTcolumn = {
                "width": '0px', //makes width fit content!
                "title": linktable,
                "className": 'LINKcol',
                // "orderable": false,
                "defaultContent": '',
                "data": "LINKIDXS",
                "render": function (data, type, rowData, meta) {
                    return data?.length
                },
                "cellIndex": startIndex,
                "createdCell": function (cell, cellData, rowData, rowIndex, colIndex) {
                    //balloon.css
                    if (maintable != LINKSHEET) {
                        //dropdown +/- 'button'
                        if (rowData["LINKIDXS"]) cell.classList.add('plus-ctrl');
                    }
                }
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
            header_row.prepend(document.createElement("th"));
            columns.push(DTcolumn);//columns.unshift(DTcolumn);
            startIndex += 1;
            visIndex += 1;
        }
    }

    //LOOP THROUGH KEYS
    let keyIdx;
    if (maintable == LINKSHEET) {
        keyIdx = 0;
        columns[0].data = null;
    }
    else {
        keyIdx = 1;
        columns[0].data = maintableKeys[0];
    }
    startIndex = startIndex - keyIdx; //DO I STILL NEED THIS?

    while (keyIdx < maintableKeys.length) {
        //1. datatables column element
        const key = maintableKeys[keyIdx].replace(/\./g, '\\\\.');
        //BASIC TEMPLATE
        let DTcolumn = {
            //"title": el,
            "data": key,
            "defaultContent": '',
        };
        //create <span> only in columns which have separte sheet
        if (SHEETS.includes(key)) {
            //createdCell
            DTcolumn.createdCell = function (td, cellData, rowData, rowIndex, colIndex) {
                //OR USE BALLOON.CSS instead of Tooltipster?? for performance
                $(td).find('span.linktip').tooltipster({
                    functionBefore: function (instance, helper) {
                        const textContent = helper.origin.textContent;
                        const firstkey = Object.keys(jason[key][0])[0];
                        const query = jason[key].filter(x => x[firstkey] == textContent);
                        if (query.length > 0) instance.content(formatTooltip(query[0]));
                    },
                    interactive: true
                });
            };
            //render
            if (Array.isArray(jsondata[jidx][key])) {
                DTcolumn.render = function (data, type, row, meta) {
                    //FOR NOW, until all the data is already split in json/xml, I join the Array to a string again, and split it up with the extra delimiters
                    if (data) {
                        data = data.join(";").split(delims);
                        let i = 0, len = data.length, result = "";
                        while (i < len - 2) {
                            result += '<span class="linktip">' + data[i].trim().replace(trimdelim, "</span>$&") + '<span class="padright">' + data[i + 1] + '</span>'; //trimdelim for cutting of instrument brackets
                            i += 2;
                        }
                        return result += '<span class="linktip">' + data[i].trim().replace(trimdelim, "</span>$&") + '<span class="padright">' //last one without delimiter span
                    }
                }
            }
            else DTcolumn.render = function (data, type, row, meta) {
                if (data) return '<span class="linktip">' + data + '</span>';
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
        else if (maintableKeys.includes(key.substring(0, key.indexOf(":")))) {
            DTcolumn.className = "namespace";
            DTcolumn.visible = false;
            //const maincolumn = columns.find(x => x.data == key.substring(0, key.indexOf(":")));
            const merger = { "cellIndex": columns.findIndex(x => x.data == key.substring(0, key.indexOf(":"))), "cat": key, "type": ':' }; //"con": maincolumn.data, 
            mergecolumns.push(merger);
        }
        //child rows
        else if (key.startsWith("CE_")) {
            DTcolumn.className = "childrow";
            DTcolumn.visible = false;
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

    //set some DT options
    let dt_fixedHeader, dt_layout, dt_order;
    // if (maintable == LINKSHEET) dt_order = [[startIndex + LINKSHEET_keys.indexOf(MAINSHEET), 'asc']];
    // else dt_order = [[0, 'asc']];//[[startIndex + 1, 'asc']];
    dt_order = [[0, 'asc']];

    if (table.getAttribute("id") == "fixedtable") {
        dt_fixedHeader = {
            header: true,
            footer: true
        };
        // dom = "lfrti";
        dt_layout = {
            // bottomStart: createNavFooter(SHEETS), //THIS IS NOT THE TABLE FOOTER!!! so doesn't stick
            bottomStart: 'paging',
            bottomEnd: 'info'
        };
    }
    else {
        dt_fixedHeader = false;
        // dom = "lfti";
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

    //DATATABLE    
    const dTable = $(table).DataTable({
        "data": jsondata,
        "layout": dt_layout,
        "processing": true, //only works with Ajax?
        "fixedHeader": dt_fixedHeader,
        "deferRender": true,
        "pageLength": dt_pageLength,
        "lengthMenu": [25, 50, 75, 100, { label: 'All', value: -1 }],
        "autoWidth": false,
        "order": dt_order,
        "orderCellsTop": true,
        "columns": columns,
        "createdRow": function (row, data, dataIndex, cells) {
            //balloon.css MESSES UP TABLE LAYOUT!!!??
            // if (maintable != LINKSHEET) {
            //     row.classList.add('tipdiv');
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
            const rowid = maintable.replace(/\s+/g, '') + ":" + dataIndex;
            row.setAttribute("id", rowid);
            //FILL IN SOME LINK VALUES
            if (maintable == LINKSHEET) row.setAttribute("summary", data[MAINSHEET] + LINKSHEET);
            else row.setAttribute("summary", data[maintableKeys[0]]);
        },
        //TAKES ALMOST 10 seconds!! ===>
        "initComplete": function () {
            console.log("table#" + table.id + " DataTable: initComplete");
            $(table).show(); //do here, otherwise dropdown <input> aren't generated...
            $('div#dt_loader').hide();

            //FIXED TOOLTIPS on ID column
            //create tooltips
            //createTooltips(table);

            //new ClipboardJS('.btn');
            $(table).find(".btn").each(function () {
                this.addEventListener("click", () => navigator.clipboard.writeText(this.parentElement.getAttribute("aria-label")).then(() => {
                    console.log("copy to clipboard: '" + this.parentElement.getAttribute("aria-label") + "'");
                })
                    .catch(() => {
                        alert("copy to clipboard failed");
                    }));
            });

            if (table.getAttribute("id") == "fixedtable") {
                const headerfilters_row = header_row.cloneNode(true);
                headerfilters_row.setAttribute("class", "columnfilters");
                table.getElementsByTagName("thead")[0].append(headerfilters_row);
                //document.getElementById("LOOKAHERE").setAttribute("colspan", columns.length);

                //COLUMN FILTERS
                this.api().columns(':visible').every(function () {
                    const column = this;
                    const jqth = column.header();
                    const jqthisfilter = $(table).find('thead > tr.columnfilters > th').eq(column.index('visible'));

                    jqthisfilter.empty(); //empty cell, not yet attributes
                    while (jqthisfilter.get(0).attributes.length > 0) //remove attributes
                        jqthisfilter.get(0).removeAttribute(jqthisfilter.get(0).attributes[0].name);

                    //setting <td> classes depending on <th> classlist 
                    if (jqth.classList.contains("IDcol")) {
                        jqthisfilter.get(0).setAttribute("class", "IDcol")
                        //$("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                    }
                    else if (jqth.classList.contains("LASTcol")) {
                        jqthisfilter.get(0).setAttribute("class", "LASTcol")
                        //$("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                    }
                    else if (jqth.classList.contains("LINKcol")) {
                        jqthisfilter.get(0).setAttribute("class", "LINKcol")
                        //if (linktable_types.size == 0) linktable_types.add(""); //=> do it another way...breaks code further on
                        linktable_types.forEach(function (value, index, array) {
                            $('<div class="nowrap"><input type="checkbox" id="' + value + '" name="linkcheckbox" value="' + value + '" class="headercheckbox" />' +
                                '<label for="' + value + '">' + value + '</label></div>')
                                .appendTo(jqthisfilter);
                        });
                        jqthisfilter.find('input:checkbox').on('change', function (e) {
                            //build a regex filter string with an or(|) condition
                            let checkboxes = jqthisfilter.find('input:checkbox:checked').map(function () {
                                return this.value;
                            }).get().join('|');
                            //filter in column 1, with an regex, no smart filtering, not case sensitive
                            column.search(checkboxes, true, false, true).draw(false);
                        });
                    }
                    else {
                        let input = $('<input type="search" size="10" autocomplete="off" list="' + jqth.innerText + '-list" id="' + jqth.innerText + '-input" name="' + jqth.innerText + '" class="headersearch" />'
                        ).appendTo(jqthisfilter)
                            .on('change search', function () {
                                if (column.search() !== this.value) {
                                    column
                                        .search(this.value)
                                        .draw('page');
                                }
                            });

                        const DTcolumnArray = column.data().unique().toArray();
                        //console.log(DTcolumnArray);
                        let ARR;
                        if (Array.isArray(DTcolumnArray[0])) ARR = DTcolumnArray.flat();//.sort();
                        else ARR = DTcolumnArray;//.sort();

                        //* ONLY WHEN DATA IS NOT FULLY SPLIT inside json *//
                        //let ARRstring1delim = ARR.join(s2w_delimiter).replace(delims, s2w_delimiter);
                        //ARR = ARRstring1delim.split(s2w_delimiter);
                        //old school
                        //ARRstring1delim = ARRstring1delim.replace(nospacebrack, s2w_delimiter + "("); //uses lookbehind
                        //ARRstring1delim = ARRstring1delim.replace(nospacebrack, s2w_delimiter + "$&"); //no lookbehind, just include matched character again 

                        ARR = ARR.join(";").split(delimsNC);

                        const MAP = new Map(ARR.map(s => [s.trim().toLowerCase(), s.trim()]));
                        ARR = [...MAP.values()].sort();

                        //let SET = new Set();
                        //const ARRlen = ARR.length;
                        //console.log(jqth.innerText + ": " + ARRlen); //up to 40.000 musicians!
                        // for (let i = 0; i < ARRlen; i++) {
                        //     SET.add(ARR[i].trim()); //exclude items that start with "(" ??
                        // }
                        // ARR.forEach((o, i, a) => {
                        //     SET.add(a[i].trim()); //exclude items that start with "(" ??
                        //     //if (trima[trima.length-1] != ")") ;
                        // });
                        //ARR = [...SET].sort(); //or use map, which is automatically sorted?

                        //* ONLY WHEN DATA IS NOT FULLY SPLIT inside json *//

                        //OPTION 1: HTML5 datalists
                        let jqdatalist = $('<datalist id="' + jqth.innerText + '-list"></datalist>').insertAfter($(input));
                        let datalist = jqdatalist[0];
                        let o;
                        ARR.forEach(function (value) {
                            o = document.createElement("option");
                            o.setAttribute("value", value);
                            datalist.appendChild(o);
                        });
                    }
                });
            }
        }
    });

    //CHILDROW: details
    $(table).children('tbody').on('click', '> tr > td.LASTcol', function () {
        //const tr = this.parentElement;
        const jqtr = $(this.parentElement);
        const dRow = dTable.row(jqtr);

        console.log(dRow);

        if (dRow.child.isShown()) {
            // This row is already open - close it
            dRow.child.hide();
            jqtr.removeClass('LASTshown');
        }
        else {
            // Open this row
            //detailsTableDOM = "";
            let detailsTable = "";
            const childcells = dTable.cells(dRow, ".childrow");//, idx);
            for (var i = 0; i < childcells.data().length; i++) {
                if (childcells.data()[i]) detailsTable += formatChildRows(childrowsHeaders[i], childcells.data()[i]);
            }
            if (detailsTable != "") {
                detailsTable = '<table class="detailstable row-border">' + detailsTable + '</table>';
                // detailsTableDOM = document.createElement('div');
                // detailsTableDOM.innerHTML = detailsTable;
            }
            dRow.child(detailsTable, "child").show();
            // [jqtr.next('tr.child'), jqtr.next('tr.child').next('tr.child')].forEach(childtr => {
            //     childtr.children('td').attr("colspan", (i, val) => val--);
            //     childtr[0].prepend(document.createElement("td"));
            // });

            jqtr.addClass('LASTshown');
        }
    });

    //CHILDROW: linked elements
    $(table).children('tbody').on('click', ' > tr > td.LINKcol', function () {
        const tr = this.parentElement;
        const jqtr = $(this.parentElement);
        const dRow = dTable.row(jqtr);
        console.log(" (+)-->CLICK : '" + maintable + "' / linktable: '" + linktable + "' / id: '" + tr.id + "'");

        if (dRow.child.isShown()) {
            // This row is already open - close it
            dRow.child.hide();
            jqtr.removeClass('LINKshown');
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
            jqtr.addClass('LINKshown');
        }
    });


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
            '<td class="detailsHeader">' + h.substr(3) + ':</td>' +
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