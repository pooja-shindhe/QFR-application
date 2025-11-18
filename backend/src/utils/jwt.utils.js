const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {String} userId - User ID from database
 * @param {String} role - User role (customer/vendor)
 * @returns {String} JWT token
 */
const generateToken = (userId, role = null) => {
  const payload = {
    id: userId,
    timestamp: Date.now()
  };

  if (role) {
    payload.role = role;
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'qfr-app',
      audience: 'qfr-users'
    }
  );
};

/**
 * Generate refresh token for token renewal
 * @param {String} userId - User ID from database
 * @returns {String} Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: '30d',
      issuer: 'qfr-app',
      audience: 'qfr-users'
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'qfr-app',
      audience: 'qfr-users'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify refresh token
 * @param {String} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        issuer: 'qfr-app',
        audience: 'qfr-users'
      }
    );
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
};

/**
 * Check if token is expired without verification
 * @param {String} token - JWT token
 * @returns {Boolean} True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {String} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Generate password reset token
 * @param {String} userId - User ID
 * @returns {String} Password reset token
 */
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'password-reset' },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: 'qfr-app',
      audience: 'qfr-users'
    }
  );
};

/**
 * Verify password reset token
 * @param {String} token - Password reset token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'qfr-app',
      audience: 'qfr-users'
    });
    
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Generate email verification token
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @returns {String} Email verification token
 */
const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email, type: 'email-verification' },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'qfr-app',
      audience: 'qfr-users'
    }
  );
};

/**
 * Create token response object
 * @param {String} accessToken - Access token
 * @param {String} refreshToken - Refresh token (optional)
 * @returns {Object} Token response object
 */
const createTokenResponse = (accessToken, refreshToken = null) => {
  const response = {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    expiresAt: getTokenExpiration(accessToken)
  };

  if (refreshToken) {
    response.refreshToken = refreshToken;
    response.refreshExpiresAt = getTokenExpiration(refreshToken);
  }

  return response;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiration,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  createTokenResponse
};