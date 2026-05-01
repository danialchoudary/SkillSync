import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { getGoogleCallbackUrl, logGoogleOAuthConfig } from '../utils/oauthUrls.js';

export const configurePassport = () => {
  logGoogleOAuthConfig();

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
        callbackURL: getGoogleCallbackUrl(),
        proxy: true, // This tells Passport to trust Render's HTTPS proxy
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account did not provide an email address.'), null);
          }

          // Check if a user with this email already exists
          let user = await User.findOne({ email });

          if (!user) {
            // Create a new user with 'pending' role
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email,
              role: 'pending',
              isVerified: true, // Google accounts are considered verified
            });
          } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = profile.id;
            // Existing user might not have been verified
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          console.error('[Passport] Google strategy error:', err);
          return done(err, null);
        }
      }
    )
  );
};
