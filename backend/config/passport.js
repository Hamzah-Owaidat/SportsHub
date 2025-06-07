const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Extract useful info and pass to controller via req.user
      const userProfile = {
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
      };
      return done(null, userProfile);
    }
  )
);
