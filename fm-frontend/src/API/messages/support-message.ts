import { api } from "API";
import { AxiosResponse } from "axios";
import {
  ICreateSupportMessageThread,
  ISupportMessage,
  ISupportMessageThread,
  ISupportMessageThreadStatusHistory,
  ISupportThreadDto,
} from "interfaces/message";
import { IFilter, IWhere } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";

export async function getSupportMessageThreads(
  filter: IFilter<ISupportMessageThread> = {}
): Promise<any[]> {
  const response: AxiosResponse = await api.get(
    `/support-message-threads?filter=${JSON.stringify(filter)}`
  );
  return response.data;
}

export async function getSupportThread(
  id: string,
  filter: IFilter<ISupportMessageThread> = {}
): Promise<ISupportMessageThread> {
  const response: AxiosResponse = await api.get(
    `/support-message-threads/${id}?filter=${JSON.stringify(filter)}`
  );
  return response.data?.data;
}

export async function getCountSupportMessageThreads(
  where: IWhere<ISupportMessageThread>
): Promise<string> {
  const response: AxiosResponse = await api.get(
    `/support-message-threads/count?where=${JSON.stringify(where)}`
  );
  return response?.data?.count ?? "";
}

export async function countAllUnreadSupportThread(
  pipeline: AggregationPipeline
): Promise<string> {
  const response: AxiosResponse = await api.post(
    `/support-message-threads/count-all-notification`,
    { pipeline }
  );
  return response?.data ?? "";
}

export async function createSupportMessageThreads(
  data: ICreateSupportMessageThread
): Promise<ISupportMessageThread> {
  const response = await api.post("/support-message-threads", data);
  return response?.data?.data;
}

export async function editSupportMessageThreads(
  threadId: string,
  data: Partial<ISupportMessageThread>
): Promise<string> {
  const response = await api.patch(
    `/support-message-threads/${threadId}`,
    data
  );
  return response?.data?.id;
}

export async function deleteSupportMessageThreads(
  threadId: string
): Promise<void> {
  await api.delete(`/support-message-threads/${threadId}`);
}

export function createMessageInSupportThreads(
  threadId: string,
  messageThreads: any
): Promise<ISupportMessageThread> {
  return api.post(
    `/support-message-threads/${threadId}/support-messages`,
    messageThreads
  );
}

export async function getSupportMessages(
  threadId: string,
  filter: IFilter<ISupportMessage> = {}
): Promise<ISupportMessage[]> {
  const res = await api.get(
    `/support-message-threads/${threadId}/support-messages?filter=${JSON.stringify(
      filter
    )}`
  );
  return res.data?.data;
}

export async function getSupportMessageAggregate(
  pipeline: AggregationPipeline,
  startDate: Date,
  endDate: Date
): Promise<ISupportThreadDto[]> {
  try {
    const response = await api.post(`/support-message-threads/aggregate`, {
      pipeline,
      startDate,
      endDate,
    });
    return response?.data?.data;
  } catch (error: any) {
    return [];
  }
}

export async function countSupportMessageAggregate(
  pipeline: AggregationPipeline
): Promise<string> {
  try {
    const response: AxiosResponse = await api.post(
      `/support-message-threads/aggregate/count`,
      {
        pipeline,
      }
    );
    return response?.data;
  } catch (error: any) {
    return "";
  }
}

export async function getSupportMessageThreadStatusHistory(
  threadId: string
): Promise<ISupportMessageThreadStatusHistory[]> {
  const response = await api.get(
    `/support-message-threads/${threadId}/status-history`
  );
  return response?.data?.data;
}

export async function markSupportMessageThreadAsSeen(
  threadId: string
): Promise<ISupportMessageThreadStatusHistory[]> {
  const response = await api.patch(
    `/support-message-threads/${threadId}/support-message-thread-user-seen`
  );
  return response?.data;
}
