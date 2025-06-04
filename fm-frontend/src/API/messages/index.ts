import { api } from "API";
import { AxiosResponse } from "axios";
import {
  IGroupMessages,
  IMessageGroup,
  IMessageGroupThreads,
  IThreadGroup,
} from "interfaces/message";
import isEmpty from "lodash/isEmpty";
import { IFilter, IWhere } from "types/common";

export async function getGroupMessageThreads(
  filter: IFilter<IMessageGroup> = {}
): Promise<IMessageGroup[]> {
  const response: AxiosResponse = await api.get(
    `/group-message-threads?filter=${JSON.stringify(filter)}`
  );
  return response.data;
}

export async function getGeneralMessageThreads(
  limit: number,
  keyword: string
): Promise<IMessageGroupThreads[]> {
  const response: AxiosResponse = await api.get(
    `/group-message-threads/general-messages/retrieve`,
    {
      params: { limit, keyword },
    }
  );
  return response.data?.data;
}

export async function getCountGroupMessageThreads(
  where: IWhere<IMessageGroup> = {}
): Promise<string> {
  const response: AxiosResponse = await api.get(
    `/group-message-threads/count?where=${JSON.stringify(where)}`
  );
  return response?.data.count ?? "";
}

export async function createGroupMessageThreads(
  threadGroup: IThreadGroup
): Promise<string> {
  const resp = await api.post("/group-message-threads", threadGroup);
  return resp.data?.data.id;
}

export async function countAllUnreadGroupThread(): Promise<string> {
  const response: AxiosResponse = await api.get(
    `/group-message-threads/count-all-notification`
  );
  return response?.data ?? "";
}

export async function createGroupMessageThreadsGroup(
  groupThreadId: string,
  groupIds?: string[]
): Promise<IMessageGroupThreads | null> {
  if (isEmpty(groupIds)) {
    return null;
  }
  const resp = await api.post("/group-message-thread-groups/batch", {
    groupThreadId,
    groupIds,
  });
  return resp.data;
}

export async function createGroupMessageThreadsUser(
  groupThreadId: string,
  userIds?: string[]
): Promise<IMessageGroupThreads | null> {
  if (isEmpty(userIds)) {
    return null;
  }
  const resp = await api.post("/group-message-thread-users/batch", {
    groupThreadId,
    userIds,
  });
  return resp.data;
}

export function createMessageThreads(
  threadGroupId: string,
  messageThreads: any
): Promise<IMessageGroupThreads> {
  return api.post(
    `/group-message-threads/${threadGroupId}/group-messages`,
    messageThreads
  );
}

export async function validateUserOnThread(
  threadGroupId: string,
  userId: string
): Promise<boolean> {
  const response = await api.get(
    `/group-message-threads/${threadGroupId}/user/${userId}/validate`
  );
  return response.data;
}

export async function getMessages(
  threadId: string,
  filter: IFilter<IMessageGroup> = {}
): Promise<IGroupMessages[]> {
  const res = await api.get(
    `/group-message-threads/${threadId}?filter=${JSON.stringify(filter)}`
  );
  return res.data?.data;
}

export async function getExistingThread(
  participantIds: number[]
): Promise<number> {
  const res = await api.get(
    `/group-message-threads-users/get-existing?participantIds=${JSON.stringify(
      participantIds
    )}`
  );
  return res.data;
}
