function loadDoc(url, caching = true) {
    return new Promise(function (resolve) {
        var req = new XMLHttpRequest();
        if (caching) req.open("GET", url);
        else {
            console.log("GET " + url + " without caching");
            req.open("GET", url + '?_=' + new Date().getTime());
        }
        if (typeof XSLTProcessor === 'undefined') {
            try {
                req.responseType = 'msxml-document';
            }
            catch (e) { }
        }
        req.onload = function () {
            resolve(this.responseXML)
        }
        req.send();
    });
}

function transform(xmlDoc, xslDoc, xsltParams, targetElement, overwrite = true) {
    return new Promise(function (resolve) {

        if (typeof XSLTProcessor !== 'undefined') {
            var proc = new XSLTProcessor();
            proc.importStylesheet(xslDoc);

            for (var prop in xsltParams) {
                proc.setParameter(null, prop, xsltParams[prop]);
            }

            let resultFrag;            

            if (targetElement) {
                resultFrag = proc.transformToFragment(xmlDoc, targetElement.ownerDocument);
                if (overwrite) targetElement.textContent = '';
                targetElement.appendChild(resultFrag);
                resolve("transformed xml appended");
            }
            else {
                resultFrag = proc.transformToFragment(xmlDoc, document);
                resolve(resultFrag); //Waarom geeft dit niet het getransformeerde element terug?
            }
        }
        else {
            var template = new ActiveXObject('Msxml2.XslTemplate.6.0');
            template.stylesheet = xslDoc;
            var proc = template.createProcessor();

            for (var prop in xsltParams) {
                proc.addParameter(prop, xsltParams[prop]);
            }

            proc.input = xmlDoc;

            proc.transform();

            var resultHTML = proc.output;

            targetElement.innerHTML = resultHTML;
            resolve(resultHTML);
        }
    }, function (error) {
        reject(Error("XSLT gefaald, omdat de xml en xslt bestanden niet opgehaald kunnen worden"));
    });
}

// function loadDoc(url) {
//     return new Promise(function (resolve) {
//         var req = new XMLHttpRequest();
//         req.open("GET", url);
//         if (typeof XSLTProcessor === 'undefined') {
//             try {
//                 req.responseType = 'msxml-document';
//             }
//             catch (e) { }
//         }
//         req.onload = function () {
//             resolve(this.responseXML)
//         }
//         req.send();
//     });
// }

// function transform(xmlUrl, xslUrl, xsltParams, targetElement) {
//     return new Promise(function (resolve) {
//         Promise.all([loadDocRE(xmlUrl), loadDocRE(xslUrl)]).then(function (data) {
//             var xmlDoc = data[0];
//             var xslDoc = data[1];

//             if (typeof XSLTProcessor !== 'undefined') {
//                 var proc = new XSLTProcessor();
//                 proc.importStylesheet(xslDoc);

//                 for (var prop in xsltParams) {
//                     proc.setParameter(null, prop, xsltParams[prop]);
//                 }

//                 var resultFrag = proc.transformToFragment(xmlDoc, targetElement.ownerDocument);

//                 //targetElement.textContent = ''; //waarom moet dit?
//                 targetElement.appendChild(resultFrag);
//                 resolve("transform success");
//             }
//             else {
//                 var template = new ActiveXObject('Msxml2.XslTemplate.6.0');
//                 template.stylesheet = xslDoc;
//                 var proc = template.createProcessor();

//                 for (var prop in xsltParams) {
//                     proc.addParameter(prop, xsltParams[prop]);
//                 }

//                 proc.input = xmlDoc;

//                 proc.transform();

//                 var resultHTML = proc.output;

//                 targetElement.innerHTML = resultHTML;
//                 resolve("transform success in IE?!");
//             }
//         }, function (error) {
//             reject(Error("XSLT gefaald, omdat de xml en xslt bestanden niet opgehaald kunnen worden"));
//         });
//     });
// }