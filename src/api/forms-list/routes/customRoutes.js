module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/forms-list/service-report/:id',
            handler: 'forms-list.serviceReportPdf',
        },

        {
            method: 'GET',
            path: '/forms-list/user/forms/:id',
            handler: 'forms-list.fetchListById',
        },

        {
            method: 'POST',
            path: '/forms-list/email/:id/:userId',
            handler: 'forms-list.sendPdfToEmail',
        }
    ],
    
}