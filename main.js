// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page

function startCallBack() {
    document.getElementById('startDemo').disabled = 'true';

    //Read the data
    d3.csv("data.csv",

        // Format variables:
        function (d) {
            return { date: d3.timeParse("%Y-%m-%d")(d.Date), value: d.Close }
        },

        // Use this dataset:
        function (allData) {

            initialIndex = 0
            initialDone = false
            endIndex = allData.length
            endDone = false

            inputStartYear = Number(document.getElementById("startYear").value)

            inputEndYear = Number(document.getElementById("endYear").value)
            initialAmount = Number(document.getElementById("initialAmount").value)

            if (inputStartYear > inputEndYear){
                alert("End year must greater or equal start year !")
                document.getElementById('startDemo').disabled = '';
                return
            }
            for (let i = 0; i < allData.length; i++) {
                if (allData[i].date.getFullYear() === inputStartYear && !initialDone) {
                    initialIndex = i
                    initialDone = true
                }
                if (allData[i].date.getFullYear() === (inputEndYear + 1) && !endDone) {
                    endIndex = i
                    endDone = true
                }

            }
            console.log(initialIndex)
            console.log(endIndex)
            console.log(initialAmount)
            startTime = allData[initialIndex].date
            endTime = allData[endIndex - 1].date

            usedData = allData.slice(initialIndex, endIndex)

            interval = 200

            count = 0

            timeForEachSlice = 10000

            startIndexValue = usedData[0].value


            for (let i = 0; i < usedData.length; i += interval) {
                // Add X axis --> it is a date format
                if (i + interval >= usedData.length) {
                    data = usedData.slice(i)
                } else {
                    data = usedData.slice(i, i + interval)
                }
                count += 1
                setTimeout((data, startTime, initialAmount, startIndexValue) => {

                    var svg = d3.select("body")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("id", "chart")
                        .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");


                    var x = d3.scaleTime()
                        .domain(d3.extent(data, function (d) { return d.date; }))
                        .range([0, width]);
                    svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x));

                    // Add Y axis
                    var y = d3.scaleLinear()
                        .domain([0, d3.max(data, function (d) { return +d.value; })])
                        .range([height, 0]);
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    // Add the line
                    svg.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(function (d) { return x(d.date) })
                            .y(function (d) { return y(d.value) })
                        )
                    svg.selectAll("circle")
                        .data(data.slice(0, 1))
                        .enter().append("circle").attr("cx", function (d) {

                            return x(d.date)
                        }).attr("cy", function (d) {

                            return y(d.value)
                        }).attr("r", 5).style("fill", "red")

                    // get the lowest and max annotation
                    low_value = 9999999
                    low_date = null

                    high_value = -1
                    high_date = null
                    for (let j = 0; j < data.length; j++) {
                        let curr = data[j]

                        if (Number(curr.value) >= Number(high_value)) {
                            high_value = curr.value
                            high_date = curr.date
                        } if (Number(curr.value) <= Number(low_value)) {
                            low_value = curr.value
                            low_date = curr.date
                        }
                    }

                    const annotations = [
                        {
                            note: {
                                title: "High"
                            },
                            x: x(high_date),
                            y: y(high_value),
                            dy: 50,
                            dx: 0,
                        },
                        {
                            note: {
                                title: "Low"
                            },
                            x: x(low_date),
                            y: y(low_value),
                            dy: -50,
                            dx: 0,
                        }
                    ]
                    //console.log(x(d3.timeParse("%Y-%m-%d")("2000-08-28")))
                    //console.log(y(4049))
                    // Add annotation to the chart
                    const makeAnnotations = d3.annotation()
                        .annotations(annotations)

                    svg.append("g")
                        .call(makeAnnotations)

                    duration = timeForEachSlice / data.length
                    t = d3.transition()
                        .duration(duration)

                    for (let i = 0; i < data.length; i++) {
                        setTimeout(function () {
                            svg.select("circle").transition(t)
                                .attr("cx", x(data[i].date))
                                .attr("cy", y(data[i].value))
                            document.getElementById("total").innerHTML = "Total Amount: " + (data[i].value / startIndexValue * initialAmount).toFixed(2)
                            document.getElementById("range").innerHTML = "Time Range: " + startTime + " ----- " + data[i].date
                        }, i * duration);
                    }

                    setTimeout(() => {
                        d3.select("svg").remove();
                    }, timeForEachSlice);

                    //console.log(i / interval)
                }, (count - 1) * timeForEachSlice, data, startTime, initialAmount, startIndexValue);
                
            }
            setTimeout(() => {
                document.getElementById('startDemo').disabled = '';
            }, ((endIndex - initialIndex) / interval + 1 ) * timeForEachSlice);
        })
}