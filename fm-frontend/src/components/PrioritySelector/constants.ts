import { PriorityEnum } from "constants/enums/thread";

export interface IPriority {
    id: PriorityEnum;
    label: string;
    color: string;
    icon: any;
}