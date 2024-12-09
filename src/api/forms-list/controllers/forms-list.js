'use strict';

/**
 * forms-list controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forms-list.forms-list', ({ strapi }) => ({
    async serviceReportPdf(ctx) {
        const { id } = ctx.params;

        // Fetch the data for the given ID
        const data = await strapi.db.query('api::forms-list.forms-list').findOne({
            where: { id: id },
        });

        if (!data) {
            return ctx.notFound('Data not found');
        }

        try {
            // Call the service to generate the PDF buffer
            const buffer = await strapi.service('api::forms-list.forms-list').printServiceReport(data);

            // Set the response headers to indicate it's a PDF file
            ctx.set('Content-Type', 'application/pdf');
            ctx.set('Content-Disposition', 'attachment; filename=inventory_itr.pdf');

            // Send the buffer as the response body
            ctx.body = buffer;
        } catch (error) {
            console.error('Error generating PDF:', error);
            ctx.badRequest('Failed to generate PDF');
        }
    },
}));

