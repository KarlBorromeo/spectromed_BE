'use strict';

/**
 * forms-list service
 */

// Imported Libraries
const jsdom = require('jsdom');
const pdfPrinter = require('pdfmake');
const htmlToPdfMake = require('html-to-pdfmake');
const moment = require('moment');
// const sharp = require('sharp');

// Configuring default value of pdfmake
const { JSDOM } = jsdom;
const { window } = new JSDOM('');
const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
};
const printer = new pdfPrinter(fonts);
const docDefaultStyle = {
  defaultStyle: {
    fontSize: 8,
    font: 'Helvetica',
  },
  styles: {
    'text-center': {
      alignment: 'center',
    },
    'text-left': {
      alignment: 'left',
    },
    'text-right': {
      alignment: 'right',
    },
    'text-justify': {
      alignment: 'justify',
    },
    'mt-2': {
      marginTop: 4,
    },
    'mt-4': {
      marginTop: 8,
    },
    'mt-6': {
      marginTop: 16,
    },
    'mt-8': {
      marginTop: 32,
    },
    'red--text': {
      color: 'red',
    },
    'text-uppercase': {
      uppercase: true,
    },
  },
  pageBreakBefore: (currentNode) => {
    return (
      currentNode.style && currentNode.style.includes('pdf-pagebreak-before')
    );
  },
};

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::forms-list.forms-list', ({ strapi }) => ({
  // BG REMOVE AND IMAGE TO BUFFER
    // async getTransparentImage(imagePath) {
    //   const imageBuffer = await sharp(imagePath)
    //     .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } }) // Make white background transparent
    //     .toFormat('png') // Ensure output is PNG to support transparency
    //     .toBuffer(); // Return as Buffer
    
    //   return imageBuffer;
    // },

    async printServiceReport(data){
        return new Promise(async (resolve, reject) => {
            try {
                const documentParts = await this.BufferServiceReport(data)
                const docDefinition = {
                    pageMargins: [72.5, 800, 73, 0],
                    pageSize: 'A4',
                    pageOrientation: 'portrait',
                    info: {
                    title: 'Service Report',
                    author: 'SpectroMed',
                    },
                    background: [
                      {
                        image: 'src/assets/sr_backgound.png', // Replace with your Base64 string
                        width: 595.28, // Adjust the width of the background image
                        height: 841.89, // Adjust the height of the background image
                        opacity: 1, // Optional: Set transparency (0.1 to 1.0)
                      },
                    ],
                    // content: [documentParts.html],
                    ...docDefaultStyle,
                    header: documentParts.header
                };

                const pdfDoc = printer.createPdfKitDocument(docDefinition);
        
                const chunks = [];
                let result;
                pdfDoc.on('data', function (chunk) {
                    chunks.push(chunk);
                });
                pdfDoc.on('end', async function () {
                    result = Buffer.concat(chunks);
                    resolve('data:application/pdf;base64,' + result.toString('base64'));
                });
    
                pdfDoc.end();
            } catch (error) {
                reject(error);
            }
        })
    },

    async BufferServiceReport(data){
        // FETCH SIGNATURE WITHOUT BACKGROUND
        const imagePath = `public/uploads/${data.user.signature.hash}${data.user.signature.ext}`
        // const imageBuffer = await this.getTransparentImage(imagePath);

        const header = {
          margin: [72.5,25,73,0],
          stack: [
            // First Table, Image and SERVICE REPORT VALUE
            {
              table:{
                widths: ['83.5%','16.5%'],
                body: [
                  [
                    // SpectruMed Image
                    {
                      image: 'src/assets/spectruLogo.png',
                      height: 55,
                      width: 178.5,
                      margin: [-5,-8,0,0],
                      border: [false,false],
                    },
                    // Service Report table
                    {
                      border: [false,false],
                      margin: [0,0,-5,0],
                      table:{
                        widths: ['20%','80%'],
                        body: [
                          // Service Report Text
                          [
                            {
                              colSpan: 2,
                              text: 'SERVICE REPORT',
                              fontSize: 7.5,
                              noWrap:true,
                              margin: [-1,0,0,0],
                              color: 'white',
                              fillColor: 'black',
                            },
                            {},
                          ],
                          // SR No.
                          [
                            {
                              colSpan: 2,
                              border: [false,false],
                              margin:[-5,0,-5,-2],
                              table:{
                                widths: ['20%','80%'],
                                body: [
                                  [
                                    // SR NO TEXT
                                    {
                                      text: 'S.R. No.:',
                                      fontSize: 6,
                                      noWrap: true,
                                      border: [false,false],
                                      margin: [-9,3,0,-1],
                                    },
                                    // SR NO VALUE
                                    {
                                      text: data.form.srNumber,
                                      noWrap: true,
                                    }
                                  ],
                                ],
                              }
                            },{}
                          ],
                          // DATE
                          [
                            {
                              colSpan: 2,
                              border: [false,false],
                              margin:[-5,-2,-5,-2],
                              table:{
                                widths: ['20%','80%'],
                                body: [
                                  [
                                    // DATE TEXT
                                    {
                                      text: 'Date:',
                                      fontSize: 6,
                                      noWrap: true,
                                      border: [false,false],
                                      margin: [-1,3,0,-1],
                                    },
                                    // DATE VALUE
                                    {
                                      text: data.form.date,
                                      noWrap: true,
                                    }
                                  ],
                                ],
                              }
                            },{}
                          ],
                        ],
                      }
                    }
                  ]
                ],
              }
            },
            // SECOND TABLE, (BUSINESS NAME,CUSTOMER NAME,ADDRESS, CONTACT)
            {
              margin: [0,4,0,0],
              table:{
                widths: ['21.8%','38.2%','24.5%','15.5%'],
                heights: [7,7,7,20],
                body: [
                  // BUSINESS AND CUSTOMER TITLE ROW
                  [
                    {
                      text: 'BUSINESS NAME',
                      fillColor: 'black',
                      color: 'white',
                      // margin: [0,1,0,0],
                    },{},
                    {
                      text: 'CUSTOMER NAME',
                      fillColor: 'black',
                      color: 'white',
                      // margin: [0,1,0,0],
                    },{},
                  ],
                  // BUSINESS AND CUSTOMER DATA ROW
                  [
                    {
                      text: data.form.businessName,
                      colSpan: 2,
                    },{},
                    {
                      text: data.form.customerName,
                      colSpan: 2,
                    },{},
                  ],
                  // Address AND Contact TITLE ROW
                  [
                    {
                      text: 'Address',
                      fillColor: 'black',
                      color: 'white',
                      // margin: [0,1,0,0],
                    },{},
                    {
                      text: 'Contact Details:',
                      fillColor: 'black',
                      color: 'white',
                      // margin: [0,1,0,0],
                    },{},
                  ],
                  // Address AND Contact DATA ROW
                  [
                    {
                     text: data.form.address,
                     colSpan: 2,
                     lineHeight: 1.6,
                     margin: [0,0,0,-4],
                    },{},
                    {
                      text: 'CP #: '+(data.form.mobileNumber ? '0'+data.form.mobileNumber  :'') + '\n' + 'Tele #: ' + data.form.telephoneNumber,
                      colSpan: 2,
                      lineHeight: 1.6,
                      margin: [0,0,0,-4],
                    },{},
                  ],
                ],
              }
            },
            // THIRD TABLE (SYSTEM,SERVICE,SERIAL NO.)
            {
              margin: [0,2,0,0],
              // TWO COLUMNS LEFT AND RIGHT
              columns: [
                {
                  width: '59.1%',
                  margin: [0,0,-1,0],
                  table: {
                    widths: ['36.5%','*'],
                    heights: 7.9,
                    body:[
                      // SYSTEM TYPE TITLE
                      [
                        {
                          text: 'SYSTEM TYPE',
                          fillColor: 'black',
                          color: 'white',
                        },
                        { text: '',border: [true,true,false,true],},
                      ],
                      // SYSTEM TYPE DATA
                      [
                        {
                          text: data.form.systemType,
                          colSpan: 2,
                          border: [true,true,false,true],
                        },{},
                      ],
                       // SERIAL TITLE
                       [
                        {
                          text: 'SERIAL NO.',
                          fillColor: 'black',
                          color: 'white',
                        },
                        { text: '',border: [true,true,false,true],},
                      ],
                      // SERIAL DATA
                      [
                        {
                          text: data.form.serialNumber,
                          colSpan: 2,
                          border: [true,true,false,true],
                        },{},
                      ],
                    ],
                  }
                },
                {
                  width: '40.9%',
                  table: {
                    widths: ['62%','*'],
                    heights: 7,
                    body:[
                      // SERVICE TYPE TITLE ROW
                      [
                        {
                          text: 'Service Type',
                          fillColor: 'black',
                          color: 'white',
                        },
                        { text: '', border: [true,true,true,false],},
                      ],
                      // SERVICE TYPE BOX: REPAIR PM-CHARGED, OTHERS
                      [
                        {
                          colSpan: 2,
                          margin:[5.5,0,-3,0],
                          border: [true,false,true,false],
                          table:{
                            widths: ['0%','42%','0%','*','0%','*'],
                            body: [
                              [
                                // REPAIR BOX
                                {
                                  ...(data.form.serviceType === 'Repair' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'Repair',
                                  fontSize: 7,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                // PM CHANGE BOX
                                {
                                  ...(data.form.serviceType === 'PM-Charge' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'PM-Charged',
                                  fontSize: 7,
                                  noWrap: true,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                // OTHERS BOX
                                {
                                  ...(
                                    (
                                      data.form.serviceType === 'Repair'||
                                      data.form.serviceType === 'PM(Warrantly)'||
                                      data.form.serviceType === 'PM-SC'||
                                      data.form.serviceType === 'PM-Charge'||
                                      data.form.serviceType === 'Upgrade'||
                                      data.form.serviceType === 'Installation' ||
                                      data.form.serviceType === null
                                    ) 
                                    ? { text: '' }
                                    : { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                  ),
                                },
                                {
                                  text: 'Others',
                                  fontSize: 7,
                                  noWrap:true,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                              ],
                            ],
                          },
                        },{},
                      ],
                      // SERVICE TYPE BOX: PM WARRANTY and UPGRADE
                      [
                        {
                          colSpan: 2,
                          margin:[5.5,-4,-3,0],
                          border: [true,false,true,false],
                          table:{
                            widths: ['0%','42%','0%','*','0%','*'],
                            body: [
                              [
                                // PM (Warranty) BOX
                                {
                                  ...(data.form.serviceType === 'PM(Warrantly)' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'PM (Warranty)',
                                  fontSize: 7,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                // Upgrade BOX
                                {
                                  ...(data.form.serviceType === 'Upgrade' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'Upgrade',
                                  fontSize: 7,
                                  noWrap: true,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                {text: '', border: [false,false], colSpan: 2},{},
                              ],
                            ],
                          },
                        },{},
                      ],
                      // SERVICE TYPE BOX: PM-SC and Installation
                      [
                        {
                          colSpan: 2,
                          margin:[5.5,-4,-3,0],
                          border: [true,false,true,true],
                          table:{
                            widths: ['0%','42%','0%','*','0%','*'],
                            body: [
                              [
                                // PM-SC BOX
                                {
                                  ...(data.form.serviceType === 'PM-SC' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'PM-SC',
                                  fontSize: 7,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                // Installation BOX
                                {
                                  ...(data.form.serviceType === 'Installation' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  ),
                                },
                                {
                                  text: 'Installation',
                                  fontSize: 7,
                                  noWrap: true,
                                  margin:[-3,0,0,-2],
                                  border: [false,false,]
                                },
                                {
                                  text: '', 
                                  border: [false,false], 
                                  colSpan: 2,
                                  margin:[-3,0,0,-2],
                                },{},
                              ],
                            ],
                          },
                        },{},
                      ],
                    ],
                  }
                },
              ],
            },
            // FOURTH TABLE (REASON FOR SERVICE, SERVICE RENDERED)
            {
              margin: [0,2,0,0],
              table:{
                widths: ['21%','79%'],
                heights: [7,20,7,114.5],
                body: [
                  // REASON FOR SERVICE TITLE
                  [
                    {
                      text: 'REASON FOR SERVICE',
                      fillColor: 'black',
                      color: 'white',
                    },{},
                  ],
                  // REASON FOR SERVICE DATA ROW
                  [
                    {
                      text: data.form.reason,
                      colSpan: 2,
                      lineHeight: 1.6,
                      margin: [0,0,0,-4],
                    },{},
                  ],
                  // SERVICE RENDERED TITLE
                  [
                    {
                      text: 'SERVICE RENDERED',
                      fillColor: 'black',
                      color: 'white',
                    },{},
                  ],
                  // SERVICE RENDERED DATA ROW
                  [
                    {
                      text: data.form.serviceRendered,
                      colSpan:2,
                      lineHeight: 1.6,
                      margin: [0,0,0,-4],
                    },{},
                  ],
                ],
              }
            },
            // FIFTH TABLE (RECOMMENDATIONS)
            {
              margin: [0,2,0,0],
              // TWO COLUMNS LEFT AND RIGHT
              columns: [
                {
                  width: '59.1%',
                  margin: [0,0,-1,0],
                  table: {
                    widths: ['36.5%','63.5%'],
                    heights: [7,43.5],
                    body:[
                      // RECOMMENDATIONS TITLE
                      [
                        {
                          text: 'RECOMMENDATIONS',
                          fillColor: 'black',
                          color: 'white',
                        },{},
                      ],
                      // RECOMMENDATIONS DATA
                      [
                        {
                          text: data.form.recommendation,
                          colSpan: 2,
                          lineHeight: 1.6,
                          margin: [0,0,0,-4],
                          border: [true,true,false,true],
                        },{},
                      ],
                    ],
                  }
                },
                // SECOND COLUMN
                {
                  width: '40.9%',
                  table: {
                    widths: ['62%','*'],
                    heights: 7,
                    body:[
                      // TITLE ROW
                      [
                        {
                          text: '',
                          fillColor: 'black',
                          color: 'white',
                        },
                        { text: '', border: [true,true,true,false],},
                      ],
                      // Operates Normally, Others 
                      [
                        {
                          colSpan: 2,
                          margin:[3,0,-3,0],
                          border: [true,false,true,false],
                          table:{
                            widths: ['0%','60%','0%','14%','*'],
                            body: [
                              [
                                // Operates Normally BOX
                                {
                                  ...(data.form.recommendChoice === 'Operates Normally' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  )
                                },
                                {
                                  text: 'Operates Normally',
                                  fontSize: 7,
                                  margin:[3,0,0,-3],
                                  border: [false,false,]
                                },
                                // Others BOX
                                {
                                  ...(
                                    (
                                      data.form.recommendChoice === 'Operates Normally' ||
                                      data.form.recommendChoice === 'Awaiting Parts' ||
                                      data.form.recommendChoice === 'Needs Recall' ||
                                      data.form.recommendChoice === null
                                    )
                                    ? { text: '' }
                                    : { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                  )
                                },
                                {
                                  text: 'Others',
                                  fontSize: 7,
                                  noWrap: true,
                                  margin:[-1,0,0,-3],
                                  border: [false,false,]
                                },
                                // Underline value
                                {
                                  ...(
                                    (
                                      data.form.recommendChoice === 'Operates Normally' ||
                                      data.form.recommendChoice === 'Awaiting Parts' ||
                                      data.form.recommendChoice === 'Needs Recall'
                                    )
                                    ? { text: '' }
                                    : { text: data.form.recommendChoice ? data.form.recommendChoice.substring(0, 6) : '' }
                                  ),
                                  noWrap: true,
                                  margin:[-3,0,0,-3],
                                  border: [false,false,false,true],
                                },
                              ],
                            ],
                          },
                        },{},
                      ],
                      // AWAITING PARTS
                      [
                        {
                          colSpan: 2,
                          margin:[3,-2,-3,0],
                          border: [true,false,true,false],
                          table:{
                            widths: ['0%','63%','0%','14%','*'],
                            body: [
                              [
                                // Awaiting Parts BOX
                                {
                                  ...(data.form.recommendChoice === 'Awaiting Parts' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  )
                                },
                                {
                                  text: 'Awaiting Parts',
                                  fontSize: 7,
                                  margin:[3,0,0,-3],
                                  border: [false,false,]
                                },
                                // SPACE
                                {
                                  text: '',
                                  border: [false,false]
                                },
                                // UNDERLINE
                                {
                                  ...(
                                    (
                                      data.form.recommendChoice === 'Operates Normally' ||
                                      data.form.recommendChoice === 'Awaiting Parts' ||
                                      data.form.recommendChoice === 'Needs Recall'
                                    )
                                    ? { text: '' }
                                    : { text: data.form.recommendChoice ? data.form.recommendChoice.substring(6, 18) : ''}
                                  ),
                                  noWrap: true,
                                  margin:[0,0,0,-3],
                                  border: [false,false,false,true],
                                  colSpan: 2
                                },{},
                              ],
                            ],
                          },
                        },{},
                      ],
                      // Needs Recall
                      [
                        {
                          colSpan: 2,
                          margin:[3,-2,-3,6.7],
                          border: [true,false,true,true],
                          table:{
                            widths: ['0%','63%','0%','14%','*'],
                            body: [
                              [
                                // Needs Recall BOX
                                {
                                  ...(data.form.recommendChoice === 'Needs Recall' 
                                    ? { 
                                        image: 'src/assets/checkmark.png', 
                                        height: 10, 
                                        width: 10, 
                                        margin: [-5, -2, 0, -4] 
                                      }
                                    : { text: '' }
                                  )
                                },
                                {
                                  text: 'Needs Recall',
                                  fontSize: 7,
                                  margin:[3,0,0,-3],
                                  border: [false,false,]
                                },
                                // SPACE
                                {
                                  text: '',
                                  border: [false,false]
                                },
                                {
                                  ...(
                                    (
                                      data.form.recommendChoice === 'Operates Normally' ||
                                      data.form.recommendChoice === 'Awaiting Parts' ||
                                      data.form.recommendChoice === 'Needs Recall'
                                    )
                                    ? { text: '' }
                                    : { text: data.form.recommendChoice ? data.form.recommendChoice.substring(18) : ''}
                                  ),
                                  noWrap: true,
                                  margin:[0,0,0,-3],
                                  border: [false,false,false,true],
                                  colSpan: 2
                                },{},
                              ],
                            ],
                          },
                        },{},
                      ],
                    ],
                  }
                },
              ],
            },
            // SIXTH TABLE (PARTS REPLACED)
            {
              margin: [0,2,0,0],
              table: {
                widths: ['5.5%','24.7%','27.3%','42.5%'],
                heights: 7,
                body:[
                  // PARTS REPLACED TEXT
                  [
                    {
                      text: 'PARTS REPLACED',
                      alignment: 'center',
                      colSpan: 4,
                      fillColor: 'black',
                      color: 'white',
                    },{},{},{},
                  ],
                  // HEADER TITLE ROW
                  [
                    {
                      text:'QTY',
                      alignment: 'center',
                    },
                    {
                      text: 'PART ITEM',
                      alignment: 'center',
                    },
                    {
                      text: 'P/N & S/N',
                      alignment: 'center',
                    },
                    {
                      text: 'REMARKS',
                      alignment: 'center',
                    },
                  ],
                  // DATA FIRST ROW
                  [
                    {
                      text: data.form.partsReplaced[0].quantity || '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[0].partItem || '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[0].pnsn || '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[0].remarks || '',
                      noWrap: true,
                      alignment: 'center',
                    },
                  ],
                  // DATA SECOND ROW
                  [
                    {
                      text: data.form.partsReplaced[1] ? data.form.partsReplaced[1].quantity : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[1] ? data.form.partsReplaced[1].partItem : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[1] ? data.form.partsReplaced[1].pnsn : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[1] ? data.form.partsReplaced[1].remarks : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                  ],
                  // DATA THIRD ROW
                  [
                    {
                      text: data.form.partsReplaced[2] ? data.form.partsReplaced[2].quantity : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[2] ? data.form.partsReplaced[2].partItem : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[2] ? data.form.partsReplaced[2].pnsn : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[2] ? data.form.partsReplaced[2].remarks : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                  ],
                  // DATA FOURTH ROW
                  [
                    {
                      text: data.form.partsReplaced[3] ? data.form.partsReplaced[3].quantity : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[3] ? data.form.partsReplaced[3].partItem : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[3] ? data.form.partsReplaced[3].pnsn : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[3] ? data.form.partsReplaced[3].remarks : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                  ],
                  // DATA FIFTH ROW
                  [
                    {
                      text: data.form.partsReplaced[4] ? data.form.partsReplaced[4].quantity : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[4] ? data.form.partsReplaced[4].partItem : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[4] ? data.form.partsReplaced[4].pnsn : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                    {
                      text: data.form.partsReplaced[4] ? data.form.partsReplaced[4].remarks : '',
                      noWrap: true,
                      alignment: 'center',
                    },
                  ],
                ],
              }
            },
            // SEVENTH TABLE (SIGNATURE, TIME, WORKING)
            {
              margin: [0,2,0,0],
              // THREE COLUMNS
              columns: [
                // TECHNICAL REPRESENTATIVE NAME & SIGNATURE
                {
                  width: '44%',
                  // margin: [0,0,-1,0],
                  table: {
                    widths: ['100%'],
                    body: [
                      // SIGNATURE AND TITLE TABLE
                      [
                        {
                          margin: [14,0,5,0],
                          table:{
                            widths:['100%'],
                            heights: [22,6,7],
                            body:[
                              // Signature
                              [
                                {
                                  // image: `data:image/png;base64,${imageBuffer.toString('base64')}`,
                                  image: imagePath,
                                  height: 30,
                                  width: 70,
                                  alignment: 'center',
                                  noWrap: true,
                                  border: [false,false],
                                  margin: [0,3,0,-30],
                                },
                              ],
                              // Name
                              [
                                {
                                  text: `${data.user.firstName ? data.user.firstName.toUpperCase() : ''} ${data.user.lastName ? data.user.lastName.toUpperCase() : ''}`,
                                  alignment: 'center',
                                  noWrap: true,
                                  border: [false,false,false,true],
                                  margin: [0,0,0,-10],
                                },
                              ],
                              // Title
                              [
                                {
                                  text: 'Technical Representative\nName & Signature',
                                  alignment: 'center',
                                  border:[false,false],
                                  lineHeight: 1.6,
                                  margin: [0,0,0,-5.5],
                                },
                              ]
                            ],
                          }
                        },
                      ],
                    ],
                  }
                },
                //  TRAVEL, ARRIVAL, DEPARTURE
                {
                  width: '36.5%',
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        {
                          border: [false,true,true,true],
                          margin:[0,13.5,14.5,10.5],
                          table:{
                            widths: ['58%','42%'],
                            body: [
                              // Travel Time Row
                              [
                                {
                                  text: 'Travel Time:',
                                  border: [false,false],
                                  margin: [-1.5,0,0,0],
                                },
                                {
                                  text: data.form.travelTime || '',
                                  alignment: 'center',
                                  noWrap: true,
                                  border: [false,false,false,true],
                                },
                              ],
                              // Arrival Time Row
                              [
                                {
                                  text: 'Arrival Time:',
                                  border: [false,false],
                                  margin: [-1.5,0,0,0],
                                },
                                {
                                  text: data.form.arrivalTime || '',
                                  alignment: 'center',
                                  noWrap: true,
                                  border: [false,false,false,true],
                                },
                              ],
                              // Departure Time Row
                              [
                                {
                                  text: 'Departure Time:',
                                  border: [false,false],
                                  margin: [-1.5,0,0,0],
                                },
                                {
                                  text: data.form.departureTime || '',
                                  alignment: 'center',
                                  noWrap: true,
                                  border: [false,false,false,true],
                                },
                              ],
                            ],
                          }
                        }
                      ],
                    ],
                  }
                },
                // WORKING TIME
                {
                  width: '19.5%',
                  table:{
                    widths: ['50%','50%'],
                    heights: [20,7,22.5],
                    body:[
                      // Working Time text
                      [
                        {
                          text: 'WORKING TIME',
                          margin: [0,2,0,0],
                          alignment: 'center',
                          border: [false,true,true,true],
                          colSpan: 2,
                        },{}
                      ],
                      // Start and End Text
                      [
                        {
                          text: 'Start:',
                          margin: [0,2,0,0],
                          alignment: 'center',
                          border: [false,true,true,true],
                        },
                        {
                          text: 'End:',
                          margin: [0,2,0,0],
                          alignment: 'center',
                          border: [false,true,true,true],
                        },
                      ],
                      // Start and End Data Row
                      [
                        {
                          text: data.form.startTime,
                          alignment: 'center',
                          border: [false,true,true,true],
                          noWrap: true,
                        },
                        {
                          text: data.form.endTime,
                          alignment: 'center',
                          border: [false,true,true,true],
                          noWrap: true,
                        },
                      ],
                    ],
                  },
                }
              ],
            },
            // EIGHT TABLE (ACKNOWLEDGEMENT)
            {
              margin: [0,4,0,0],
              table: {
                widths: ['100%'],
                body:[
                  // Acknowledgement
                  [
                    {
                      margin: [26.5,4.5,14.5,0],
                      table:{
                        widths: ['41%','39.3%','19.7%'],
                        body:[
                          // Acknowledgement Title
                          [
                            {
                              text: 'ACKNOWLEDGEMENT',
                              alignment: 'center',
                              bold: true,
                              fontSize: 10,
                              colSpan: 3,
                              border: [false,false],
                            },{},{},
                          ],
                          // Acknowledgemen Text
                          [
                            {
                              text: 'I/We confirm that the above spare parts have been replaced / machine has been repaired to our satisfaction\nSpare parts ordered were received in good physical condition',
                              alignment: 'center',
                              lineHeight: 1.6,
                              fontSize: 6,
                              colSpan: 3,
                              border: [false,false],
                              margin: [0,5,0,0],
                            },{},{},
                          ],
                          // Signature Row
                          [
                            // Signature Here
                            {
                              text: '',
                              noWrap: true,
                              border: [false,false],
                            },
                            {
                              text: '',
                              border: [false,false],
                            },
                            {
                              text: '',
                              noWrap: true,
                              border: [false,false],
                            },
                          ],
                          // DATA ROW
                          [
                            {
                              text: '',
                              noWrap: true,
                              border: [false,false,false,true],
                            },
                            {
                              text: '',
                              border: [false,false],
                            },
                            {
                              text: data.form.ackDate || '',
                              alignment: 'center',
                              noWrap: true,
                              border: [false,false,false,true],
                            },
                          ],
                          // Customer Title and Date Title Row
                          [
                            {
                              text: 'Customer Name & Signature',
                              alignment: 'center',
                              border: [false,false],
                            },
                            {
                              text: '',
                              border: [false,false],
                            },
                            {
                              text: 'Date',
                              alignment: 'center',
                              border: [false,false],
                            },
                          ],
                          // Service you can trust
                          [
                            {
                              colSpan: 3,
                              // alignment: 'center',
                              image: 'src/assets/service-you-can-trust.png',
                              height: 50,
                              width: 152.8,
                              margin: [130,-5.8,0,-12], // 137.5
                              border: [false,false],
                            },{},{}
                          ]
                        ],
                      }
                    },
                  ],
                  // Address
                  [
                    {
                      text: 'Spectrumed Inc. l No. 16 Sta. Potenciana St., Urdaneta, Makati City, Philippines l Tel.:(632) 822 2888 l Fax:(632) 822 38888',
                      border: [false,false],
                      fontSize: 6,
                      margin: [0,2,0,0],
                      alignment: 'center',
                    },
                  ],
                ],
              },
            },
          ],
        }

        return {
            header,
            // html: htmlToPdfMake(html, {
            //     window,
            //     tableAutoSize: true,
            // }),
        }
    }

}))
