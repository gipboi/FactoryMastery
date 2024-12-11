import {
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useState } from "react";
import { primary500 } from "themes/globalStyles";
import { getValidArray } from "utils/common";

interface ITabItemsProps {
  labels: string[];
  contents: React.ReactNode[];
  color?: string;
  isHidden?: boolean;
}

const TabItems = (props: ITabItemsProps) => {
  const { labels, contents, color, isHidden } = props;
  const [currentLabel, setCurrentLabel] = useState<string>(labels[0]);
  return (
    <Tabs width="100%" justifyContent="flex-start" variant="unstyled">
      <TabList hidden={isHidden}>
        {getValidArray(labels).map((label: string, index: number) => (
          <Tab
            key={`tab-${index}`}
            paddingX={0}
            marginRight={4}
            border="none"
            color={currentLabel === label ? color ?? primary500 : "gray.600"}
            background="none"
            fontWeight={currentLabel === label ? 600 : 400}
            _focus={{ border: "none" }}
            transition="all 0s ease-in-out"
            onClick={() => setCurrentLabel(label)}
          >
            {label}
          </Tab>
        ))}
      </TabList>
      <TabIndicator
        paddingTop="-1.5px"
        height="2px"
        background={primary500}
        borderRadius="1px"
        hidden={isHidden}
      />
      <TabPanels>
        {getValidArray(contents).map(
          (content: React.ReactNode, index: number) => (
            <TabPanel key={`tabPanel-${index}`} paddingX={0}>
              {content}
            </TabPanel>
          )
        )}
      </TabPanels>
    </Tabs>
  );
};

export default TabItems;
