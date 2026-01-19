import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product-varient.product-varient', ({ strapi }) => ({
  async decrement(ctx) {
    const { id } = ctx.request.body;

    if (!id) {
      return ctx.badRequest('Missing variant ID');
    }

    try {
      // 1. Fetch the variant
      const formattedId = id; // Depending on if it's documentId or regular id, might need adjustment.
      // Strapi 5 uses documentId often, but let's try standard findOne first or entityService.

      // Using Entity Service is safer for generic updates
      const variant = await strapi.entityService.findOne('api::product-varient.product-varient', id);

      if (!variant) {
        return ctx.notFound('Variant not found');
      }

      // 2. Check stock
      if (variant.quantity < 1) {
        return ctx.badRequest('Out of stock');
      }

      // 3. Decrement
      const updatedVariant = await strapi.entityService.update('api::product-varient.product-varient', id, {
        data: {
          quantity: variant.quantity - 1,
        },
      });

      return updatedVariant;
    } catch (err) {
      ctx.body = err;
    }
  },
}));
