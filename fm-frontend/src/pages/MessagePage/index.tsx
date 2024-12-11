// import SupportMessages from "components/Pages/MessagesPage/SupportMessages";
import qs from "qs";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "routes";
import Tabs from "../../components/Tabs";
import styles from "./styles.module.scss";

export enum MessageTabId {
  GENERAL = "generalMessages",
  SUPPORT = "supportMessages",
}

export interface IMessageSearchQuery {
  page?: string;
  filters?: string[];
  tab?: string;
  keyword?: string;
}

const MessagesPage = () => {
  // const { messageStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery: IMessageSearchQuery = qs.parse(
    window.location.search.slice(1)
  );
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    setDefaultTabParams();
  }, [location.search]);

  function setDefaultTabParams(): void {
    const currentTab: string | null = params.get("tab");
    if (!currentTab) {
      // params.set("tab", MessageTabId.SUPPORT);
      // navigate(`${routes.messages.value}?${params.toString()}`);
    }
  }

  function onPageChange(
    page: number,
    tab?: string,
    keyword: string = ""
  ): void {
    params.set("page", page.toString());
    if (tab) {
      params.set("tab", tab);
    }
    params.set("keyword", keyword);
    navigate(`${routes.messages.value}?${params.toString()}`);
  }

  function onTabChange(tabId: string): void {
    // const { generalMessagePage, supportMessagePage } = messageStore;
    if (tabId === MessageTabId.SUPPORT) {
      // onPageChange(
      //   supportMessagePage,
      //   tabId,
      //   messageStore.supportMessageKeyword
      // );
    } else if (tabId === MessageTabId.GENERAL) {
      // onPageChange(
      //   generalMessagePage,
      //   tabId,
      //   messageStore.generaltMessageKeyword
      // );
    }
  }

  return (
    <div className={styles.container}>
      <h2>Inbox</h2>
      <div className={styles.body}>
        <Tabs
          isMessagePage={true}
          headers={[
            {
              label: "COMMENTS",
              tabId: MessageTabId.SUPPORT,
            },
          ]}
          contents={
            [
              // {
              //   tabId: MessageTabId.SUPPORT,
              //   content: (
              //     <SupportMessages
              //       query={searchQuery}
              //       onPageChange={onPageChange}
              //     />
              //   ),
              // },
            ]
          }
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
};

export default MessagesPage;
