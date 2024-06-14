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
   <script src="./html2pdf.bundle.min.js"></script>
   <script src="./html2canvas.js"></script>

   <script src="./chart.js"></script>

   <script src="./chart.min.js"></script>
   <script src="./chartjs-plugin-datalabels@2.0.0.js"></script>

   <script src="./2.4.0/jspdf.umd.min.js"></script>
   <script src="./html2canvas.min.js"></script>
   <script src="./jquery.min.js"></script>
   <script src="./jspdf.umd.min.js"></script>

   <!-- <link rel="stylesheet" href="./dist/output.css" /> -->
   <script src="./tailwind.js"></script>
   <script src="./report.js"></script>
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

      let data = {};
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
                     pointBackgroundColor: "red",
                     pointBorderColor: "red",
                     borderWidth: 2,
                     data: values[count],
                     datalabels: {
                        anchor: "end",
                        align: "end",
                        offset: 5,
                        color: "black",
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
                        drawBorder: false,
                        display: false,
                     },
                     ticks: {
                        color: "#043F60",
                        font: {
                           weight: "bold",
                        },
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

      let headerData = ""
      let reportData = ""

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


         headerData = data?.filter(item => item.componentType === "Row")
            .flatMap(item =>
               item.children.filter(child => child.componentType === "col" || child.componentType === "image")
                  .map(child => child.children)
            );

         // Extract report data for "Report" components and their children
         reportData = data?.filter(item => item.componentType === "Report")
            .map(item => item.children);

         // Log the generated HTML strings


         const header = generate_header(headerData)

         const pdfData = generate_report(headerData, reportData, header)
         // downloadPDF(headerData, reportData)
         // console.log("pdfData", pdfData)

         


         const contentDiv = document.getElementById('content');
         contentDiv.innerHTML = pdfData;
         // contentDiv.innerHTML = dummy;

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
         // console.log("headerData", headerData)
         const flattenedHeaderData = headerData.flat();

         // Generate HTML for headerData
         let headerHeight = 0
         let headerHtml = ""

         headerHtml += flattenedHeaderData.map((item) => {
            if (item.componentType === "header-image") {
               headerHeight += ((item.height * 297) / (11.2 * 100));
               // console.log("headerImage", headerHeight)

               return generateHeaderImageComponent(item.url, item.height);
            }

            if (item.componentType === "footer-image") {
               headerHeight += ((item.height * 297) / (11.2 * 100));
            }
            return '';

         }).join("");

         let flatKVPair = []
         for (let index = 0; index < headerData[1].length; index++) {
            flatKVPair = [...flatKVPair, headerData[1][index], headerData[2][index]]

         }

         headerHtml += '<div class="grid grid-cols-5 gap-x-2 justify-items-between">';

         // console.log("FlatData", flatKVPair)

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


         headerHeight += calculateHeaderHeight(headerData) * 297 / (17 * 4) + 297 / 15.5
         // console.log("headerHeight", headerHeight)

         return {
            html: headerHtml,
            height: headerHeight
         }

      }

      function generate_report(headerData, reportData, header) {
         let html = "";
         let newHeight = 0;
         let footerHeight = 0
         let pageHeight = 297;
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
            if (newHeight <= -4.5) {
               html += generateEmptyComponent(1)
               currentPageHeight = pageHeight - header.height; // Reset the page height
               html += header.html + generateTestReportHeaderComponent(); // Add header for the new page
            }

            if (newHeight > 0 && item.componentType == "title") { // check if title component is last component of the page and move it to the next page
               nextItem = flattenedReportData[idx + 1]
               if (nextItem && nextItem.componentType == "testReport") {
                  nextComponentHeight = calculateComponentHeight(nextItem);
                  finalPageHeight = currentPageHeight - nextComponentHeight;
                  if (finalPageHeight <= 0) {
                     html += generateEmptyComponent(1) // reduce 10 to avoid overlapping
                     currentPageHeight = pageHeight - header.height; // Reset the page height
                     html += header.html + generateTestReportHeaderComponent(); // Add header for the new page
                  }
               }
            }

            html += insertMainContent(item, currentPageHeight, idx);

            currentPageHeight -= componentHeight;

         })

         html += generateEmptyComponent(1)

         return html

      }

      window.jsPDF = window.jspdf.jsPDF;
      $("#download").click(function () {
         // console.log("download", headerData, reportData)
         const flattenedHeaderData = headerData?.flat();
         const flattenedReportData = reportData?.flat()

         let headerValue = flattenedHeaderData.map((item) => {
            if (item.componentType === "header-image") {
               return { url: item.url, height: item.height, margin: item.margin }
            }
         }).filter(item => item !== undefined);

         let footerValue = flattenedHeaderData.map((item) => {
            if (item.componentType === "footer-image") {
               // footerHeight += (item.height * 297) / (10.3 * 100);
               return { url: item.url, height: item.height, margin: item.margin }


            }
         }).filter(item => item !== undefined);


         const headerImageURL = headerValue[0].url; // Replace with your image URL
         const headerHeight = (headerValue[0].height * 297) / (11.2 * 100); // Set the height of the header image

         const footerImageURL = footerValue[0].url; // Replace with your image URL
         const footerHeight = (footerValue[0].height * 297) / (11.2 * 100) + 297 / 69; // Set the height of the footer image

         let height = $("#content").height();
         let width = $("#content").width();
         html2pdf()
            .set({
               pagebreak: { after: '.pageBreak' },
               html2canvas: {
                  scale: 3, // Increase scale for better resolution
                  logging: true, // Enable logging for debugging
                  useCORS: true, // Use CORS to load images from different domains
               },
               filename: "report.pdf",
               jsPDF: {
                  unit: "mm",
                  format: ["210", "297"],
                  orientation: "portrait"
               },
            })
            .from(document.getElementById("content"))
            .toPdf()
            .get("pdf")
            .then(function (pdf) {
               const totalPages = pdf.internal.getNumberOfPages();
               const pageWidth = pdf.internal.pageSize.getWidth();
               const pageHeight = pdf.internal.pageSize.getHeight();


               // const imageWidth = pageWidth - 20; // Adjust width as needed
               // const imageHeight = footerHeight - 3; // Adjust height as needed
               // const marginBottom = -1.5; // Adjust margin as needed
               // const xOffset = (pageWidth - imageWidth) / 2; // Calculate x-offset for centering horizontally
               // const yOffset = pageHeight - footerHeight + (footerHeight - imageHeight) / 2 + marginBottom; // Calculate y-offset for centering vertically within footer area
               // Header image dimensions
               const headerImageWidth = headerValue[0].margin ? pageWidth - 20 : pageWidth;
               const headerImageHeight = headerHeight;
               const headerMarginTop = 0;
               const headerXOffset = (pageWidth - headerImageWidth) / 2;
               const headerYOffset = headerMarginTop;

               // Footer image dimensions
               const footerImageWidth = footerValue[0].margin ? pageWidth - 20 : pageWidth;
               const footerImageHeight = footerHeight;
               const footerMarginBottom = 0;
               const footerXOffset = (pageWidth - footerImageWidth) / 2;
               const footerYOffset = pageHeight - footerImageHeight + footerMarginBottom;




               // Loop through each page and add the footer image
               for (let i = 1; i <= totalPages; i++) {
                  // if (i == totalPages) {
                  //    // remove the last page footer
                  //    pdf.deletePage(i)
                  //    continue
                  // }
                  pdf.setPage(i);
                  pdf.setFontSize(8);
                  pdf.setTextColor(0);
                  //Add you content in place of example here
                  // pdf.addImage(footerImageURL, 'PNG', xOffset, yOffset, imageWidth, imageHeight);

                  // Add header image
                  pdf.addImage(headerImageURL, 'PNG', headerXOffset, headerYOffset, headerImageWidth, headerImageHeight);

                  // Add footer image
                  pdf.addImage(footerImageURL, 'PNG', footerXOffset, footerYOffset, footerImageWidth, footerImageHeight);



                  // Add page number
                  const text = "Page " + i + " of "+ totalPages;
                  const textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize(20) / pdf.internal.scaleFactor;
                  const textX = (pageWidth - textWidth) - 10; // Adjust x-position as needed
                  const textY = pageHeight - 30; // Adjust y-position as needed
                  pdf.text(text, textX, textY);
               }
            })
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
   console.log(htmlString);

   try {
       const browser = await puppeteer.launch({
         headless: true,
         defaultViewport: null,
         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
       }
       );
       const page = await browser.newPage();
       // console all requests made by the page
       page.on('request', request => {
         console.log('Request:', request.url());
      });
      // console all responses made by the page
      page.on('response', response => {
         console.log('Response:', response.url());
      });
      // console all console messages made by the page
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
       await page.setContent(htmlString, { timeout: 50000, waitUntil: 'networkidle2',  });

       
       
       // create a screenshot of the page
         await page.screenshot({ path: 'screenshot.png' });

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
       console.log('Clicked download button');

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
