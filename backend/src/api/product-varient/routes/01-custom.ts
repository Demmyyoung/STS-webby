
export default {
    routes: [
      {
        method: 'POST',
        path: '/product-varients/decrement',
        handler: 'product-varient.decrement',
        config: {
            auth: false, // Ensure public access if consistent with other endpoints, OR require auth if using tokens
            policies: [],
            middlewares: [],
        },
      },
    ],
  };
