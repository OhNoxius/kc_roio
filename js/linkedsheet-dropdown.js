function linkSheet(table, tableid) {
    $('table#' + tableid + ' tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            if (!tr.hasClass('loaded')) {
                //document.querySelector("div#dummy").textContent = '';
                transformRE(xml, xslTable, { id: tr.attr("id") }).then(function (linkedsheet) {
                    //console.log({linkedsheet});                    
                    //sessions = document.querySelector("div#dummy").innerHTML;
                    tr.addClass('loaded');
                    row.child(linkedsheet, 'child').show();
                    makeDataTable(tr.next('tr').find('table.linkedsheet').attr("id"));
                }, function (error) {
                    console.error("transformRE (xslTable) transform error!", error);
                })
            }
            else row.child.show();

            tr.addClass('shown');
        }
    });
}

function tooltip(sheet, id) {
    alert("TIP");
}