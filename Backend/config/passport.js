import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
        callbackURL: '/auth/google/callback',
        proxy: true, // This tells Passport to trust Render's HTTPS proxy
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if a user with this email already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // Create a new user with 'pending' role
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
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
