var legend = d3.select('.mainDiv').append('svg').attr('class', 'legend')
    .attr('height',325).attr('width',350);
var mainView = d3.select(".mainDiv")
  .append('svg').attr('class', 'mainView')
  .attr("viewBox","0 0 100 170")
  .attr('width',800).attr('height', 300)
  .attr('x', 200);

var yearView = d3.select(".yearView").attr('viewBox', '225 0 1000 1000');
const colors = ["#88C890","#5A9E63", "#3B5086", "#889EC8"];

  const margin =  {
    top: 0,
    right: 20,
    bottom: 30,
    left: 20,
  };

  

const width = yearView.attr('width');
const height = yearView.attr('height');

  //square map col/row
  const cols = 4;
  const rows = 3;

  colScale = d3.scaleBand()
  .domain(d3.range(cols))
  .range([margin.left, width-margin.left-margin.right])
  .padding(0.3);

  rowScale = d3.scaleBand()
  .domain(d3.range(rows))
  .range([margin.top, height-margin.top-margin.bottom])
  .padding(0.2);

  cellColScale = d3.scaleBand()
  .domain([0,2])
  .range([0, colScale.bandwidth()])
  .padding(0.2);

  const render = data =>{
    //frame work for each cell  
    const cells = yearView.selectAll('g')
      .data(data)
      .join('g')
      .attr('class', 'cells')
      .attr('id', (d) =>d.Region)
      .attr('iNum', (d,i)=>i)
      .attr('transform', (d, i) => {

          /* i is the current index
             in this case, the value of i will be from 0-25. */
          // get the row index and column index for this cell
          const r = Math.floor(i / cols);
          const c = i % cols;
          // use the scales to get the x, y coordinates
          return `translate(${colScale(c)}, ${rowScale(r)})`;
        });
    
    //add xAxis
    function build(data){
    cells.append('line')
        .attr('x1', 0)
        .attr('x2', colScale.bandwidth())
        .attr('y1', rowScale.bandwidth())
        .attr('y2', rowScale.bandwidth())
        .attr('stroke', 'black');
    //add yAxis
    cells.append('line')
        .attr('x1',  0)
        .attr('x2',  0)
        .attr('y1',  0)
        .attr('y2', rowScale.bandwidth())
        .attr('stroke', 'black');
    //add title
    cells.append('text')
    .attr('x', colScale.bandwidth()/2)
    .attr('font-size', 20)
    .text((d)=>d.Month)
    
    scalePayment = d3.scaleLinear()
      .domain([0,1380])
      .range([0, rowScale.bandwidth()-20]);

    cells.append("rect")
    .attr('id', "Interest")
    .attr('width', cellColScale.bandwidth())
    .attr('height', (d)=>(scalePayment(d.Interest)))
    .attr("x", cellColScale(0))
    .attr('y', (d)=>rowScale.bandwidth()-(scalePayment(d.Interest)))
    .attr('fill', colors[0])
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave);


    cells.append("rect")
    .attr('id', "Principal")
    .attr('width', cellColScale.bandwidth())
    .attr('height', (d)=>(scalePayment(d.Principal)))
    .attr("x", cellColScale(0))
    .attr('y', (d)=>rowScale.bandwidth()-(scalePayment(d.Interest)+(scalePayment(d.Principal))))
    .attr('fill', colors[1])
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave);

    scaleBalance = d3.scaleLinear()
    .domain([0,30000])
    .range([0, rowScale.bandwidth()-20]);

    cells.append("rect")
    .attr('id', "Balance")
    .attr('width', cellColScale.bandwidth())
    .attr('height', (scaleBalance(30000)))
    .attr("x", cellColScale(2))
    .attr('y', rowScale.bandwidth()-(scaleBalance(30000)))
    .attr('fill', colors[2])
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave);

    cells.append("rect")
    .attr('id', "Paid")
    .attr('width', cellColScale.bandwidth())
    .attr('height', (d)=>(scaleBalance(30000-d.End_Balance)))
    .attr("x", cellColScale(2))
    .attr('y', (d)=>scaleBalance(d.End_Balance)+20)
    .attr('fill', colors[3])
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave);

    cells.append("text")
      .attr("fill", "white")
      .attr("x",cellColScale(0))
      .attr("y",(d)=>rowScale.bandwidth()-(scalePayment(d.Interest)))
      .attr("dy", "1.5%")
      .style("font-size", "90%")
      .text("Interest");

      cells.append("text")
      .attr("fill", "white")
      .attr("x",cellColScale(0))
      .attr("y",(d)=>rowScale.bandwidth()-(scalePayment(d.Interest)+(scalePayment(d.Principal))))
      .attr("dy", "2%")
      .style("font-size", "90%")
      .text("Principal");

      cells.append("text")
      .attr("fill", "white")
      .attr("x",cellColScale(2))
      .attr("y",rowScale.bandwidth()-(scaleBalance(30000)))
      .attr("dy", "2%")
      .style("font-size", "90%")
      .text("Loan");

      cells.append("text")
      .attr("fill", "white")
      .attr("x",cellColScale(2))
      .attr("y",(d)=>scaleBalance(d.End_Balance)+20)
      .attr("dy", "2%")
      .style("font-size", "90%")
      .text("Paid Off");
  };

    build(data);
    
     // create a tooltip
  var Tooltip = d3.selectAll('div')
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  Tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("opacity",1)
}
var mousemove = function(e,d) {
  Tooltip
    .html(d3.select(this).attr('id') + ": " + d3.select(this).attr('height'))
    .style("top", e.clientX + "px")
    .style("left", e.clientY + "px")
}
var mouseleave = function(d) {
  Tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

d3.select('#search').on('click', showState);

  function showState(){
    var month = d3.select('#textBox').property('value');
    var monthCell = yearView.select("#"+month)
    monthCell.attr('transform', 'translate(0,0)');
    clearMainView();
    console.log();
    mainView.node().append(monthCell.node());
    
  
  }
  return yearView.node();
}

    
d3.csv('/Interest_Calculator.csv')
  .then(
    data => {
    data.forEach(d => {
      d.Month = d.Month;
      d.Start_Balance = +d.Start_Balance;
      d.Payment = +d.Payment;
      d.Principal = +d.Principal;
      d.Interest = +d.Interest;
      d.End_Balance = +d.End_Balance;
      d.Cumulative_Interest = +d.Cumulative_Interest;
  });
    render(data);
});
