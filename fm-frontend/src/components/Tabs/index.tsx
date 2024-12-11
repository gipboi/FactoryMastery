import cx from "classnames";
import { observer } from "mobx-react";
import qs from "qs";
import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import styles from "./styles.module.scss";

export interface ITabHeader {
  tabId: string;
  label: string;
}

export interface ITabContent {
  tabId: string;
  content: React.ReactNode;
}

export interface ITabsProps
  extends Omit<React.HTMLProps<HTMLUListElement>, "headers"> {
  headers: ITabHeader[];
  contents: ITabContent[];
  noContentPadding?: boolean;
  titleClassName?: string;
  onTabChange?: (tabId: string) => void;
  isMessagePage?: boolean;
}

const Tabs = (props: ITabsProps) => {
  const {
    headers,
    contents,
    className,
    noContentPadding,
    titleClassName,
    isMessagePage,
    onTabChange,
    ...ulProps
  } = props;
  const location = useLocation();
  // const { messageStore } = useStores();
  // const { unreadSupportThreadCount = 0, unreadGroupThreadCount = 0 } =
  //   messageStore;
  const params = new URLSearchParams(location.search);
  const queryString = qs.parse(location.search);
  const navigate = useNavigate();
  const persistedTab = `${queryString?.tab || queryString?.["?tab"] || ""}`;
  const defaultActiveId: string = persistedTab
    ? persistedTab
    : headers[0].tabId;
  const [activeId, setActiveId] = useState<string>(defaultActiveId);

  useEffect(() => {
    setActiveId(defaultActiveId);
  }, [persistedTab]);

  return (
    <Fragment>
      <ul
        className={cx(
          "nav nav-tabs nav-bordered mb-2",
          className,
          titleClassName,
          styles.container,
          {
            [styles.noContentPadding]: noContentPadding,
          }
        )}
        {...ulProps}
      >
        {Array.isArray(headers) &&
          headers.map((header: ITabHeader, index: number) => {
            // const unreadCount =
            //   header.label === "GENERAL"
            //     ? unreadGroupThreadCount
            //     : unreadSupportThreadCount;
            return (
              <li
                key={index}
                className={cx("nav-item", styles.header, {
                  [styles.active]: activeId === header.tabId,
                })}
                onClick={() => {
                  setActiveId(header.tabId);
                  params.set("tab", `${header.tabId}`);
                  isMessagePage &&
                    navigate(`${routes.messages.value}?${params.toString()}`);
                  if (onTabChange) onTabChange(header.tabId);
                }}
              >
                <div
                  data-bs-toggle="tab"
                  aria-expanded="false"
                  className="nav-link"
                  style={{ position: "relative" }}
                >
                  <div className={cx(styles.tabLabel, "d-md-block")}>
                    {header.label}
                  </div>
                  {/* {isMessagePage && unreadCount ? (
                    <div className={styles.countNotifications}>
                      {Math.max(Number(unreadCount), 0)}
                    </div>
                  ) : null} */}
                </div>
              </li>
            );
          })}
      </ul>

      <div className="tab-content">
        {Array.isArray(contents) &&
          contents.map((content: ITabContent, index: number) => (
            <div
              key={index}
              className={cx("tab-pane", { active: activeId === content.tabId })}
              id={content.tabId}
            >
              {content.content}
            </div>
          ))}
      </div>
    </Fragment>
  );
};

export default observer(Tabs);
