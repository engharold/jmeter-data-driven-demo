/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "^(Login|Find product|Add product to cart|View cart|Checkout)(-success|-failure)?$";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9045454545454545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9833333333333333, 500, 1500, "233 /viewcart"], "isController": false}, {"data": [1.0, 500, 1500, "212 /addtocart"], "isController": false}, {"data": [1.0, 500, 1500, "Checkout"], "isController": true}, {"data": [0.9833333333333333, 500, 1500, "Find product"], "isController": true}, {"data": [0.5, 500, 1500, "158 /login"], "isController": false}, {"data": [0.5, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Add product to cart"], "isController": true}, {"data": [0.9833333333333333, 500, 1500, "View cart"], "isController": true}, {"data": [1.0, 500, 1500, "188 /bycat"], "isController": false}, {"data": [1.0, 500, 1500, "209 /view"], "isController": false}, {"data": [1.0, 500, 1500, "239 /deletecart"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 180, 0, 0.0, 292.28333333333325, 179, 1485, 553.8, 575.95, 917.9999999999984, 3.0186147912124768, 2.7435461386885795, 1.5142205056179774], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["233 /viewcart", 30, 0, 0.0, 241.96666666666664, 201, 544, 269.9, 426.84999999999985, 544.0, 0.5245672320335724, 0.32107544478929884, 0.267406342892114], "isController": false}, {"data": ["212 /addtocart", 30, 0, 0.0, 238.33333333333343, 205, 294, 271.40000000000003, 291.8, 294.0, 0.5244388504300399, 0.15722922566603734, 0.29755758994126286], "isController": false}, {"data": ["Checkout", 30, 0, 0.0, 266.6, 231, 427, 297.40000000000003, 371.44999999999993, 427.0, 0.5268333801629672, 0.1627146846024164, 0.2551849185164372], "isController": true}, {"data": ["Find product", 30, 0, 0.0, 406.6666666666667, 372, 577, 443.1, 520.3499999999999, 577.0, 0.522966965919986, 1.1709557221302187, 0.4902815305499869], "isController": true}, {"data": ["158 /login", 30, 0, 0.0, 600.1333333333331, 518, 1485, 682.1000000000001, 1099.9999999999995, 1485.0, 0.5131275121867784, 1.0228976470965534, 0.2620758680407081], "isController": false}, {"data": ["Login", 30, 0, 0.0, 600.1333333333331, 518, 1485, 682.1000000000001, 1099.9999999999995, 1485.0, 0.5124350915550697, 1.0215173363196912, 0.26172221961259906], "isController": true}, {"data": ["Add product to cart", 30, 0, 0.0, 238.33333333333343, 205, 294, 271.40000000000003, 291.8, 294.0, 0.5244480184605702, 0.15723197428456548, 0.29756279172421024], "isController": true}, {"data": ["View cart", 30, 0, 0.0, 241.96666666666664, 201, 544, 269.9, 426.84999999999985, 544.0, 0.5245764045533231, 0.3210810590760461, 0.26741101872737766], "isController": true}, {"data": ["188 /bycat", 30, 0, 0.0, 214.23333333333335, 187, 387, 219.0, 321.5499999999999, 387.0, 0.5246314464088977, 0.7803209651469842, 0.24797033209170558], "isController": false}, {"data": ["209 /view", 30, 0, 0.0, 192.43333333333334, 179, 249, 208.8, 228.09999999999997, 249.0, 0.5249251981592623, 0.3945824438767475, 0.24400819758184458], "isController": false}, {"data": ["239 /deletecart", 30, 0, 0.0, 266.6, 231, 427, 297.40000000000003, 371.44999999999993, 427.0, 0.5268333801629672, 0.1627146846024164, 0.2551849185164372], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 180, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
