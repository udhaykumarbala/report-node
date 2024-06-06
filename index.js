const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 8080;

// Middleware to parse JSON bodies
app.use(express.json({limit: '50mb'}));

// Function that takes a JSON object and returns an HTML string
function jsonToHtml(json) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
       <script src="https://html2canvas.hertzen.com/dist/html2canvas.js"></script>
    
       <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
       <script src="https://cdn.jsdelivr.net/npm/chart.js@3.0.0/dist/chart.min.js"></script>
       <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    
       <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
       <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
       <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
       <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>
    
       <!-- <link rel="stylesheet" href="./dist/output.css" /> -->
       <script src="https://cdn.tailwindcss.com"></script>
       <script src="./report.js"></script>
       <script src="../temp/pageSizeTest.js"></script>
       <title>Report Convertion Table</title>
    
       <style>
          body {
             font-family: Poppins, sans-serif;
          }
       </style>
    </head>
    
    <body>
       <div class="container mx-auto p-3">
    
          <h2 class="text-3xl font-bold text-center p-4">Test Report</h2>
    
    
          <div class="flex justify-center p-7 gap-10">
    
             <button id="download" class="text-base text-white bg-sky-600 px-4 py-2 rounded-md">
                Download PDF
             </button>
          </div>
    
          <div id="content" class="px-10 w-[794px] h-[1123p] flex flex-col rounded-xl container mx-auto shadow-2xl"></div>
    
    
    
       </div>
    
       <script>
          //Fetch JSON data and insert it into the HTML content
    
          let data = ${JSON.parse(json)};
          let count = "";
          const doc = document.getElementById("content");
    
          function graphChartContent(years, values, count) {
             if (years[count].length < 2) {
                return;
             }
             count = count;
             const countString = count - 0 + 1;
             const id = "chartContainer" + countString;
             const container = document.getElementById(id);
    
             if (container) {
                const canvas = document.createElement("canvas");
                canvas.id = "dynamicChart" + countString;
                container.appendChild(canvas);
                const ctx = canvas.getContext("2d");
    
                const chartData = {
                   labels: years[count],
                   datasets: [
                      {
                         display: true,
                         fill: false,
                         backgroundColor: "rgba(255, 99, 132, 0.2)",
                         borderColor: "#7c7a7d",
                         borderWidth: 2,
                         data: values[count],
                         datalabels: {
                            anchor: "end",
                            align: "end",
                            offset: 5,
                            color: "red",
                            font: {
                               weight: "bold",
                            },
                         },
                      },
                   ],
                };
    
                const options = {
                   aspectRatio: 4.5,
                   scales: {
                      y: {
                         display: false,
                         beginAtZero: false,
                         grace: "0.1",
                         grid: {
                            display: false,
                         },
                         // ticks: {
                         //    stepSize: 100,
                         // },
                      },
                      x: {
                         beginAtZero: true,
                         grid: {
                            display: false,
                         },
                      },
                   },
                   plugins: {
                      legend: {
                         display: false,
                      },
                      tooltip: {
                         enabled: false,
                      },
                   },
                };
    
                new Chart(ctx, {
                   type: "line",
                   data: chartData,
                   options: options,
                   plugins: [ChartDataLabels],
                });
             } else {
                console.error("Container element not found");
             }
          }
    
          document.addEventListener('DOMContentLoaded', function () {
             const jsonInput = ${json};
             let jsonData;
    
             try {
                jsonData = JSON.parse(jsonInput);
             } catch (e) {
                alert('Invalid JSON data');
                console.error('Error parsing JSON:', e);
                return;
             }
    
             data = transformData(jsonData);
    
    
             const headerData = data?.filter(item => item.componentType === "Row")
                .flatMap(item =>
                   item.children.filter(child => child.componentType === "col" || child.componentType === "image")
                      .map(child => child.children)
                );
    
             // Extract report data for "Report" components and their children
             const reportData = data?.filter(item => item.componentType === "Report")
                .map(item => item.children);
    
             // Log the generated HTML strings
    
    
             const header = generate_header(headerData)
    
             const pdfData = generate_report(headerData, reportData, header)
             // console.log("pdfData", pdfData)
    
             // const dummy = generateWithoutBar({
             //    height: 40,
             //    "testName": "vijayvijayvijayvijayvijay vijayutsflty",
             //    "labResult": "20",
             //    "uom": "%",
             //    "abnormalFlag": "",
             //    "abnormalFromValue": 10,
             //    "abnormalToValue": 50,
             //    "deltaPer": 0,
             //    "deltaFlag": "HR",
             //    // "diffDiagnosis": "Diagnosis",
             //    "diffDiagnosisImg": "",
             //    "historical": [],
             //    "key": "Name",
             //    "value": "SERO PROFILE ",
             //    "color": "red",
             //    "icon": "./blood.png",
             // })
    
    
             const contentDiv = document.getElementById('content');
             contentDiv.innerHTML = pdfData;
    
    
    
    
             const years = [];
             const values = [];
    
             for (let i = 0; i < reportData[0].length; i++) {
    
                const report = reportData[0][i];
    
                const lineChartData = report.historical?.map(
                   (historyItem) => historyItem
                );
    
                if (!lineChartData) {
                   continue;
                }
    
    
    
    
                years[i] = [];
                values[i] = [];
                report?.historical?.forEach((historyItem) => {
                   years[i].push(historyItem.date);
                   values[i].push(historyItem.value);
                });
    
    
             }
             const yearData = Object.keys(years);
             // console.log("yearData", yearData)
    
             isRendered =
                $("#content").data("chart") == "rendered" ? true : false;
             if (!isRendered) {
                yearData?.forEach((count) => {
                   // console.log("count", count);
                   graphChartContent(years, values, count);
                });
                $("#content").data("chart", "rendered");
             }
          });
    
          function transformData(data) {
             // console.log(data)
             let newData = [];
    
             newData[0] = data[0];
             newData[1] = data[1];
             const reportData = data[2].children;
    
             newData[2] = {};
             newData[2].componentType = "Report";
             newData[2].children = [];
             for (let i = 0; i < reportData?.length; i++) {
                if (reportData[i].componentType == "title") {
                   newData[2].children.push(reportData[i]);
                } else if (reportData[i].componentType == "testReport") {
                   let testReportData = reportData[i].value.map((item) => {
                      item.componentType = "testReport";
                      return item;
                   });
                   newData[2].children = [
                      ...newData[2].children,
                      ...testReportData,
                   ];
                }
             }
    
             return newData;
          }
    
          function generate_header(headerData) {
             console.log("headerData", headerData)
             const flattenedHeaderData = headerData.flat();
    
             // Generate HTML for headerData
             let headerHeight = 0
             let headerHtml = ""
    
             headerHtml += flattenedHeaderData.map((item) => {
                if (item.componentType === "header-image") {
                   headerHeight += ((item.height * 297) / (10.3 * 100));
                   console.log("headerImage", headerHeight)
    
                   return generateHeaderImageComponent(item.url, item.height);
                }
    
                if (item.componentType === "footer-image") {
                   headerHeight += ((item.height * 297) / (10.3 * 100));
                }
                return '';
    
             }).join("");
    
             let flatKVPair = []
             for (let index = 0; index < headerData[1].length; index++) {
                flatKVPair = [...flatKVPair, headerData[1][index], headerData[2][index]]
    
             }
    
             headerHtml += '<div class="grid grid-cols-5 gap-x-2 justify-items-between">';
    
             console.log("FlatData", flatKVPair)
    
             headerHtml += flatKVPair?.map((item, idx) => {
                let className = "right col-span-2"
                let keyClass = "w-[50%]"
                let valueClass = "flex justify-end"
                if ((idx + 1) % 2 !== 0) {
                   className = "left col-span-3"
                   keyClass = "w-[25%]"
                   valueClass = "justify-start"
    
                }
                return (
                   item.componentType === "kv" ? generateKeyValueComponent(item.key, item.value, className, keyClass, valueClass) : ""
                )
             }).join("");
    
             headerHtml += '</div>';
    
    
             headerHeight += calculateHeaderHeight(headerData) * 297 / (17 * 4) + 297 / 13.2
             console.log("headerHeight", headerHeight)
    
             return {
                html: headerHtml,
                height: headerHeight
             }
    
          }
    
          function generate_report(headerData, reportData, header) {
             let html = "";
             let newHeight = 0;
             let footerHeight = 0
             let pageHeight = 293;
             let currentPageHeight = pageHeight - header.height
             // console.log("currentPageHeight", currentPageHeight);
    
             const flattenedHeaderData = headerData.flat();
             const flattenedReportData = reportData.flat()
    
             let footerData = flattenedHeaderData.map((item) => {
                if (item.componentType === "footer-image") {
                   // footerHeight += (item.height * 297) / (10.3 * 100);
                   const footerHtml = generateFooterImageComponent(item.url, item.height);
                   return footerHtml
    
                }
             })
    
    
             // html += header.html
             html += header.html + generateTestReportHeaderComponent()
    
    
             let page = 1
             flattenedReportData.forEach((item, idx) => {
                let componentHeight = calculateComponentHeight(item);
                let newHeight = currentPageHeight - componentHeight;
                // console.log("newHeight", newHeight);
    
                if (newHeight <= 0) {
                   html += generateEmptyComponent(currentPageHeight)
                   html += generatePageNoComponent(page);
                   html += footerData[1];
                   page++;
    
                   currentPageHeight = pageHeight - header.height; // Reset the page height
                   html += header.html + generateTestReportHeaderComponent(); // Add header for the new page
                }
    
                html += insertMainContent(item, currentPageHeight, idx);
                currentPageHeight -= componentHeight;
             })
    
             html += generateEmptyComponent(currentPageHeight)
             html += generatePageNoComponent(page);
             html += footerData[1];
             page++;
    
             return html
    
          }
    
          window.jsPDF = window.jspdf.jsPDF;
          $("#download").click(function () {
             let height = $("#content").height();
             let width = $("#content").width();
             html2pdf()
                .set({
                   pagebreak: { after: '.pageBreak' },
                   html2canvas: {
                      scale: 2, // Increase scale for better resolution
                      logging: true, // Enable logging for debugging
                      useCORS: true, // Use CORS to load images from different domains
                   },
                   filename: "report.pdf",
                   jsPDF: {
                      unit: "mm",
                      format: ["210", "297"],
                   },
                })
                .from(document.getElementById("content"))
    
                .save();
          });
       </script>
    `;
}

// GET endpoint to serve the HTML page with the textarea
app.get('/', (req, res) => {
   const htmlForm = `
       <!DOCTYPE html>
       <html>
       <head>
           <title>JSON Input</title>
       </head>
       <body>
           <h1>Enter JSON Data</h1>
           <textarea id="jsonData" rows="10" cols="50"></textarea><br>
           <button onclick="submitJson()">Submit</button>

           <script>
               async function submitJson() {
                   const jsonData = document.getElementById('jsonData').value;
                   try {
                       const response = await fetch('/render', {
                           method: 'POST',
                           headers: {
                               'Content-Type': 'application/json'
                           },
                           body: JSON.stringify({ jsonData: jsonData })
                       });

                       if (!response.ok) {
                           throw new Error('Network response was not ok');
                       }

                       const htmlString = await response.text();
                       const newWindow = window.open();
                       console.log(htmlString);
                       newWindow.document.write(htmlString);
                       newWindow.document.close();
                   } catch (error) {
                       alert('Error: ' + error.message);
                   }
               }
           </script>
       </body>
       </html>
   `;
   res.send(htmlForm);
});

// POST endpoint to receive JSON and respond with HTML
app.post('/render', (req, res) => {
    const jsonObject = req.body;
    const JSONData = jsonObject.jsonData;
    console.log(JSONData);
    const htmlString = jsonToHtml(JSON.stringify(JSONData));
    res.send(htmlString);
});

// Route to receive HTML content and render it to PDF using Puppeteer
app.post('/generate-pdf', async (req, res) => {
   const jsonObject = req.body;
   const JSONData = jsonObject.jsonData;
   const htmlString = jsonToHtml(JSON.stringify(JSONData));

   try {
       const browser = await puppeteer.launch(
       );
       const page = await browser.newPage();
       await page.setContent(htmlString, { waitUntil: 'networkidle0' });

       // Intercept the request to receive the PDF data
       page.on('request', interceptedRequest => {
           if (interceptedRequest.url().endsWith('/receive-pdf')) {
               interceptedRequest.continue((response) => {
                   const pdfData = response.body().pdfData;
                   const base64PDF = Buffer.from(pdfData, 'binary').toString('base64');
                   res.send({ base64PDF });
               });
           } else {
               interceptedRequest.continue();
           }
       });

       // Click the download button to trigger the PDF generation
       await page.click('#download');

       await page.waitForResponse(response => response.url().endsWith('/receive-pdf') && response.status() === 200);
       await browser.close();

   } catch (error) {
       console.error('Error generating PDF:', error);
       res.status(500).send('Error generating PDF');
   }
});

// Route to receive PDF data (from the HTML page)
app.post('/receive-pdf', (req, res) => {
   const pdfData = req.body.pdfData;
   res.send(pdfData);
});

// serve static files
app.use(express.static('public'));
// report.js in the public folder can be accessed at http://localhost:3000/report.js

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
