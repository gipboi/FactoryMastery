import { IOption } from 'types/common'
import { IGroup } from 'interfaces/groups'
import { IProcessWithRelations } from 'interfaces/process'
import { getValidArray } from 'utils/common'
import { IOrganization } from 'interfaces/organization'

export function getGroupOptionSelect(groupList?: IGroup[]): IOption<string>[] {
  let groupOptions: IOption<string>[] = []
  let groups: string[] = []
  getValidArray(groupList).forEach((group: IGroup) => {
    if (!groups.includes(String(group?.id ?? '')) && group?.name) {
      groups = groups.concat(String(group?.id))
      groupOptions = [
        ...groupOptions,
        {
          value: String(group?.id),
          label: group?.name
        }
      ]
    }
  })
  return groupOptions
}

export function getProcessOptionSelect(groupList?: IProcessWithRelations[]): IOption<string>[] {
  let processOptions: IOption<string>[] = []
  let processes: string[] = []
  getValidArray(groupList).forEach((process: IProcessWithRelations) => {
    if (!processes.includes(String(process?.id ?? '')) && process?.name) {
      processes = processes.concat(String(process?.id))
      processOptions = [
        ...processOptions,
        {
          value: String(process?.id),
          label: process?.name
        }
      ]
    }
  })
  return processOptions
}

export function findValueInArray(value: string, array: IOption<string>[]): IOption<string> {
  return getValidArray(array).find((item: IOption<string>) => item?.value === value) ?? ({} as IOption<string>)
}

export function filterValueInArray(value: string, array: IOption<string>[]): IOption<string>[] {
  return getValidArray(array).filter((item: IOption<string>) => item?.value !== value)
}


export function getOrganizationOptionSelect(orgList?: IOrganization[]): IOption<string>[] {
  let orgOptions: IOption<string>[] = []
  let orgs: string[] = []
  getValidArray(orgList).forEach((org: IOrganization) => {
    if (!orgs.includes(String(org?.id ?? '')) && org?.name) {
      orgs = orgs.concat(String(org?.id))
      orgOptions = [
        ...orgOptions,
        {
          value: String(org?.id),
          label: org?.name
        }
      ]
    }
  })
  return orgOptions
}
