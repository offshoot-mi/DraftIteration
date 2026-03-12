// /server/config/google.config.js
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force load .env from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔧 Google Config - Current directory:', __dirname);
console.log('🔧 Google Config - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Found' : '❌ Missing');

let googleClient = null;

export const initGoogleClient = () => {
  if (googleClient) {
    console.log('✅ Google client already initialized');
    return googleClient;
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('❌ GOOGLE_CLIENT_ID environment variable is not set');
      console.error('📝 Please check your .env file at:', path.join(__dirname, '../.env'));
      return null;
    }

    console.log('🔄 Initializing Google client with ID:', clientId.substring(0, 15) + '...');
    googleClient = new OAuth2Client(clientId);
    console.log('✅ Google OAuth client initialized successfully');
    return googleClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google OAuth client:', error.message);
    return null;
  }
};

export const getGoogleClient = () => {
  if (!googleClient) {
    return initGoogleClient();
  }
  return googleClient;
};