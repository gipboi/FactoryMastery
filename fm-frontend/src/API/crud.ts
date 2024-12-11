import { api, handleError } from "API";
import get from "lodash/get";
import { IFilter, Where } from "types/common";

type CrudType<T, U> = {
  create: (data: Partial<T>) => Promise<U>;
  count: (where?: Where<T>) => Promise<number>;
  get: (filter: IFilter<T>) => Promise<U[]>;
  getDetail: (id: string, filter?: IFilter<T>) => Promise<U>;
  update: (id: string, data: Partial<T>) => Promise<U>;
  delete: (id: string) => Promise<void>;
  createMany: (data: Partial<T>[]) => Promise<U[]>;
};

export function createCrudService<T, U>(endpoint: string): CrudType<T, U> {
  return {
    create: async (data: Partial<T>): Promise<U> => {
      try {
        const response = await api.post(`/${endpoint}`, data);
        return response.data.data;
      } catch (error: any) {
        handleError(error as Error, `API/${endpoint}.ts`, "create");
        return {} as U;
      }
    },
    count: async (where: Where<T> = {}): Promise<number> => {
      try {
        const { data = 0 } = await api.get(
          `/${endpoint}/count?where=${JSON.stringify(where)}`
        );

        return data?.data > 0 ? data?.data : Number(get(data.data, "count", 0))
      } catch (error: any) {
        handleError(error as Error, `API/${endpoint}.ts`, "count");
        return 0;
      }
    },
    get: async (filter: IFilter<T>): Promise<U[]> => {
      try {
        const response = await api.get(
          `/${endpoint}?filter=${JSON.stringify(filter)}`
        );
        return response.data.data;
      } catch (error: any) {
        handleError(error as Error, `API/${endpoint}.ts`, "get");
        return [] as U[];
      }
    },
    getDetail: async (id: string, filter?: IFilter<T>): Promise<U> => {
      try {
        const response = await api.get(
          `/${endpoint}/${id}?filter=${JSON.stringify(filter)}`
        );
        return response.data.data;
      } catch (error: any) {
        handleError(error as Error, `API/${endpoint}.ts`, "getDetail");
        return {} as U;
      }
    },
    update: async (id: string, data: Partial<T>): Promise<U> => {
      try {
        const response = await api.patch(`/${endpoint}/${id}`, data);
        return response.data.data;
      } catch (error: any) {
        handleError(error as Error, `API/${endpoint}.ts`, "update");
        return {} as U;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/${endpoint}/${id}`);
      } catch (error: any) {
        const errorMessage: string =
          get(error, "response.data.error.message", "") ||
          JSON.stringify(error);
        handleError(error as Error, `API/${endpoint}.ts`, "delete");
        throw new Error(errorMessage);
      }
    },
    createMany: async (data: Partial<T>[]): Promise<U[]> => {
      const response = await api.post(`/${endpoint}/create-many`, data);
      return response.data.data;
    },
  };
}
