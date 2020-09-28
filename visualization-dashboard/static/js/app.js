var dropDown = d3.select("#selDataset");
var demographics = d3.select("#sample-metadata");

// Function to recreate the otu_ids list by prepending OTU to the beginning
function replaceArr(list) {
    var dataList = [];
    for(var i = 0; i < list.length; i++){
        dataList.push(`OTU ${list[i]}`);
    }
    console.log(dataList);
    return dataList;
}

d3.json("samples.json").then(function(data) {
    console.log(data);
    var subjects = data.names;
    var metadata = data.metadata;
    var samples = data.samples;
    console.log(subjects[0]);
    console.log(metadata[0]);
    console.log(samples[0]);
    // Populate the dropdown options
    subjects.forEach((subject) => {
        dropDown.append("option")
        .attr("value",`${subject}`)
        .text(`${subject}`)
    });    

    function returnIndex(listElement) {
        return subjects.findIndex((element) => element === listElement)
    }
    function init() {
        var initMetadata = metadata[0];
        var initSamples = samples[0];
        var otu_ids = initSamples.otu_ids
        var otu_labels = initSamples.otu_labels;
        var sample_values = initSamples.sample_values;

        var gaugeScrubs = initMetadata.wfreq;
        
        // Slice the first 10 values of each array for the bar chart
        var idsSliced = otu_ids.slice(0,10);
        var labelsSliced = otu_labels.slice(0,10);
        var valuesSliced = sample_values.slice(0,10);

        console.log(initMetadata);
        console.log(initSamples);
        console.log(initSamples.otu_ids);

        // Display demographics info
        Object.entries(initMetadata).forEach(([key, value]) => {
            demographics.append("p")
            .text(`${key} : ${value}`)
        });
        // Convert IDs to strings for bar plot
        var idsStrings = replaceArr(idsSliced);
        
        // Reverse all 3 arrays to account for Plotly defaults
        var reversedIds = idsStrings.reverse();
        var reversedLabels = labelsSliced.reverse();
        var reversedValues = valuesSliced.reverse();

        // Create the bar chart
        var trace1 = {
            x : reversedValues,
            y : reversedIds,
            type : 'bar',
            orientation : 'h',
            text : reversedLabels
        };
        var data = [trace1];
        Plotly.newPlot("bar",data);

        //Create the gauge chart
        var data3 = [
            {
              type: "indicator",
              mode: "gauge+number",
              value: gaugeScrubs,
              title: { text: "Scrubs per Week", font: { size: 20 } },
              gauge: {
                axis: { range: [null, 9], tickwidth: 1, tickcolor: "darkgreen" },
                bar: { color: "#006622" },
                bgcolor: "white",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                  { range: [0, 1], color: "#e6ffee" },
                  { range: [1, 2], color: "#ccffdd"},
                  { range: [2, 3], color: "#b3ffcc"},
                  { range: [3, 4], color: "#80ffaa"},
                  { range: [4, 5], color: "#00ff55"},
                  { range: [5, 6], color: "#00e64d"},
                  { range: [6, 7], color: "#00cc44"},
                  { range: [7, 8], color: "#009933"},
                  { range: [8, 9], color: "#00802b"},
                ],
              }
            }
          ];
          
          Plotly.newPlot('gauge', data3);

        // Create the bubble chart
        var trace2 = {
           x : otu_ids,
           y : sample_values,
           type : "scatter",
           mode : "markers",
           text : otu_labels,
           marker : {
               color : otu_ids,
               colorscale : "Jet",
               size : sample_values,
               sizeref : 2
           }
        };

        var layout2 = {
            xaxis: {
                title: 'OTU ID'
            }
        };
        var data2 = [trace2];
        Plotly.newPlot("bubble",data2, layout2);
    };

    // On change to the DOM, call optionChanged()
    d3.selectAll("#selDataset").on("change", optionChanged);

    function optionChanged() {
        var dropdownMenu = d3.select("#selDataset");
        // Assign the value of the dropdown menu option to a variable
        var dataset = dropdownMenu.property("value");

        // Get the names index of the option selected
        var optionIndex = returnIndex(dataset);

        // Retrieve data for option selected
        var newMetadata = metadata[optionIndex];
        var newSamples = samples[optionIndex];
        var otu_ids = newSamples.otu_ids;
        var otu_labels = newSamples.otu_labels;
        var sample_values = newSamples.sample_values;
        var gaugeScrubs = newMetadata.wfreq;

        // Wipe existing metadata
        demographics.html("");

        // Update metadata based on subject selected
        Object.entries(newMetadata).forEach(([key, value]) => {
            demographics.append("p")
            .text(`${key} : ${value}`)
        });

        // Slice the first 10 values of each array for the bar chart
        var idsSliced = otu_ids.slice(0,10);
        var labelsSliced = otu_labels.slice(0,10);
        var valuesSliced = sample_values.slice(0,10);

         // Convert IDs to strings for bar plot
         var idsStrings = replaceArr(idsSliced);

         // Reverse all 3 arrays to account for Plotly defaults
         var reversedIds = idsStrings.reverse();
         var reversedLabels = labelsSliced.reverse();
         var reversedValues = valuesSliced.reverse();
         
         // Define updates to bar chart
         var trace1 = {
            x : reversedValues,
            y : reversedIds,
            type : 'bar',
            orientation : 'h',
            text : reversedLabels
        };
        var data = [trace1];

        // Define updates to the bubble chart
        var trace2 = {
           x : otu_ids,
           y : sample_values,
           type : "scatter",
           mode : "markers",
           text : otu_labels,
           marker : {
               color : otu_ids,
               colorscale : "Jet",
               size : sample_values,
               sizeref : 2
           }
        };
        var data2 = [trace2];

        var layout2 = {
            xaxis: {
                title: 'OTU ID'
            }
        };
        // Run update Plotly function 
        updatePlotly(data, data2, layout2, gaugeScrubs);
    };

    // Function to recreate the bar, gauge and bubble plots
    function updatePlotly(newData1, newData2, newData3, newData4) {
        Plotly.react("bar", newData1);
        Plotly.react("bubble", newData2, newData3);
        Plotly.restyle("gauge", "value", newData4);
    };

    // Initialize plots and metadata
    init();

});

// json data promise
const dataPromise = d3.json("samples.json");
console.log("Data Promise ", dataPromise);
