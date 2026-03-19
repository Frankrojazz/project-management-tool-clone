import { Router } from 'express';
import passport from 'passport';
import { generateJWT } from './passport';

const router = Router();

export function setupOAuthRoutes(app: any, db: any) {
  const FRONTEND_URL = process.env.CLIENT_URL || process.env.CLIENT_URL_DEV || 'http://localhost:5173';

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
    (req: any, res) => {
      const user = req.user;
      const token = generateJWT(user);
      
      res.redirect(`${FRONTEND_URL}/oauth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        joinedDate: user.joined_date || user.joinedDate,
      }))}`);
    }
  );

  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
    (req: any, res) => {
      const user = req.user;
      const token = generateJWT(user);
      
      res.redirect(`${FRONTEND_URL}/oauth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        joinedDate: user.joined_date || user.joinedDate,
      }))}`);
    }
  );

  return router;
}
