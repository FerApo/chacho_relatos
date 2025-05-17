import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import generateImage from './generateImage.js';
import chatCompletion from './chatCompletion.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

config();
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Google OAuth
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SESSION_SECRET
} = process.env;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://168.231.81.137:3000/auth/google/callback'
      },
      (accessToken, refreshToken, profile, done) => {
        // Aquí puedes guardar el usuario en tu base de datos si lo deseas
        const user = {
          googleId: profile.id,
          displayName: profile.displayName,
          emails: profile.emails
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.use(
    session({
      secret: SESSION_SECRET || 'supersecretkey',
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Rutas de autenticación Google
  app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Autenticación exitosa
      res.redirect('/perfil');
    }
  );

  app.get('/perfil', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.json({ user: req.user });
  });
}

// Health check endpoint
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ping', (req, res) => res.json({ pong: true }));

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const base64 = await generateImage(prompt);
    // Devolver la clave 'url' para compatibilidad con el frontend
    res.json({ url: base64 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat-completion', async (req, res) => {
  try {
    const { messages, temperature, max_tokens } = req.body;
    // Validar que messages sea un array no vacío
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'inputMessages debe ser un array y no puede estar vacío.' });
    }
    // Llamar a chatCompletion con el array de mensajes
    const data = await chatCompletion(messages, temperature, max_tokens);
    res.json(data);
  } catch (err) {
    console.error('[chatCompletion] error:', err.message);
    res.status(500).json({ error: 'CHAT_COMPLETION_ERROR' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});