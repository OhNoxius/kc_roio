function databaseKeys(database) {
    let sheetNames, attrs;
    let keyNames = [], keyValues = [];


    let linkedsheetName, linkedsheetNode;
    let mainsheetName;

    attrs = database.firstElementChild.firstElementChild.firstElementChild.attributes;

    let sheets = Array.from(database.firstElementChild.children);
    let mainsheetNodes = Array.from(database.firstElementChild.firstElementChild.children);
    sheetNames = sheets.map(x => x.tagName);
    mainsheetName = sheetNames[0]
    linkedsheetName = sheetNames.find((el) => el.startsWith("_"));
    //console.log(sheetNames);
    let attrName, dropdown;
    for (let i = attrs.length - 1; i >= 0; i--) {
        //console.log(attrs[i].name);
        attrName = attrs[i].name;
        if (sheetNames.includes(attrName)) {
            //console.log(attrs[i].name);
            keyNames.push(attrName);
            //database.firstElementChild.firstElementChild.firstElementChild.getAttribute("class")
            keyValues = mainsheetNodes.map(x => x.getAttribute(attrName))
            keys[attrName] = [...new Set(keyValues)];
        }
        //output += attrs[i].name + "->" + attrs[i].value;
    }

    //1. create linkMap with all mainsheet nodes
    mainsheetNode = database.getElementsByTagName(mainsheetName)[0];
    mainsheetNode.childNodes.forEach(function (node) {
        let linkItem = new Map();
        //linkItem.set(node.getAttribute("type"), 1);
        linkMap.set(node.getAttribute("id"), linkItem);
    })

    //2. link linkedsheet nodes to mainsheet nodes in linkMap
    linkedsheetNode = database.getElementsByTagName(linkedsheetName)[0];
    //console.log(linkedsheetNode);
    //let linkids = new Set();
    //let linkMap = new Map();
    //let linkedsheetTypes = new Set();
    //linkedsheetNode.querySelectorAll(':not([' + mainsheetName + '=""])').forEach(function (node) {
    let linkidCell;
    linkedsheetNode.querySelectorAll('[' + mainsheetName + ']').forEach(function (node) {
        // Do whatever you want with the node object.
        //if (node.attributes[0]) allElements.set(node.attributes[0].value, node);
        //console.log(node);
        linkidCell = node.getAttribute(mainsheetName);
        // if (linkidCell.indexOf("\n") != -1) {
        //     console.log(linkidCell);
        // }
        if (linkidCell != "") {
            linkidCell.split("\n").forEach(function (linkid) {
                linkid = linkid.trim(); //POEH! Google Sheet can have hidden &#xD;
                //!!! MAYBE ALSO MAKE UPPERCASE? f.e. Return to Forever vs. Return To Forever ...
                if (linkMap.has(linkid)) {
                    let linkItem = linkMap.get(linkid);
                    if (linkItem.has(node.getAttribute("type"))) {
                        let linkItemThisType = linkItem.get(node.getAttribute("type"));
                        linkItem.set(node.getAttribute("type"), linkItemThisType + 1);
                        linkMap.set(linkid, linkItem);
                        //linkItemTypeMap.set(node.getAttribute("type"), linkItemTypeMap.get(node.getAttribute("type")) + 1);
                    }
                    else {
                        linkItem.set(node.getAttribute("type"), 1);
                        linkMap.set(linkid, linkItem);
                    }
                }
                else {
                    // let linkItem = new Map();
                    // linkItem.set(node.getAttribute("type"), 1);
                    // linkMap.set(linkid, linkItem);
                    console.log("unknown id " + linkid);
                }
            });
        }
        // let linkidTypes = new Map();
        // linkidTypes.set(node.getAttribute("type"),)
        // linkids.add(node.getAttribute(mainsheetName));
        // linkMap.set(node.getAttribute(mainsheetName), linkidTypes);
        if (node.getAttribute("type")) linkedsheetTypes.add(node.getAttribute("type").replace("?", ""));
    });
    //console.log(linkedsheetNode.querySelectorAll('[' + mainsheetName + ']')[100].);
    //console.log(linkids);
    //console.log(linkedsheetTypes);
    //console.log(linkMap);

    // //LINKEDSHEET type
    // let getType;
    // for (let i = sheetNames.length - 1; i >= 0; i--) {
    //     if (sheetNames[i] = linkedsheetName) {
    //         for (let t = sheets[i].childElementCount - 1; t >= 0; t--) {
    //             getType = sheets[i].children[t].getAttribute("type");
    //             if (getType.startsWith("?")) getType = getType.substr(1);
    //             linkedSheetType.push(getType);
    //         }
    //         break;
    //     }
    // }
    // let linkedSheetSet = new Set(linkedSheetType);
    // linkedSheetSet.delete("");
    // linkedSheetType = [...linkedSheetSet];

    // linkedSheetType.forEach(function(e){
    // 	let type = document.createElement('type');
    // 	type.textContent = e;
    // 	typesDOM.appendChild(type);
    // })
}