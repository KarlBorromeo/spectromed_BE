module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/forms-list/service-report/:id',
            handler: 'forms-list.serviceReportPdf',
        },
    ],
    
}