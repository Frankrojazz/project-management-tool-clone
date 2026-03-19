import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.CLIENT_URL || process.env.CLIENT_URL_DEV || 'http://localhost:5173';

function generateAvatar(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function generateColor(): string {
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function initializePassport(db: any) {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

          if (!user) {
            const id = generateId('u');
            const name = profile.displayName || email.split('@')[0];
            const avatar = generateAvatar(name);
            const color = generateColor();
            const hashedPassword = await bcrypt.hash(generateId('pwd'), 10);

            db.prepare(`
              INSERT INTO users (id, name, email, password, avatar, color, role)
              VALUES (?, ?, ?, ?, ?, ?, 'member')
            `).run(id, name, email, hashedPassword, avatar, color);

            user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in GitHub profile'));
          }

          let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

          if (!user) {
            const id = generateId('u');
            const name = profile.displayName || profile.username || email.split('@')[0];
            const avatar = generateAvatar(name);
            const color = generateColor();
            const hashedPassword = await bcrypt.hash(generateId('pwd'), 10);

            db.prepare(`
              INSERT INTO users (id, name, email, password, avatar, color, role)
              VALUES (?, ?, ?, ?, ?, ?, 'member')
            `).run(id, name, email, hashedPassword, avatar, color);

            user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  return passport;
}

export function generateJWT(user: any): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
