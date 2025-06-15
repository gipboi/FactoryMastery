import { PriorityEnum } from "constants/enums/thread";
import { FiFlag } from "react-icons/fi";

export interface IPriority {
    id: PriorityEnum;
    label: string;
    color: string;
    icon: any;
}

export const priorities: IPriority[] = [
    {
        id: PriorityEnum.URGENT,
        label: 'Urgent',
        color: 'red.500',
        icon: FiFlag,
    },
    { id: PriorityEnum.HIGH, label: 'High', color: 'orange.400', icon: FiFlag },
    {
        id: PriorityEnum.NORMAL,
        label: 'Normal',
        color: 'blue.500',
        icon: FiFlag,
    },
    { id: PriorityEnum.LOW, label: 'Low', color: 'gray.400', icon: FiFlag },
];

