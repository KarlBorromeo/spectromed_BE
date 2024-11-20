module.exports = ({ env }) => ({
    'users-permissions': {
      config: {
        jwtSecret: process.env.JWT_SECRET,
        providers: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: `${process.env.APP_URL}/auth/callback/google`,
          },
        },
      },
    },
  });
  