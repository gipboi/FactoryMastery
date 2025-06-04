import express from 'express';
import collectionController from '../../controllers/collection.controller.js';
import authController from '../../controllers/auth.controller.js';

const router = express.Router();

router.route('/').get(authController.authenticate, collectionController.get);
router
  .route('/')
  .post(
    authController.authenticate,
    authController.isAdmin,
    collectionController.create
  );

router
  .route('/filter')
  .post(
    authController.authenticate,
    collectionController.getCollectionsByFilter
  );
router
  .route('/aggregate')
  .post(
    authController.authenticate,
    authController.isAdmin,
    collectionController.getByAggregation
  );

router.get(
  '/:collectionId',
  authController.authenticate,
  collectionController.findById
);

router.patch(
  '/:collectionId',
  authController.authenticate,
  authController.isAdmin,
  collectionController.updateById
);

router.delete(
  '/:collectionId',
  authController.authenticate,
  authController.isAdmin,
  collectionController.deleteById
);

router.patch(
  '/share-to-groups/batch',
  authController.authenticate,
  authController.isAdmin,
  collectionController.shareToGroups
);

router.patch(
  '/:collectionId/archive',
  authController.authenticate,
  authController.isAdmin,
  collectionController.archiveCollection
);

export { router as collectionRoute };
