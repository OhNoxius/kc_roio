function makeDataTable(tableid) {
    let dTable;
    if (typeof isDatabase == 'undefined') isDatabase = false;
    if (!$.fn.dataTable.isDataTable('table#' + tableid)) {

        //Format all the hyperlinks in <td> elements FIRST!so that column width is accordingly
        let cellval, secondslash, thirdslash, shortURL;
        // OPTION 1
        // $('table#' + tableid + ' td:contains("http"), table#' + tableid + ' td:contains("www")').html(function () {
        //     cellval = $(this).text(); //MOET ENKEL TEKST TOT EINDE LIJN ZIJN
        //     secondslash = cellval.indexOf('/', cellval.indexOf('/') + 1);
        //     thirdslash = cellval.indexOf('/', secondslash + 1);
        //     if (cellval.slice(secondslash + 1, secondslash + 4) == 'www') shortURL = cellval.slice(secondslash + 5, thirdslash);
        //     else shortURL = cellval.slice(secondslash + 1, thirdslash);
        //     return "<a title='" + cellval + "' class='tableLink' href='" + $(this).text() + "' target='_blank'>" + shortURL + "</a>"
        // });

        // OPTION2: SLIM ALTERNATIEF, mr voorlopig nog volledig url weergave, en $ teken loopt mis
        $('table#' + tableid + ' td:contains("http"), table#' + tableid + ' td:contains("www")').html(function () {
            let content = $(this).text();
            let exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig; //find https?
            let element_content = content.replace(exp_match, "<a class='url' target='_blank' title='$1' href='$1'>$1</a>");
            let new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim; //find www?
            let new_content = element_content.replace(new_exp_match, '$1<a class="url" title="http://$2" target="_blank" href="http://$2">$2</a>');
            return new_content;
        });

        //search QUESTION MARKS       
        $('table#' + tableid + ' tbody tr td').filter(function () {
            return this.textContent.startsWith('?')
        }).html(function () {
            cellval = $(this).text(); //MOET ENKEL TEKST TOT EINDE LIJN ZIJN
            return "<span class='doubt' title='?'>" + cellval.slice(1, cellval.length) + "</span>"
        });

        var getTooltip = function (sheetArg, idArg) {
            return new Promise(function (resolve) {
                transform(xml, xslTooltip, { sheet: sheetArg, id: idArg }).then(function (response) {
                    resolve(response);
                })
            }, function (error) {
                reject(Error(error));
            });
        }

        $(function () {
            $(document).tooltip({
                items: ".tooltip",
                // content: async function () {
                //     var result = await getTooltip($(this).attr('sheet'), $(this).attr('title'));
                //     return result;
                // }
                content: function () {
                    if (this.textContent) {
                        let sheet = this.getAttribute("sheet").replace(/[^a-z_]/gi, "_");
                        let value = this.textContent.replace(/[^a-z_]/gi, "_");
                        let query = xml.querySelector(sheet + " " + value);
                        if (query) {
                            let result = Array.from(query.attributes, function({ name, value }) { 
                                if (value && name != 'id') return ("<li style='list-style-type:none;'>"+ [name] + ":<span class='inline description'>" + value + "</span></li>")
                            });
                            return result;
                        }
                    }
                }
                // content: transform(xml, xslTooltip, { sheet: $(this).attr('sheet'), id: $(this).attr('title') }).then(function(result) {
                //     return result;
                // })
            });
        });

        // $(function () {
        //     $(document).tooltip({
        //         items: "[title]",
        //         content: function () {
        //             let element = $(this);
        //             let attr = $(this).attr('title');
        //             if (element.is("[data-geo]")) {
        //                 let text = element.text();
        //                 return "<img class='map' alt='" + text +
        //                     "' src='http://maps.google.com/maps/api/staticmap?" +
        //                     "zoom=11&size=350x350&maptype=terrain&sensor=false&center=" +
        //                     text + "'>";
        //             }
        //             if (typeof attr === typeof undefined || attr === false) {                        
        //                 return "AWESOME";
        //             }
        //             else { 
        //                 return element.attr("title");
        //             }
        //         }
        //     });
        // });

        let noVis = [];
        $('table#' + tableid + ' th.noVis').each(function () { noVis.push($(this).index()); });
        let orderColumns;
        if (noVis.length) orderColumns = [[1, 'asc']];
        else orderColumns = [[0, 'asc']];

        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let scrollY = vh - 50 - 36 - 21 - 16; //100% viewheight - heading - tableheader - searchbar  - footer
        let tabledom = "ftir";

        if (isDatabase) {

            scrollY = scrollY - 50 + 20 - ((linkedSheetType.length - 2) * 19); // - 2nd header + no search filter
            tabledom = "tirf";
            document.querySelector("header").style.background = "linear-gradient(0deg, lightblue, transparent)";
            if ($('table.mainsheet th.linkedinfo').index() > 0) orderColumns[0][0] += 1;
        }

        //INITIALIZE DATATABLE:
        //---------------------
        dTable = $('table#' + tableid).DataTable({
            // responsive: true,
            "autoWidth": false,
            "dom": tabledom,
            "orderClasses": false,
            "processing": true,
            "orderCellsTop": true,
            "autoWidth": true,
            "scrollY": scrollY,
            "scrollCollapse": true,
            "paging": false,
            "ordering": true,
            "order-column": true,
            "order": orderColumns, //[[0, 'asc'], [1, 'asc']],
            // "fixedColumns": true,
            /* "dom": '<"top"i>ft', */
            "createdRow": function (row, data, dataIndex) {
                if (!isDatabase) {
                    let hasDetails = false;
                    for (let i = 0; i < noVis.length; i++) {
                        if (data[noVis[i]]) {
                            //$(row).addClass('important');
                            //console.log(row.querySelector("td.details"));
                            //console.log(data[noVis1]);
                            hasDetails = true;
                            break;
                        }
                    }
                    if (hasDetails) $(row).find("td.details").addClass('details-control');
                }
            },
            "columnDefs": [{
                "targets": 'details',
                "orderable": false,
                "data": null,
                "defaultContent": '',
            },
            {
                "targets": 'details-control',
                // "createdCell": function (td, cellData, rowData, rowIndex, colIndex) {
                //     if (true) {
                //         //console.log(rowData);
                //         //$(td).addClass('details-control');
                //     }
                // },
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '',
                //"width": '1px' //padding + icon width... doet niks?
            },
            {
                "targets": 'titlecolumn',
                "className": 'titlecolumn'
            },
            {
                "targets": 'noVis',
                "visible": false
            },
            {
                "targets": 'date',
                "className": 'date',
                "width": "calc(20px + 10ex)",
                //"type": "date" //dit zorgt ervoor dat onvolledige data (-00-00) niet juist gesorteerd worden??
            },
            {
                "targets": 'collection',
                "data": 'collection'
            },
            {
                "targets": 'urlCol',
                "className": 'urlCol',
                // "type": 'html',
                // "width": "20",
                // "render": function ( data, type, row ) {
                //     return ;
                // }
                // "render": function (data, type, row, meta) {
                //     let celltext = $(data).text();
                //     //return '<a href="'+data+'">' + table.column(meta.col).header() + '</a>'; //werkt niet? zou column header moeten weergeven
                //     return (data ? '<a class="tableLink" title="' + celltext + '" href="' + celltext + '">' + celltext.substr(0, 20) + 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww</a>' : '<a href="' + data + '">search</a>');
                // },
                //"visible": false
            }],
            // "columns": [{
            //     "render": function ( data, type, row, meta ) {
            //         return '<a href="'+data+'">Download</a>';
            //     }
            // }],
            "language": {
                "decimal": "",
                "emptyTable": "",
                "info": "_TOTAL_ results",
                "infoEmpty": "",
                "infoFiltered": "(filtered from _MAX_ results)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Show _MENU_ entries",
                "loadingRecords": "Initializing...",
                "processing": '<div class="spinner"></div>',
                "search": tableid + ":",
                /* "search": "Filter " + tableid + ":", */
                "zeroRecords": "Nothing found...",
                "paginate": {
                    "first": "First",
                    "last": "Last",
                    "next": "Next",
                    "previous": "Previous"
                },
                "aria": {
                    "sortAscending": ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                }
            },
            "initComplete": function () {
                if (isDatabase) {
                    //$('table#' + tableid + ' thead tr').clone(true).appendTo('#' + tableid + ' thead' );
                    this.api().columns().every(function () {
                        let column = this;
                        let th = column.header();
                        //let headerText = th.innerText;
                        //if (sheetNames.includes(column.header().innerText)) {
                        if (th.classList.contains("details-control")) {
                            $("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                        }
                        else if (th.classList.contains("linkedinfo")) {
                            $("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty();
                            linkedSheetType.forEach(function (value, index, array) {
                                $('<div class="nowrap"><input type="checkbox" id="' + th.innerText + value + '" name="' + th.innerText + '" value="' + value + '" class="headercheckbox" />' +
                                    '<label for="' + th.innerText + value + '">' + value + '</label></div>')
                                    .appendTo($("table.mainsheet thead tr:eq(1) th").eq(column.index()));
                            });
                            $('input:checkbox').on('change', function (e) {
                                //build a regex filter string with an or(|) condition
                                let checkboxes = $('input:checkbox:checked').map(function () {
                                    return this.value;
                                }).get().join('|');
                                //filter in column 1, with an regex, no smart filtering, not case sensitive
                                column.search(checkboxes, true, false, false).draw(false);
                            });
                        }
                        else if (th.classList.contains("date")) {
                            $('<input type="search" id="' + th.innerText + '" name="' + th.innerText + '" class="headersearch" />')
                                .appendTo($("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty())
                                .on('input', function () {
                                    if (column.search() !== this.value) {
                                        column
                                            .search(this.value)
                                            .draw();
                                    }
                                });
                        }
                        else {
                            let input = $('<input type="search" list="' + th.innerText + '-list" id="' + th.innerText + '-input" name="' + th.innerText + '" class="headersearch" />'
                            )//+ '<datalist id="' + th.innerText + '-list"></datalist>')
                                //.appendTo($(column.footer()).empty())
                                .appendTo($("table.mainsheet thead tr:eq(1) th").eq(column.index()).empty())
                                .on('change search', function () {
                                    if (column.search() !== this.value) {
                                        column
                                            .search(this.value)
                                            .draw('page');
                                    }
                                });

                            //let datalist = $('<datalist id="' + headerText + '-list"></datalist>').appendTo("table.mainsheet thead tr:eq(1) th").eq(column.index());

                            let ARR = column.data().unique().toArray();
                            ARR = ARR.join(delimiter).split(delimiter);
                            ARR.forEach((o, i, a) => a[i] = a[i].trim());
                            let SET = new Set(ARR);
                            ARR = [...SET].sort();
                            //column.data().unique().sort().each(function (d, j) {
                            // ARR.forEach(function (val) {
                            //     datalist.append('<option value="' + val + '" />')
                            // });
                            $(function () {
                                //var ARR = [...SET].sort();
                                $(input).autocomplete({
                                    source: ARR,
                                    select: function (event, ui) {
                                        if (column.search() !== ui.item.value) {
                                            column
                                                .search(ui.item.value)
                                                .draw('page');
                                        }
                                    }
                                });
                            });
                        }
                        //}
                    });
                }
            }
        });

        // dTable.processing(true);

        // setTimeout(function () {
        //     dTable.processing(false);
        // }, 2000);

        // $(document).on("processing.dt", function (e, settings, processing) {
        //     if (processing) {
        //         $.blockUI(
        //             {
        //                 message: "Please Wait..!",
        //             });
        //     } else {
        //         $.unblockUI();
        //     }
        // });

        $(document).on("processing.dt", function (e, settings, processing) {
            if (processing) {
                console.log("event trigger: processing true");
                // dTable.processing(true);
                // setTimeout(function () {
                //     dTable.processing(false);
                // }, 2000);
            }
            else {
                console.log("event trigger: processing false");
                //dTable.processing(false);
            }
        });

        /////NEW: link +sheet as a dropdown////////////

        //Add event listener for opening and closing details
        $('table#' + tableid + ' tbody').on('click', 'td.details-control', function () {
            let tr = $(this).closest('tr');
            let row = dTable.row(tr);

            //select data (columns) that are hidden
            cells = dTable.cells(row, '.noVis');
            idx = dTable.cell(row, '.noVis').index().column;

            //format that data into a new table
            let title = "", details = "", detailsTable = "";
            for (let i = 0; i < cells.data().length; i++) {
                title = row.column(idx + i).header();
                if (cells.data()[i]) details = details + format($(title).html(), cells.data()[i]);
            }
            if (detailsTable != "") detailsTable = '<table class="detailsTable">' + details + '</table>';

            let childDiv = document.createElement('div');
            childDiv.classList.add("childdiv");
            let childFragment = new DocumentFragment;

            let domParser = new DOMParser();
            let detailsString = [
                '<table class="detailInfo">', details, '</table>'
            ].join('\n');
            let detailsDOM = domParser.parseFromString(detailsString, 'text/html');

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                // Open this row
                tr.addClass('shown');
                if (!tr.hasClass('loaded')) {
                    if (isDatabase) {
                        transform(xml, xslTable, { id: tr.attr("id") }).then(function (linkedsheet) {
                            tr.addClass('loaded');

                            childFragment.appendChild(detailsDOM.querySelector("table.detailInfo"));
                            childFragment.appendChild(linkedsheet);
                            childDiv.appendChild(childFragment);

                            //linkedsheet.appendChild(detailsDOM.querySelector("table.detailInfo"));
                            row.child(childDiv, 'child').show();

                            makeDataTable(tr.next('tr').find('table.linkedsheet').attr("id"));
                        }, function (error) {
                            console.error("transform(xslTable) transform error!", error);
                        })
                    }
                    else {
                        childFragment.appendChild(detailsDOM.querySelector("table.detailInfo"));
                        childDiv.appendChild(childFragment);
                        row.child(childDiv, 'child').show();
                    }
                }
                else {
                    row.child.show(); //data is already present, just show it
                }
            }
        });

    }
    return dTable.data().any();
}

function format(h, d) {
    // `d` is the original data object for the row
    return '<tr class="detailsRow">' +
        '<td class="detailsHeader">' + h + ':</td>' +
        '<td>' + d + '</td>' +
        '</tr>'
}

jQuery.fn.dataTable.Api.register('processing()', function (show) {
    return this.iterator('table', function (ctx) {
        ctx.oApi._fnProcessingDisplay(ctx, show);
    });
});