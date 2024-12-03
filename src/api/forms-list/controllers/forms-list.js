'use strict';

/**
 * forms-list controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forms-list.forms-list', ({ strapi }) => ({
    async serviceReportPdf(ctx){
        const {id} = ctx.params

        return id
    }
}))
