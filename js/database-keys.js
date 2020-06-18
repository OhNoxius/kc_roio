function databaseKeys(datafile) {
    let database, sheetNames, attrs;    
    let keyNames = [], keyValues = [];

    loadDoc(datafile).then(function (xmlDoc) {
        database = xmlDoc;
        //let keyNames = database.querySelector("belgianjazzwiki muzikanten").children;
        attrs = database.firstElementChild.firstElementChild.firstElementChild.attributes;
        //console.log(database.firstElementChild.firstElementChild.children.);
        let sheets = Array.from(database.firstElementChild.children);
        let mainsheetNodes = Array.from(database.firstElementChild.firstElementChild.children);
        sheetNames = sheets.map(x => x.tagName);
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

        //LINKEDSHEET type
        for (let i = sheetNames.length - 1; i >= 0; i--) {
            if (sheetNames[i].charAt(0) == '_') {
                for (let t = sheets[i].childElementCount - 1; t >= 0; t--) {
                    linkedSheetType.push(sheets[i].children[t].getAttribute("type"));
                }
                break;
            }
        }
        let linkedSheetSet = new Set(linkedSheetType);
        linkedSheetSet.delete("");
        linkedSheetType = [...linkedSheetSet];

        // linkedSheetType.forEach(function(e){
		// 	let type = document.createElement('type');
		// 	type.textContent = e;
		// 	typesDOM.appendChild(type);
		// })
    });
}