import express from 'express';
import groupMessageThreadController from '../../controllers/groupMessageThread.controller.js';
import authController from '../../controllers/auth.controller.js';

const router = express.Router();

router
  .route('/')
  .get(authController.authenticate, groupMessageThreadController.get);
router
  .route('/')
  .post(authController.authenticate, groupMessageThreadController.create);
router
  .route('/aggregate')
  .post(
    authController.authenticate,
    groupMessageThreadController.getByAggregation
  );

router.get(
  '/:groupMessageThreadId',
  authController.authenticate,
  groupMessageThreadController.findById
);

router.patch(
  '/:groupMessageThreadId',
  authController.authenticate,
  groupMessageThreadController.updateById
);

router.delete(
  '/:groupMessageThreadId',
  authController.authenticate,
  groupMessageThreadController.deleteById
);

router.post(
  '/:groupMessageThreadId/group-messages',
  authController.authenticate,
  groupMessageThreadController.createGroupMessage
);

router
  .route('/general-messages/retrieve')
  .get(
    authController.authenticate,
    groupMessageThreadController.getGeneralMessages
  );

export { router as groupMessageThreadRoute };
