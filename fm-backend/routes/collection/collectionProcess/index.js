import express from 'express';
import collectionController from '../../../controllers/collection.controller.js';
import authController from '../../../controllers/auth.controller.js';

const router = express.Router();

router
  .route('/batch')
  .patch(authController.authenticate, collectionController.batchCollectionProcess);

  export { router as collectionProcessRoute };
