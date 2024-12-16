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

        const userData = await strapi.db.query('plugin::users-permissions.user').findOne({
            select: ['firstName', 'lastName'],
            where : { id: data.userId },
            populate: true,
        })

        const finalData = {
            form: data.formData,
            user: userData,
        }

        try {
            // Call the service to generate the PDF buffer
            const buffer = await strapi.service('api::forms-list.forms-list').printServiceReport(finalData);

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

    async fetchListById(ctx){

        const { search, limit, offset } = ctx.query
        const { id } = ctx.params

        // console.log(search, limit, offset, id);
        // WHERE CONDITION
        const whereConditions = {
            userId: id,
        };
        if (search) {
            whereConditions.filename = { $containsi: search }; // Case-insensitive search
        }
        const entries = await strapi.db.query('api::forms-list.forms-list').findWithCount({
            select: ['*'],
            where: whereConditions,
            limit: limit,
            offset: offset,
            orderBy: { publishedAt: 'DESC' },
        });
        
        // Return both data and pagination info

        // console.log(entries[0],'aw:',entries[1]);
        return {
            data: entries[0],
            total: entries[1]
        }
    }
}));

