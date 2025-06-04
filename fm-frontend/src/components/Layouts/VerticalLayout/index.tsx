import React, { ReactNode, Suspense, useEffect, useState, useRef } from "react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { Container } from "reactstrap";
import styles from "./verticalLayout.module.scss";
import { SidebarType } from "constants/enums";
import useBreakPoint from "hooks/useBreakPoint";
import { EBreakPoint } from "constants/theme";

// code splitting and lazy loading
// https://blog.logrocket.com/lazy-loading-components-in-react-16-6-6cea535c0b52
const LeftSidebar = React.lazy(() => import("../../LeftSidebar"));
const Topbar = React.lazy(() => import("../../Topbar"));

interface IVerticalLayoutProps {
  children?: ReactNode;
}

// loading
const emptyLoading = () => <div></div>;
const loading = () => <div className="text-center"></div>;

const VerticalLayout = (props: IVerticalLayoutProps) => {
  const { children } = props;
  const { generalStore } = useStores();
  const { showSidebarMobile } = generalStore;
  const [sidebarType, setSidebarType] = useState<SidebarType | "">(
    SidebarType.FIXED
  );
  const ref = useRef<HTMLDivElement>(null);
  const isCondensed = sidebarType === SidebarType.CONDENSED;
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD)

  function updateDimensions() {
    //* activate the condensed sidebar if smaller devices like ipad or tablet
    if (window.innerWidth >= 768 && window.innerWidth <= 1028) {
      changeSidebarTypeUI(SidebarType.CONDENSED);
    } else if (window.innerWidth > 1028) {
      changeSidebarTypeUI(SidebarType.FIXED);
    } else if (window.innerWidth <= 768) {
      changeSidebarTypeUI("");
    }
  }

  function changeSidebarTypeUI(newType: SidebarType | ""): void {
    setSidebarType(newType);
    document.body.setAttribute("data-leftbar-compact-mode", newType);
  }

  function toggleSidebarCollapse() {
    changeSidebarTypeUI(
      sidebarType === SidebarType.CONDENSED
        ? SidebarType.FIXED
        : SidebarType.CONDENSED
    );
  }

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);

    if (document.body) document.body.setAttribute("data-leftbar-theme", "dark");

    //* activate the condensed sidebar if smaller devices like ipad or tablet
    if (window.innerWidth >= 768 && window.innerWidth <= 1028) {
      changeSidebarTypeUI(SidebarType.CONDENSED);
    } else if (window.innerWidth <= 768) {
      changeSidebarTypeUI("");
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div className="app">
      <div className={cx(styles.wrapper, "wrapper")}>
        <div ref={ref} className={styles.sidebarContainer}>
          <Suspense fallback={emptyLoading()}>
            <LeftSidebar
              {...props}
              // isCondensed={false}
              showSidebarMobile={showSidebarMobile}
              setShowSidebarMobile={() =>
                generalStore.setShowSidebarMobile(!showSidebarMobile)
              }
            />
          </Suspense>
        </div>

        <div className={cx("content-page", styles.contentPageWithTransition)}>
          <div className={styles.content}>
            <Suspense fallback={emptyLoading()}>
              <Topbar
                // hideLogo={true}
                // toggleSidebarCollapse={toggleSidebarCollapse}
                showSidebarMobile={showSidebarMobile}
                setShowSidebarMobile={() =>
                  generalStore.setShowSidebarMobile(!showSidebarMobile)
                }
              />
            </Suspense>

            <div
              className={cx(styles.contentWrapper, {
                [styles.contentWrapperMobile]: !showSidebarMobile,
                [styles.mobile]: isMobile,
              })}
            >
              <Suspense fallback={loading()}>{children}</Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(VerticalLayout);
