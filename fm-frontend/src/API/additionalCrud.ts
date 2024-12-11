import { api, handleError } from "API";
import get from "lodash/get";
import { IFilter, Where } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";

type CrudType<T, U> = {
  get: (route: string, filter?: IFilter<T>) => Promise<U[] | unknown>;
  post: (route: string, data: unknown) => Promise<unknown>;
  patch: (route: string, data: unknown) => Promise<unknown>;
  put: (route: string, data: unknown) => Promise<unknown>;
  delete: (route: string) => Promise<void>;
  aggregate: (
    pipeline: AggregationPipeline
  ) => Promise<U[] | { totalResults: number }[] | unknown>;
  count: (route: string, where?: Where<T>) => Promise<number>;
};

export function createAdditionalCrudService<T, U>(
  endpoint: string
): CrudType<T, U> {
  return {
    post: async (route: string, data: unknown): Promise<unknown> => {
      try {
        const response = await api.post(`/${endpoint}/${route}`, data);
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "create");
        return {} as U;
      }
    },
    get: async (route: string, filter?: IFilter<T>): Promise<U[]> => {
      try {
        const url = filter
          ? `/${endpoint}/${route}?filter=${JSON.stringify(filter)}`
          : `/${endpoint}/${route}`;
        const response = await api.get(url);
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "get");
        return [] as U[];
      }
    },
    patch: async (route: string, data: unknown): Promise<unknown> => {
      try {
        const response = await api.patch(`/${endpoint}/${route}`, data);
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "patch");
        return {} as U;
      }
    },
    put: async (route: string, data: unknown): Promise<unknown> => {
      try {
        const response = await api.put(`/${endpoint}/${route}`, data);
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "put");
        return {} as U;
      }
    },
    delete: async (route: string): Promise<void> => {
      try {
        await api.delete(`/${endpoint}/${route}`);
      } catch (error: unknown) {
        const errorMessage: string =
          get(error, "response.data.error.message", "") ||
          JSON.stringify(error);
        handleError(error as Error, `API/${endpoint}.ts`, "delete");
        throw new Error(errorMessage);
      }
    },
    aggregate: async (
      pipeline: AggregationPipeline
    ): Promise<U[] | { totalResults: number }[] | unknown> => {
      try {
        const response = await api.post(`/${endpoint}/aggregate`, { pipeline });
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "aggregate");
        return [] as U[];
      }
    },
    count: async (route: string, where?: Where<T>): Promise<number> => {
      try {
        const response = await api.get(`/${endpoint}/count/${route}`, {
          params: { where },
        });
        return response.data.data;
      } catch (error: unknown) {
        handleError(error as Error, `API/${endpoint}.ts`, "count");
        return 0;
      }
    },
  };
}
