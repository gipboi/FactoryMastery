import { api } from 'API';
import { AxiosResponse } from 'axios';
import {
  ICollection,
  ICollectionDetailForm,
  ICollectionFilter,
  ICreateCollectionProcessBatchDto,
} from 'interfaces/collection';
import { AggregationPaginated } from 'interfaces/common';
import get from 'lodash/get';
import {
  Fields,
  IFilter,
  IFilterExcludingWhere,
  IWhere,
  UpdateBody,
  Where,
} from 'types/common';
import { AggregationPipeline } from 'types/common/aggregation';

export async function getCollections(
  filter: IFilter<ICollection> = {}
): Promise<ICollection[]> {
  const collections: AxiosResponse = await api.get(`/collections`, {
    params: { filter: JSON.stringify(filter) },
  });
  return collections.data;
}

export async function countCollections(
  where: IWhere<ICollection> = {}
): Promise<String> {
  const collections: AxiosResponse = await api.get(`/collections/count`, {
    params: { where },
  });
  return collections.data.count;
}

export async function getCollection(
  id: string,
  filter: IFilterExcludingWhere<ICollection> = {}
): Promise<ICollection> {
  const collection: AxiosResponse = await api.get(`/collections/${id}`, {
    params: { filter: JSON.stringify(filter) },
  });
  return collection.data?.data;
}

export async function getCollectionsByGroups(filter: {
  where: IWhere<ICollection>;
  groups?: string[] | string[];
  limit?: number;
  offset?: number;
  fields?: Fields<ICollection>;
  order?: string[];
}): Promise<{ result: ICollection[]; totalCount: number }> {
  const collections: AxiosResponse = await api.get('collections', {
    params: { filter: JSON.stringify(filter) },
  });
  return collections.data?.data;
}

export async function getCollectionsByFilter(
  filter: ICollectionFilter
): Promise<AggregationPaginated<ICollection>> {
  const response: AxiosResponse = await api.post('collections/filter', filter);
  return response.data?.data;
}

export async function updateCollectionById(
  id: string,
  updateBody: UpdateBody<ICollection>
): Promise<void> {
  await api.patch(`/collections/${id}`, updateBody);
}

export async function editCollectionProcess(
  updateBody: UpdateBody<ICreateCollectionProcessBatchDto>
): Promise<void> {
  await api.patch(`/collections-processes/batch`, updateBody);
}

export async function createCollection(
  collection: ICollectionDetailForm
): Promise<ICollectionDetailForm> {
  const collections: AxiosResponse = await api.post('/collections', collection);
  return collections.data?.data;
}

export async function updateCollection(
  collection: ICollectionDetailForm,
  id: string
): Promise<ICollectionDetailForm> {
  const collections: AxiosResponse = await api.patch(
    `/collections/${id}`,
    collection
  );
  return collections.data;
}

export async function aggregateCollection(
  pipeline: Record<string, unknown>[]
): Promise<any> {
  const result: AxiosResponse = await api.post(`/collections/aggregate`, {
    pipeline,
  });
  return result.data;
}

export async function aggregateCollectionGroupSearch(
  pipeline: AggregationPipeline
): Promise<AggregationPaginated<ICollection>> {
  try {
    const response: AxiosResponse = await api.post(
      `/collections-groups/aggregate/search`,
      {
        pipeline,
      }
    );
    return response?.data;
  } catch (error: any) {
    return { paginatedResults: [], totalResults: 0 };
  }
}

export async function searchCollections(
  where: Where<ICollection & { searchText: string }> = {}
): Promise<ICollection[]> {
  const response: AxiosResponse = await api.get(
    `/collections/search?where=${JSON.stringify(where)}`
  );
  return get(response, 'data');
}

export async function shareCollectionsToGroups(
  groupIds: string[],
  collectionIds: string[]
): Promise<void> {
  const response: AxiosResponse = await api.patch(
    `/collections/share-to-groups/batch`,
    { groupIds, collectionIds }
  );
  return response.data;
}

export async function archiveCollectionById(id: string): Promise<void> {
  await api.patch(`/collections/${id}/archive`);
}

export async function deleteCollectionById(id: string): Promise<void> {
  await api.delete(`/collections/${id}`);
}

export async function deleteCollectionMainMedia(id: string): Promise<void> {
  const payload = { mainMedia: '' };
  await api.patch(`/collections/${id}`, payload);
}

export async function restoreCollectionById(id: string): Promise<void> {
  await api.patch(`/collections/${id}/restore`);
}
