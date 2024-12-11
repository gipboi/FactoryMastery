import 'dotenv/config';

export default {
  jwtConfig: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE,
    expireOfWebExtension: process.env.JWT_EXPIRE_WEB_EXTENSION,
    algorithm: process.env.JWT_ALGORITHM,
  },
  token: {
    access: process.env.DEFAULT_A_TOKEN,
    mobileAcess: process.env.DEFAULT_MOBILE_TOKEN,
    mobileAcessFromFE: process.env.DEFAULT_MOBILE_FROM_FE_TOKEN,
  },
};
