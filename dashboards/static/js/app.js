function buildMetadata(sample) {

  let sample_metadata = d3.select("#sample-metadata")
  sample_metadata.html("Loading...")

  d3.json("/metadata/" + sample).then(function(data) {

    let html = ""
    Object.entries(data).forEach(entry => {
      let key = entry[0]
      let value = entry[1]

      html += "<strong>" + key + "</strong>: " + value + "<br/>"
    })
    sample_metadata.html(html)
  })
}

function buildCharts(sample) {

  console.log("buildCharts")
  console.log(sample)
  console.log("buildCharts end")

  let pie_element = d3.select("#pie")
  pie_element.html("")

  let bubble_element=d3.select("#bubble")
  bubble_element.html("")

  d3.json("/samples/" + sample).then(function(data) {

    let mapped_data = data.otu_ids.map(function(value, index) {
      return {
        "otu_id": value, 
        "otu_label": data.otu_labels[index],
        "sample_value": data.sample_values[index]
      }
    })
    let sorted_data = mapped_data.sort(function(a, b) {
      return a.sample_value < b.sample_value
    })
    let sliced_data = sorted_data.slice(0, 10)

    // Make pie chart
    let pie_trace = {
      labels: sliced_data.map(function(value) {
        return value.otu_id
      }),
      values: sliced_data.map(function(value){
        return value.sample_value
      }),
      hovertext: sliced_data.map(function(value) {
        return value.otu_label
      }),
      type: "pie" 
    }

    let pie_data = [pie_trace]
    let pie_layout = {
      title: "Pie Chart"
    }
    Plotly.newPlot("pie", pie_data, pie_layout)

    // @TODO: Build a Bubble Chart using the sample data
    let bubble_trace = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        size: data.sample_values,
        color: data.otu_ids,


      }
    };

    let bubble_data = [bubble_trace];
    
    let layout = {
      
    };

    Plotly.newPlot("bubble", bubble_data, layout);

  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  console.log("optionChanged")
  console.log(newSample)
  console.log("optionChanged end")
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();