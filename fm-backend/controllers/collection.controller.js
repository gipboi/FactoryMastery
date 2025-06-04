import { CollectionService } from "../services/collection.services.js";

async function get(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.deleteById(req, res, next);
  next();
}

async function getCollectionsByFilter(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.getCollectionsByFilter(req, res, next);
  next();
}

async function shareToGroups(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.shareToGroups(req, res, next);
  next();
}

async function archiveCollection(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.archiveCollection(req, res, next);
  next();
}

async function batchCollectionProcess(req, res, next) {
  const collectionService = new CollectionService();
  await collectionService.batchCollectionProcess(req, res, next);
  next();
}


export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  getCollectionsByFilter,
  shareToGroups,
  archiveCollection,
  batchCollectionProcess,
};
