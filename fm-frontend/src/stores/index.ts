import AuthStore from "./authStore";
import CommonLibraryStore from "./commonLibraryStore";
import DocumentTypeStore from "./documentTypeStore";
import FavoriteStore from "./favoriteStore";
import GeneralStore from "./generalStore";
import GroupStore from "./groupStore";
import NotificationStore from "./notificationStore";
import OrganizationStore from "./organizationStore";
import ProcessStore from "./processStore";
import SpinnerStore from "./spinnerStore";
import StepStore from "./stepStore";
import TagStore from "./tagStore";
import UserStore from "./userStore";

export class RootStore {
  generalStore: GeneralStore;
  spinnerStore: SpinnerStore;
  organizationStore: OrganizationStore;
  userStore: UserStore;
  authStore: AuthStore;
  groupStore: GroupStore;
  processStore: ProcessStore;
  documentTypeStore: DocumentTypeStore;
  tagStore: TagStore;
  notificationStore: NotificationStore;
  commonLibraryStore: CommonLibraryStore;
  stepStore: StepStore;
  favoriteStore: FavoriteStore;
  // messageStore: MessageStore;

  constructor() {
    this.generalStore = new GeneralStore(this);
    this.spinnerStore = new SpinnerStore(this);
    this.organizationStore = new OrganizationStore(this);
    this.userStore = new UserStore(this);
    this.authStore = new AuthStore(this);
    this.groupStore = new GroupStore(this);
    this.processStore = new ProcessStore(this);
    this.documentTypeStore = new DocumentTypeStore(this);
    this.tagStore = new TagStore(this);
    this.notificationStore = new NotificationStore(this);
    this.commonLibraryStore = new CommonLibraryStore(this);
    this.stepStore = new StepStore(this);
    this.favoriteStore = new FavoriteStore(this);
    // this.messageStore = new MessageStore(this);
  }
}

export const rootStore = new RootStore();
