import { FavoriteService } from "../services/favorite.services.js";

async function get(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.deleteById(req, res, next);
  next();
}

async function toggleFavorite(req, res, next) {
  const favoriteService = new FavoriteService();
  await favoriteService.toggleFavorite(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  toggleFavorite,
};
