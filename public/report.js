function calculateHeaderHeight(data) {
    let totalHeight = 0;
    for (let i = 0; i < data.length; i++) {
       totalHeight += data[i].length;
    }
    // totalHeight += 345 / 14;
 
    return totalHeight;
 }
 
 function calculateComponentHeight(data) {
    let totalHeight = 0;
    if (data.componentType == "title") {
       totalHeight += 345 / 36;
    } else if (data.componentType == "testReport") {
 
       // totalHeight += 345 / 0;
       if (data.abnormalFromValue === 0 && data.abnormalToValue === 0) {
          totalHeight += 345 / 22;
       }
       if (data.abnormalFromValue !== 0 && data.abnormalToValue !== 0) {
          totalHeight += 345 / 15;
       }
 
       if (
          data.abnormalFromValue === 0 &&
          data.abnormalToValue === 0 &&
          data.diffDiagnosis
       ) {
          totalHeight += 345 / 9;
       }
       if (
          data.abnormalFromValue !== 0 &&
          data.abnormalToValue !== 0 &&
          data.diffDiagnosis
       ) {
          totalHeight += 345 / 8;
       }
 
       if (
          data.abnormalFromValue === 0 &&
          data.abnormalToValue === 0 &&
          data.historical?.length > 1
       ) {
          totalHeight += 345 / 5;
       }
       if (
          data.abnormalFromValue !== 0 &&
          data.abnormalToValue !== 0 &&
          data.historical?.length > 1
       ) {
          totalHeight += 345 / 4;
       }
 
       if (
          data.abnormalFromValue === 0 &&
          data.abnormalToValue === 0 &&
          data.diffDiagnosis &&
          data.historical?.length > 1
       ) {
          totalHeight += 345 / 3;
       }
       if (
          data.abnormalFromValue !== 0 &&
          data.abnormalToValue !== 0 &&
          data.diffDiagnosis &&
          data.historical?.length > 1
       ) {
          totalHeight += 345 / 3;
       }
    }
    // console.log("CompHeight", totalHeight);
    return totalHeight;
 }
 
 function insertHeaderContent(data) {
    let headerHtml = "";
 
    data?.forEach((item) => {
       switch (item.componentType) {
          case "Row":
             const rowHtml = `
                   <div class="grid grid-cols-2 gap-4">
                      ${item.children
                         .map((child) => {
                            switch (child.componentType) {
                               case "col":
                                  return `
                                        <div class="">
                                           ${child.children
                                              .map((subChild) => {
                                                 switch (
                                                    subChild.componentType
                                                 ) {
                                                    case "kv":
                                                       return generateKeyValueComponent(
                                                          subChild.key,
                                                          subChild.value
                                                       );
                                                    default:
                                                       return "";
                                                 }
                                              })
                                              .join("")}
                                        </div>`;
                               default:
                                  return "";
                            }
                         })
                         .join("")}
                   </div>`;
             headerHtml += rowHtml;
             break;
          default:
             break;
       }
    });
 
    return headerHtml;
 }
 
 function insertMainContent(report, pageHeight, idx) {
    const headerHeight =
       (calculateHeaderHeight(data) * 345) / (11 * 4) + 345 / 13;
 
    let testReportHeaderHtml = "";
 
    const doc = document.getElementById("content");
 
    switch (report.componentType) {
       case "title":
          const testTitleHtml = generateTitleComponent(
             report.value,
             report.color,
             report.icon
          );
 
          return testReportHeaderHtml + testTitleHtml;
       case "empty":
          return generateEmptyComponent();
 
       case "testReport":
          //  HTML for test report component
 
          let testReportHtml = "";
 
          if (report.abnormalFromValue === 0 || report.abnormalToValue === 0) {
             testReportHtml = generateTestReportWithoutBarComponent(report, idx);
 
             return testReportHtml;
          }
          testReportHtml = generateTestReportWithBarComponent(report, idx);
 
          const addReport = testReportHeaderHtml + testReportHtml;
 
          return addReport;
 
       default:
          return "";
    }
 }
 
 function generateKeyValueComponent(key, value) {
    return `
        <div class="my-">
           <div class="grid grid-cols-2 px-5 py-">
              <h5 class="text-base font-semibold">${key}</h5>
              <h6 class="text-base font-medium">: ${value}</h6>
           </div>
        </div>
        `;
 }
 
 function generateHeaderImageComponent(url, height) {
    return `
        <div class=" py-2">
           <img src=${url} alt="header" style="height: ${height}px;" class="w-full overflow-hidden  bg-gradient-to-r from-red-300 via-green-300 to-yellow-500" />
           </div>
        `;
 }
 function generateFooterImageComponent(url, height) {
    // return ``;
    return `<div class="py-2">
        <img src=${url} alt="header" style="height: ${height}px;" class="w-full overflow-hidden  bg-gradient-to-r from-red-300 via-green-300 to-yellow-500" />
           </div>
        `;
 }
 
 // Function to generate HTML for barcode component
 function generateBarcodeComponent(key, value) {
    return `
        <div class="grid grid-cols-2 px-5 py-2 ">
           <h5 class="text-base font-medium">${key}</h5>
           <img src="${value}" alt="barcode" />
 
        </div>`;
 }
 
 // Function to generate HTML for BMI chart component
 function generateBMIChartComponent(value, percentile) {
    return `
        <div>
           <div id="sub_center" class="grid grid-cols-2 px-5 py-1">
           <h5 class="text-base font-medium">BMI</h5>
           <h6 class="text-base font-normal">: ${value}</h6>
           </div>
 
           <div class="grid grid-cols-2 px-5 py-1">
           <h5 class="text-base font-medium">Percentile</h5>
           <h6 class="text-base font-normal">: ${percentile}</h6>
           </div>
        </div>`;
 }
 
 function generateTitleComponent(value, color, logo) {
    return `
        <div class="flex gap-2 items-center my- py-1">
           ${
              logo
                 ? `<img src="${logo}"  style="width: 30px; height: 30px" />`
                 : ""
           }
           <h3 style="color:${color}" class="text-xl  font-semibold">${value}</h3>
        </div>`;
 }
 
 //Function to generate HTML for test report component
 function generateTestReportHeaderComponent(tests) {
    let html = "";
 
    html += `
        <div class= 'flex flex-col'>
           <div class="flex justify-end py-[10px] pr-4  ">
              <div class = 'flex gap-3'>
                 <div class="flex gap-1 items-center">
                    <div class="size-4 rounded-full  border-2 border-red-500 flex items-center justify-center ">
                       <span class="size-3 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-500"></span>
                    </div>
                    <h3 class="text-xs font-bold">Abnormal</h3>
                 </div>
                 <div class="flex gap-1 items-center">
                    <div class="size-4 rounded-full  border-2 border-yellow-500 flex items-center justify-center ">
                       <span class="size-3 rounded-full bg-yellow-500 border-2 border-white ring-2 ring-yellow-500"></span>
                    </div>
                    <h3 class="text-xs font-bold">Borderline</h3>
                 </div>
                 <div class="flex gap-1 items-center">
                    <div class="size-4 rounded-full  border-2 border-green-700 flex items-center justify-center ">
                       <span class="size-3 rounded-full bg-green-700 border-2 border-white ring-2 ring-green-700"></span>
                    </div>
                    <h3 class="text-xs font-bold">Normal</h3>
                 </div>
              </div>
           </div>
 
           <div class="flex justify-between p-2 bg-[#cafbfb] text-[#023b3b] rounded-t-xl my-2">
              <div class="w-4/5 text-base font-bold ml-1">
                 TEST NAME
              </div>
              <div class="w-2/5 text-base font-bold">
                 RESULT / UNITS
              </div>
              <div class="w-2/5 text-base font-bold">
                 DELTA
              </div>
              <div class="w-4/5 text-base font-bold">
                 BIOLOGICAL REFERENCE INTERVAL
              </div>
           </div>
        </div>`;
    return html;
 }
 
 // A function that generates an empty component based on the provided height parameter.
 function generateEmptyComponent(height) {
    height = Math.ceil(Math.abs(height));
    // height = Math.floor(Math.abs(height));
 
    height = height <= 0.5 ? 0 : height;
 
    let emptyRows = "";
    emptyRows += "<div class='flex flex-col gap-1'>";
    for (let i = 0; i < height; i++) {
       emptyRows += `<div class= 'flex w-full'> </div>`;
    }
 
    emptyRows += "</div>";
 
    // console.log(emptyRows);
    return emptyRows;
 }
 
 function generateTestReportWithBarComponent(test, index) {
    let html = "";
 
    // tests?.forEach((test, index) => {
    let deltaImg = {
       HR: `<svg fill="#f20202" height="30" width="30" viewBox="-2.4 -2.4 28.80 28.80" xmlns="http://www.w3.org/2000/svg" stroke="#f20202" stroke-width="0.00024000000000000003" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></g></svg>`,
 
       LR: `<svg fill="#f20202" height="30" width="30" viewBox="-2.4 -2.4 28.80 28.80" xmlns="http://www.w3.org/2000/svg" stroke="#f20202" stroke-width="0.00024000000000000003" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></g></svg>`,
    };
 
    let abnormalImg = {
       AH: `<svg fill="#fa0000" height="25" width="30" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#fa0000" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke-width="17.919999999999998"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"> <polygon points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 "></polygon> </g></svg>`,
 
       AN: `<svg fill="#008000" height="25" width="30" viewBox="-25.6 -25.6 307.20 307.20" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#008000" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M232,128A104,104,0,1,1,128,24,104.12041,104.12041,0,0,1,232,128Z"></path> </g></svg>`,
 
       AL: `<svg fill="#f80d0d" height="25" width="30" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#f80d0d" stroke-width="19.456" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"> <polygon points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 "></polygon> </g></svg>`,
    };
 
    if (test.abnormalFlag == "") {
       test.abnormalFlag = "AN";
    }
 
    const arrowPosition = lineChartContent(
       0,
       test.abnormalFromValue,
       test.abnormalToValue,
       176,
       test.labResult
    );
 
    const fromValue = test?.abnormalFromValue;
    const toValue = test?.abnormalToValue;
 
    html += `
                 ${
                    test?.componentType == "empty"
                       ? `
                 <div class="flex p-10 mb-3 w-full"></div>
                 `
                       : `
                 <div class="test-report" data-index="${index}">
                    <div class="flex flex-col mb-1">
                       <div class="flex justify-between bg-[#f0f6fb] p-2">
                          <div class="flex w-full items-center py-1 gap-1">
                             <div>
                                ${
                                   test.abnormalFlag
                                      ? abnormalImg[`${test.abnormalFlag}`]
                                      : ""
                                }
                             </div>
                             <div class="text-base font-medium">${
                                test.testName
                             }</div>
                          </div>
                          <div class="flex gap-2 items-center w-2/5 text-sm font-normal">
                             <span class=" font-medium text-lg ml-5  ${
                                test.abnormalFlag == "AN"
                                   ? "text-black"
                                   : "text-red-500"
                             }">
                                ${test.labResult}
                             </span>
                             <div class="text-base font-normal">${test.uom}</div>
                          </div>
                          <div
                             class="flex flex-col gap-1 w-2/5 text-base font-medium justify-center"
                          >
                             <div class="">
                                ${
                                   test.deltaFlag
                                      ? deltaImg[`${test.deltaFlag}`]
                                      : ""
                                }
                             </div>
                             <div class="text-xs pl-[9px]">
                                ${test.deltaFlag ? `${test.deltaPer}` : ""}
                             </div>
                          </div>
 
 
                          <div class="flex flex-col gap-1 w-4/5 text-base font-normal py-[1px] pl-7">
                             <div id="arrow${
                                index + 1
                             }" style='margin-left : ${arrowPosition}px' >
                                <svg
                                   fill="#1b5e20"
                                   height="20"
                                   width="20"
                                   version="1.1"
                                   id="Layer_1"
                                   xmlns="http://www.w3.org/2000/svg"
                                   xmlns:xlink="http://www.w3.org/1999/xlink"
                                   viewBox="-51.2 -51.2 614.40 614.40"
                                   xml:space="preserve"
                                   stroke="#1b5e20"
                                >
                                   <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                   <g
                                      id="SVGRepo_tracerCarrier"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                   ></g>
                                   <g id="SVGRepo_iconCarrier">
                                      <g>
                                         <g>
                                            <path
                                               d="M509.144,2.16c-2.884-2.56-7.125-2.876-10.351-0.759l-242.79,159.07L13.212,1.401C9.995-0.715,5.746-0.4,2.861,2.16 c-2.876,2.56-3.686,6.741-1.963,10.189l247.467,494.933c1.451,2.893,4.403,4.719,7.637,4.719c3.234,0,6.187-1.826,7.637-4.719 L511.107,12.349C512.83,8.902,512.02,4.72,509.144,2.16z"
                                            ></path>
                                         </g>
                                      </g>
                                   </g>
                                </svg>
                             </div>
                             <div class="flex gap-0.5">
                                <div class="w-8  h-2 bg-red-600 rounded-l-lg"></div>
                                <div class="w-44  h-2 bg-green-800"></div>
                                <div class="w-8  h-2 bg-red-600 rounded-r-lg"></div>
                             </div>
                             <div class="flex pb-2">
                                <div class="w-14">
 
                                </div>
                                <div class="w-28 h-2 flex justify-between ">
                                   <div class="ml-[-30px]">
                                      ${
                                         test.abnormalFromValue == "0" &&
                                         test.abnormalToValue == "0"
                                            ? ""
                                            : test.abnormalFromValue
                                      }
                                   </div>
                                   <div class="mr-[-55px]">
                                      ${
                                         test.abnormalFromValue == "0" &&
                                         test.abnormalToValue == "0"
                                            ? ""
                                            : test.abnormalToValue
                                      }
                                   </div>
                                </div>
                                <div class="w-14 ">
 
                                </div>
                             </div>
                          </div>
                          
                 
 
 
                       </div>
 
                       <div class="flex flex-col bg-[#f4eaf5] rounded-b-md">
                          ${
                             test?.historical?.length > 1
                                ? `
                          <div class="flex justify-center">
                             <div
                                class="p-3 w-[800px] h-[200px] flex justify-center"
                                id="chartContainer${index - 0 + 1}"
                             ></div>
                          </div>
                          `
                                : ""
                          } ${
                            test.diffDiagnosis
                               ? `
                          <div
                             class="flex flex-col gap-4 p-3 mx-3 my-3 bg-white border-2 border-dotted border-violet-700 rounded-lg"
                          >
                             <div class="">
                                <div class="flex w-full gap-2">
                                   
                                   <div class="   w-2/5  text-base font-medium">
                                      Differential Diagnosis:
                                   </div>
                                   <div class="w-full ">${
                                      test?.diffDiagnosis
                                   }</div>
                                </div>
                             </div>
 
                             ${
                                test?.diffDiagnosisImg
                                   ? `
                             <div class="">
                                <img
                                   src="${test?.diffDiagnosisImg}"
                                   class="w-80 h-80 rounded-lg"
                                />
                             </div>
                             `
                                   : ""
                             }
                          </div>
                          `
                               : ``
                         }
                       </div>
                    </div>
                 </div>
        `
                 } `;
 
    // });
 
    return html;
 }
 
 function generateTestReportWithoutBarComponent(test, index) {
    let html = "";
 
    // tests.forEach((test, index) => {
    let deltaImg = {
       HR: `<svg fill="#f20202" height="30" width="30" viewBox="-2.4 -2.4 28.80 28.80" xmlns="http://www.w3.org/2000/svg"
 stroke="#f20202" stroke-width="0.00024000000000000003" transform="matrix(-1, 0, 0, 1, 0, 0)">
 <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
 <g id="SVGRepo_iconCarrier">
    <path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z">
    </path>
 </g>
 </svg>`,
 
       LR: `<svg fill="#f20202" height="30" width="30" viewBox="-2.4 -2.4 28.80 28.80" xmlns="http://www.w3.org/2000/svg"
 stroke="#f20202" stroke-width="0.00024000000000000003" transform="matrix(-1, 0, 0, -1, 0, 0)">
 <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
 <g id="SVGRepo_iconCarrier">
    <path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z">
    </path>
 </g>
 </svg>`,
    };
 
    let abnormalImg = {
       AH: `<svg fill="#fa0000" height="25" width="30" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" enable-background="new 0 0 512 512"
 xml:space="preserve" stroke="#fa0000" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke-width="17.919999999999998">
 <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.024">
 </g>
 <g id="SVGRepo_iconCarrier">
    <polygon points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 "></polygon>
 </g>
 </svg>`,
 
       AN: `<svg fill="#008000" height="25" width="30" viewBox="-25.6 -25.6 307.20 307.20" id="Flat"
 xmlns="http://www.w3.org/2000/svg" stroke="#008000" transform="matrix(-1, 0, 0, 1, 0, 0)">
 <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
 <g id="SVGRepo_iconCarrier">
    <path d="M232,128A104,104,0,1,1,128,24,104.12041,104.12041,0,0,1,232,128Z"></path>
 </g>
 </svg>`,
 
       AL: `<svg fill="#f80d0d" height="25" width="30" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" enable-background="new 0 0 512 512"
 xml:space="preserve" stroke="#f80d0d" stroke-width="19.456" transform="matrix(-1, 0, 0, -1, 0, 0)">
 <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
 <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.024">
 </g>
 <g id="SVGRepo_iconCarrier">
    <polygon points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 "></polygon>
 </g>
 </svg>`,
    };
 
    if (test.abnormalFlag == "") {
       test.abnormalFlag = "AN";
    }
 
    const fromValue = test?.abnormalFromValue;
    const toValue = test?.abnormalToValue;
 
    html += `
 ${
    test?.componentType == "empty"
       ? `
 <div class="flex p-10 mb-3 w-full"></div>
 `
       : `
 <div class="test-report" data-index="${index}">
 <div class="flex flex-col mb-1">
    <div class="flex justify-between bg-[#f0f6fb] p-2">
        <div class="flex w-full items-center py-1 gap-1">
            <div>
                ${test.abnormalFlag ? abnormalImg[`${test.abnormalFlag}`] : ""}
            </div>
            <div class="text-base font-medium">${test.testName}</div>
        </div>
        <div class="flex gap-2 items-center w-2/5 text-sm font-normal">
            <span class=" font-medium text-lg ml-5  ${
               test.abnormalFlag == " AN" ? "text-black" : "text-red-500"
            }">
                ${test.labResult}
            </span>
            <div class="text-base font-normal">${test.uom}</div>
        </div>
        <div class="flex flex-col gap-1 w-2/5 text-base font-medium justify-center">
            <div class="">
                ${test.deltaFlag ? deltaImg[`${test.deltaFlag}`] : ""}
            </div>
            <div class="text-xs pl-[9px]">
                ${test.deltaFlag ? `${test.deltaPer}` : ""}
            </div>
        </div>
 
 
        ${
           fromValue != 0 || toValue != 0
              ? `
        <div class="flex flex-col gap-1 w-4/5 text-base font-normal py-[1px] pl-7">
           
        </div>
        `
              : fromValue == 0 &&
                toValue == 0 &&
                `
        <div class="flex flex-col gap-1 w-4/5 text-base font-normal py-3 pl-7 mb-1">
 
        </div>`
        }
 
 
    </div>
 
    <div class="flex flex-col bg-[#f4eaf5] rounded-b-md">
        ${
           test?.historical?.length > 1
              ? `
        <div class="flex justify-center">
            <div class="p-3 w-[800px] h-[200px] flex justify-center" id="chartContainer${
               index - 0 + 1
            }"></div>
        </div>
        `
              : ""
        } ${
            test.diffDiagnosis
               ? `
        <div class="flex flex-col gap-4 p-3 mx-3 my-3 bg-white border-2 border-dotted border-violet-700 rounded-lg">
        <div class="">
        <div class="flex w-full gap-2">
           
           <div class="   w-2/5  text-base font-medium">
              Differential Diagnosis:
           </div>
           <div class="w-full ">${test?.diffDiagnosis}</div>
        </div>
     </div>
 
            ${
               test?.diffDiagnosisImg
                  ? `
            <div class="">
                <img src="${test?.diffDiagnosisImg}" class="w-80 h-80 rounded-lg" />
            </div>
            `
                  : ""
            }
        </div>
        `
               : ``
         }
    </div>
 </div>
 </div>
 `
 } `;
 
    // });
 
    return html;
 }
 
 function lineChartContent(
    startPixel,
    startValue,
    endValue,
    barLength,
    inputValue
 ) {
    if (inputValue < startValue) {
       return 16;
    } else if (inputValue > endValue) {
       return 224;
    }
 
    const unit = (endValue - startValue) / 0.1;
 
    const pixelPerUnit = barLength / unit;
 
    return ((inputValue - startValue) / 0.1) * pixelPerUnit + 32;
 }
 
 function downloadPDF() {
    window.jsPDF = window.jspdf.jsPDF;
    $("#download").click(function () {
       let height = $("#content").height();
       let width = $("#content").width();
       html2pdf()
          .set({
             html2canvas: {
                scale: 2, // Increase scale for better resolution
                logging: true, // Enable logging for debugging
                useCORS: true, // Use CORS to load images from different domains
             },
             filename: "report.pdf",
             jsPDF: {
                unit: "mm",
                format: ["250", "400"],
             },
          })
          .from(document.getElementById("content"))
          .save();
    });
 }
 