'use strict';

/**
 * forms-list controller
 */
const nodemailer = require("nodemailer")
const email = process.env.MAILER_USER

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: process.env.MAILER_PASS
  },
});

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
            ctx.set('Content-Disposition', 'attachment; filename=sprectromed.pdf');

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
    },

    async sendPdfToEmail(ctx) {
        const { id } = ctx.params;
        const { userId } = ctx.params;
        const data = ctx.request.body.data
        // Fetch the data for the given ID

        console.log( id , userId, data);

        const userData = await strapi.db.query('plugin::users-permissions.user').findOne({
            select: ['firstName', 'lastName'],
            where : { id: userId },
            populate: true,
        })

        const finalData = {
            form: data.formData,
            user: userData,
        }

        try {
            // Call the service to generate the PDF buffer
            let buffer
            if(data.category === 'service-report'){
                const base64Data = await strapi.service('api::forms-list.forms-list').printServiceReport(finalData);

                // Remove the Base64 prefix if present
                const base64Content = base64Data.replace(/^data:application\/pdf;base64,/, '');

                // Convert Base64 string to Buffer
                buffer = Buffer.from(base64Content, 'base64');
            }

            // SENDING THE EMAIL TO THE RECEPIENT
            const info = await transporter.sendMail({
                from: email,
                to: data.recepient,
                subject: `${data.filename}`,
                text: `Please find the attached PDF. \n\n${data.message}`,
                attachments: [
                    {
                        filename: `${data.filename}.pdf`,
                        content: buffer,
                        contentType: 'application/pdf',
                    },
                ],
            })

            if(info){
                return 'Success'
            }
          
        } catch (error) {
            console.error('Error Sending PDF:', error);
            ctx.badRequest('Failed to send PDF');
        }
    },
}));

