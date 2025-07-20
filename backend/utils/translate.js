import pkg from '@google-cloud/translate';
const {Translate} = pkg.v2;

const keyFilename = 'backend/keys/translate-service-account.json';

const translate = new Translate({ keyFilename });

export default translate; 