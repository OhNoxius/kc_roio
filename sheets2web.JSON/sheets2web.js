//DON'T TOUCH
let linkMap = new Map();
let fixedtable, dfixedtable, jqfixedtable;
let fixedthead, fixedtbody, fixedtfoot;
let fixedfooter_row;
let linktype;

let jason;
let SHEETS, MAINSHEET, LINKSHEET;
let MAINSHEET_keys = [], LINKSHEET_keys = []
let LINKSHEET_types = new Set();

//const delims = /([:\r\n]+)|((?<!\s)\()/g ///([:+\r\n]+)|((?<!\s)\()/g //BREAKS SAFARI!!!!!!!!
const delims = /([:\r\n]+)/g
const nospacebrack = /((?<=[^\s\\])\()/g
const charBeforeBrack = /[^\s\\](?=\()/g


document.addEventListener('DOMContentLoaded', function () {

    //HEADING
    const heading = document.createElement("h1");
    const heading_a = document.createElement("a");
    try { heading_a.innerText = headertitle; }
    catch (e) { heading_a.innerText = datafile; }
    try { linktype = typeheader; }
    catch (e) { linktype = ""; }
    heading_a.setAttribute("href", "");
    heading_a.setAttribute("class", "heading");
    heading.append(heading_a);
    document.getElementById("heading").append(heading);
    //FILE UPDATED
    lastUpdated(datafile, "activity");

    fixedtable = document.getElementById("fixedtable");
    jqfixedtable = $(fixedtable);
    fixedthead = fixedtable.appendChild(document.createElement("thead"));
    fixedtbody = fixedtable.appendChild(document.createElement("tbody"));
    fixedtfoot = fixedtable.appendChild(document.createElement("tfoot"));

    fetch(datafile)
        .then(res => res.json())
        .then(json => {
            jason = json;

            //PROCESS JSON
            //1. identify important nodes
            SHEETS = Object.keys(jason);
            MAINSHEET = SHEETS[0];
            LINKSHEET = SHEETS.find(e => e.startsWith("+"));
            MAINSHEET_keys = Object.keys(jason[MAINSHEET][0]);
            if (LINKSHEET) LINKSHEET_keys = Object.keys(jason[LINKSHEET][0]);
            else LINKSHEET_keys = [];

            //CREATE NAVIGATION FOOTER
            navfooter = createNavFooter(SHEETS);
            fixedfooter_row = document.createElement("tr");
            fixedfooter_row.setAttribute('id', "fixedfooterrow");
            const th = document.createElement("th");
            th.setAttribute('id', "LOOKAHERE");
            th.append(navfooter);
            fixedfooter_row.append(th);
            fixedtfoot.append(fixedfooter_row);

            //detect '#...' in url to choose initial sheet
            const url = window.location.href.substr(window.location.href.indexOf("#") + 1);
            if (window.location.href.indexOf("#") > 0) dfixedtable = makeDataTable(fixedtable, jason[url], url);
            else dfixedtable = makeDataTable(fixedtable, jason[MAINSHEET], MAINSHEET);
        })
});

function makeDataTable(table, jsondata, sheet) {

    const maintableKeys = Object.keys(jsondata[0]);
    //OPTIONAL: remove rows with empty 1st column
    jsondata = jsondata.filter(x => x[maintableKeys[0]] != null);

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
    // try { jason[linktable].forEach(x => linktable_types.add(x[typeheader])); }
    // catch (e) { console.log("no typeheader"); }
    if (linktype) jason[linktable].forEach(x => linktable_types.add(x[linktype]));
    linktable_types.delete(null);
    linktable_types.delete(undefined);
    linktable_types.delete("");
    //if (linktable_types.size == 0) linktable_types.add(linktable);

    //LOG    
    console.log("create new DataTable from table#id = '" + table.getAttribute("id") + "'");
    //console.log(linktable_types);
    //console.log(table.getAttribute("id").substr(0, table.getAttribute("id").indexOf(":")));
    const parenttable = table.getAttribute("id").substr(0, table.getAttribute("id").indexOf(":"));

    //2. create Map() of mainsheet<->linksheet
    const linkKeyIdx = maintableKeys.indexOf("LINKIDXS");
    if (linkKeyIdx > -1) maintableKeys.splice(linkKeyIdx, 1);
    else if (parenttable != linktable) {
        if (maintable == LINKSHEET) {
            const linktableMap = new Map();
            jason[MAINSHEET].forEach(function (MAINel, idx, arr) {
                linktableMap.set(MAINel[MAINSHEET_keys[0]], idx);
            });
            //console.log(linktableMap);
            jsondata.forEach(function (LINKel, LINKidx, LINKarr) {
                if (LINKel[MAINSHEET]) {
                    LINKel[MAINSHEET].split("\n").forEach(function (MAINid) {
                        const MAINid_trim = MAINid.trim(); //POEH! Google Sheet can have hidden &#xD;
                        //!!! MAYBE ALSO MAKE UPPERCASE? f.e. Return to Forever vs. Return To Forever ...
                        if (linktableMap.has(MAINid_trim)) {
                            const MAINidx = linktableMap.get(MAINid_trim);
                            if (linktable_types.size > 0) {
                                let MAINType = jason[MAINSHEET][MAINidx][linktype];//mainEl[typeheader];
                                if (MAINType == null || MAINType == '') MAINType = linktable;
                                if (LINKarr[LINKidx]["LINKIDXS"]) {
                                    if (LINKarr[LINKidx]["LINKIDXS"][MAINType]) LINKarr[LINKidx]["LINKIDXS"][MAINType].push(MAINidx);
                                    else {
                                        const obj = LINKarr[LINKidx]["LINKIDXS"];
                                        obj[MAINType] = [MAINidx];
                                        LINKarr[LINKidx]["LINKIDXS"] = obj;
                                    }
                                }
                                else {
                                    const obj = {};
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
                            console.log("unknown " + MAINSHEET + " id " + MAINid_trim);
                        }
                    });
                }
            });
            //console.log(jsondata);
        }
        else {
            //first create index from mainsheet
            const linktableMap = new Map();
            jsondata.forEach(function (mainEl, idx, arr) {
                linktableMap.set(mainEl[maintableKeys[0]], idx);
            });
            //then loop through linkedsheet ONCE, and add info into above Map
            if (LINKSHEET) {
                jason[linktable].forEach(function (linkEl, linkIdx, linkArr) {
                    if (linkEl[maintable]) {
                        let linkElArr;
                        if (Array.isArray(linkEl[maintable])) {
                            if (linkEl[maintable].length > 0) linkElArr = linkEl[maintable];
                        }
                        else linkElArr = linkEl[maintable].split("\n");
                        if (linkElArr) {
                            linkElArr.forEach(function (linkid) { //ERRORS when id column contains delimiter (; for example) => exports as Array instead of string
                                const linkid_trim = linkid.toString().trim(); //POEH! Google Sheet can have hidden &#xD;
                                //!!! MAYBE ALSO MAKE UPPERCASE? f.e. Return to Forever vs. Return To Forever ...
                                if (linktableMap.has(linkid_trim)) {
                                    const mainIdx = linktableMap.get(linkid_trim);
                                    if (linktable_types.size > 0) {
                                        let linkType = linkEl[linktype];
                                        if (linkType == null || linkType == '') linkType = linktable;
                                        if (jsondata[mainIdx]["LINKIDXS"]) {
                                            if (jsondata[mainIdx]["LINKIDXS"][linkType]) jsondata[mainIdx]["LINKIDXS"][linkType].push(linkIdx);
                                            else {
                                                const obj = jsondata[mainIdx]["LINKIDXS"];
                                                obj[linkType] = [linkIdx];
                                                jsondata[mainIdx]["LINKIDXS"] = obj;
                                            }
                                        }
                                        else {
                                            const obj = {};
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
                                    console.log("unknown " + maintable + " id in " + linktable + ": " + linkid_trim);
                                }
                            });
                        }
                    }
                });
            }
        }
    }
    //console.log(linktableMap);
    //console.log(jsondata);

    //prepare HTML
    const header_row = document.createElement("tr");
    table.getElementsByTagName("thead")[0].append(header_row);
    const footer_row = document.createElement("tr");
    table.getElementsByTagName("tfoot")[0].prepend(footer_row);
    if (maintable != LINKSHEET) table.classList.add('rowheaders');
    else table.classList.remove('rowheaders');

    //FORMAT JSON DATA for use in DataTables
    let startIndex = 0, visIndex = 0;

    //1stcolumn: (+)(-) buttons
    const DTcolumn = {
        "width": '20px',
        "className": 'IDcolumn',
        "orderable": true,
        "defaultContent": '',
        "data": maintableKeys[0],
        "render": function (data, type, rowData, meta) {
            if (type === 'display') return null
            else return data
        },
        // "render": {
        //     "order": data,
        //     "display": null
        // },
        "createdCell": function (cell, cellData, rowData, rowIndex, colIndex) {
            //title attribute
            //cell.setAttribute("title", cellData);

            //balloon.css
            if (maintable != LINKSHEET) {
                //let tipdiv = document.createElement('div');
                cell.classList.add('tipdiv');
                cell.setAttribute('data-balloon-visible', true);
                cell.setAttribute('aria-label', cellData);
                cell.setAttribute('data-balloon-pos', 'up-left');
                //cell.appendChild(tipdiv);
            }

            if (rowData["LINKIDXS"]) cell.classList.add('details-control');
            else {
                let i = 0;
                const len = childrowsHeaders.length;
                while (i < len) {
                    if (rowData[childrowsHeaders[i]]) {
                        cell.classList.add('details-control');
                        break;
                    }
                    i++;
                }
            }
        },
        "cellIndex": startIndex
    }
    header_row.prepend(document.createElement("th"));
    columns.push(DTcolumn)
    visIndex += 1;
    startIndex += 1;

    //EXTRA: linkcolumn
    if (linktable) {
        let DTcolumn = {
            "title": linktable,
            "className": 'linkcolumn',
            // "orderable": false,
            "defaultContent": '',
            "data": "LINKIDXS",
            "render": function (data, type, rowData, meta) {
                return data?.length
            },
            "cellIndex": startIndex
        };
        if (linktable_types.size > 0) {
            DTcolumn.render = function (data, type, rowData, meta) {
                let innerhtml = "";
                if (data) {
                    const props = Object.getOwnPropertyNames(data);
                    const propslength = props.length;
                    for (let i = 0; i < propslength; i++) {
                        innerhtml += '<div class="nowrap typeicon ' + props[i] + '" title="' + props[i] + '"> ' + props[i] + ':<span class="cssnumbers">' + data[props[i]].length + '</span></div > ';
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
    startIndex = startIndex - keyIdx;
    //maintableKeys.forEach(function (key, keyIdx, arr) {
    while (keyIdx < maintableKeys.length) {
        //1. datatables column element
        const key = maintableKeys[keyIdx].replace(/\./g, '\\\\.');
        //BASIC TEMPLATE
        let DTcolumn = {
            //"title": el,
            "data": key,
            "defaultContent": ''
        };
        //create <span> only in columns which have separte sheet
        if (SHEETS.includes(key)) {
            //createdCell
            DTcolumn.createdCell = function (td, cellData, rowData, rowIndex, colIndex) {
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
            if (Array.isArray(jsondata[0][key])) {
                DTcolumn.render = function (data, type, row, meta) {
                    let result = "";
                    let i = 0, len = data.length;
                    //SPLIT UP MORE? ":" and "\n" and brackets without space...
                    while (i < len) {
                        result += '<span class="linktip">' + data[i] + '</span>' + "; ";
                        i++;
                    }
                    return result.substr(0, result.length - 2)
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
        if (key == linktype) {
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

    // if (maintable == LINKSHEET) {
    //     let element = columns[startIndex-1];
    //     console.log(element);
    //     columns.splice(startIndex-1, 1);
    //     columns.splice(startIndex + LINKSHEET_keys.indexOf(MAINSHEET), 0, element);
    // }

    let fixedHeader, dom, order;
    if (maintable == LINKSHEET) order = [[startIndex + LINKSHEET_keys.indexOf(MAINSHEET), 'asc']];
    else order = [[0, 'asc']];//[[startIndex + 1, 'asc']];

    //set some DT options
    if (table.getAttribute("id") == "fixedtable") {
        fixedHeader = {
            header: true,
            footer: true
        };
        dom = "lfrti";
        // const headerfilters_row = header_row.cloneNode(true);
        // headerfilters_row.setAttribute("class", "columnfilters");
        // table.getElementsByTagName("thead")[0].append(headerfilters_row);
        // document.getElementById("LOOKAHERE").setAttribute("colspan", columns.length);
    }
    else {
        fixedHeader = false;
        dom = "lfti";
    }

    //console.log(columns);
    //if (visIndex > 8) fixedtable.classList.add("compact");

    //DATATABLE    
    const dTable = $(table).DataTable({
        "data": jsondata,
        "processing": true, //only works with Ajax?
        "fixedHeader": fixedHeader,
        "deferRender": true,
        "dom": dom,
        "paging": false,
        "autoWidth": false,
        "order": order,
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

            //oor make formatting function based on 1st row, see how many mergers there are, where they should go and do for each row
            mergecolumns.forEach(function (mergecolumn, i) {
                const catdata = data[mergecolumn.cat];
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
            $(table).show(); //do here, otherwise dropdown <input> aren't generated...
            $('div#dt_loader').hide();

            //FIXED TOOLTIPS on ID column
            //create tooltips
            //createTooltips(table);

            if (table.getAttribute("id") == "fixedtable") {
                const headerfilters_row = header_row.cloneNode(true);
                headerfilters_row.setAttribute("class", "columnfilters");
                table.getElementsByTagName("thead")[0].append(headerfilters_row);
                document.getElementById("LOOKAHERE").setAttribute("colspan", columns.length);
                
                //COLUMN FILTERS
                this.api().columns(':visible').every(function () {
                    const column = this;
                    const jqth = column.header();
                    const jqthisfilter = $(table).find('thead > tr.columnfilters > th').eq(column.index('visible'));

                    jqthisfilter.empty(); //empty cell
                    while (jqthisfilter.get(0).attributes.length > 0) //remove attributes
                        jqthisfilter.get(0).removeAttribute(jqthisfilter.get(0).attributes[0].name);
                        
                    if (jqth.classList.contains("IDcolumn")) {
                        //$("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                    }
                    else if (jqth.classList.contains("linkcolumn")) {
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
                        let ARRstring1delim = ARR.join(delimiter).replace(delims, delimiter);
                        //ARRstring1delim = ARRstring1delim.replace(nospacebrack, delimiter + "("); //uses lookbehind
                        ARRstring1delim = ARRstring1delim.replace(nospacebrack, delimiter + "$&"); //no lookbehind, just include matched character again                     
                        ARR = ARRstring1delim.split(delimiter);
                        let SET = new Set();
                        const ARRlen = ARR.length;
                        //console.log(jqth.innerText + ": " + ARRlen); //up to 40.000 musicians!
                        for (let i = 0; i < ARRlen; i++) {
                            SET.add(ARR[i].trim()); //exclude items that start with "(" ??
                        }
                        // ARR.forEach((o, i, a) => {
                        //     SET.add(a[i].trim()); //exclude items that start with "(" ??
                        //     //if (trima[trima.length-1] != ")") ;
                        // });
                        ARR = [...SET].sort(); //or use map, which is automatically sorted?
                        //* ONLY WHEN DATA IS NOT FULLY SPLIT inside json *//

                        //OPTION 1: HTML5 datalists
                        let datalist = $('<datalist id="' + jqth.innerText + '-list"></datalist>').insertAfter($(input));
                        ARR.forEach(function (val) {
                            datalist.append('<option value="' + val + '" />')
                        });
                    }
                });
            }
        }
    });



    $(table).children('tbody').on('click', '> tr > td.details-control', function () {

        const jqtr = $(this).closest('tr');
        const rowid = jqtr.attr("id");
        const dRow = dTable.row(jqtr);
        console.log(" (+)-->CLICK : '" + maintable + "' / linktable: '" + linktable + "' / id: '" + jqtr.attr("id") + "'");

        if (dRow.child.isShown()) {
            // This row is already open - close it
            dRow.child.hide();
            jqtr.removeClass('shown');
        }
        else {
            // Open this row
            const childrowsDOM = [];
            let linkTableDOM = "", detailsTableDOM = "";
            const linkcellData = dTable.cells(dRow, ".linkcolumn").data()[0];
            //CE_ elems
            let detailsTable = "";
            const childcells = dTable.cells(dRow, ".childrow");//, idx);
            //console.log(childcells.data());
            for (let i = 0; i < childcells.data().length; i++) {
                if (childcells.data()[i]) detailsTable += formatChildRows(childrowsHeaders[i], childcells.data()[i]);
            }
            if (detailsTable != "") {
                detailsTable = '<table class="detailstable cell-border">' + detailsTable + '</table>';
                detailsTableDOM = document.createElement('div');
                detailsTableDOM.innerHTML = detailsTable;
                childrowsDOM.push(detailsTableDOM);
            }
            //link elems
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
                linkTableDOM.setAttribute("id", rowid + "." + linktable);
                linkTableDOM.setAttribute("class", "linktable cell-border"); //compact
                linkTableDOM.innerHTML = '<thead></thead>' +
                    '<tbody></tbody>' +
                    '<tfoot></tfoot>';
                childrowsDOM.push(linkTableDOM);
            }
            dRow.child(childrowsDOM, "child").show();
            // [jqtr.next('tr.child'), jqtr.next('tr.child').next('tr.child')].forEach(childtr => {
            //     childtr.children('td').attr("colspan", (i, val) => val--);
            //     childtr[0].prepend(document.createElement("td"));
            // });

            if (linkcellData) makeDataTable(document.getElementById(rowid + "." + linktable), linkedItems, linktable);
            jqtr.addClass('shown');
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
    sheets.forEach(function (sheet) {
        if (sheet == LINKSHEET || MAINSHEET_keys.includes(sheet) || LINKSHEET_keys.includes(sheet)) {
            const tab_li = document.createElement("li");
            tab_li.setAttribute("class", "menu tab");
            tabs_ul.append(tab_li);
            const tab_a = document.createElement("a");
            tab_a.setAttribute("id", "btn-" + sheet);
            tab_a.setAttribute("class", "menu tab");
            tab_a.setAttribute("href", "#" + sheet);
            tab_a.setAttribute("sheet", sheet);
            tab_a.addEventListener('click', function () {
                $(this).addClass('active');
                $(this).siblings().removeClass('active');

                if ($.fn.dataTable.isDataTable(fixedtable)) {
                    dfixedtable.clear();
                    dfixedtable.destroy();
                }

                fixedthead.innerHTML = "";
                fixedtbody.innerHTML = "";
                fixedtfoot.querySelectorAll("tr:not(#fixedfooterrow)").forEach(tr => tr.remove());

                dfixedtable = makeDataTable(fixedtable, jason[sheet], sheet);
            }, false);
            if (sheet == MAINSHEET || sheet == LINKSHEET) tab_a.innerText = sheet;
            else if (MAINSHEET_keys.includes(sheet)) tab_a.innerText = MAINSHEET + ":" + sheet;
            else if (LINKSHEET_keys.includes(sheet)) tab_a.innerText = LINKSHEET + ":" + sheet;

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
    for (let i = 1; i < props.length; i++) {
        if (object[props[i]]) result.push($("<li style='list-style-type:none;'><span class='inlinedetails'>" + props[i] + ": </span>" + anchorme({ input: object[props[i]].toString(), options: { attributes: { target: "_blank" } } }) + "</li>"));
    }
    return result;
}