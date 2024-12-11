import { IEcnSuggestionWithRelations } from "interfaces/ecnSuggestion";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";

export default class EcnSuggestionStore {
  rootStore: RootStore;

  ecnSuggestionsForBasicUser: IEcnSuggestionWithRelations[] = [];
  ecnSuggestionsForAdmin: IEcnSuggestionWithRelations[] = [];

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  public async fetchEcnSuggestions(stepId: number, forAdmin?: boolean) {
    const commonFilter = {
      order: ["createdAt ASC"],
      include: [{ relation: "user" }, { relation: "ecnSuggestionAttachments" }],
    };
    if (!forAdmin) {
      // this.ecnSuggestionsForBasicUser = await getEcnSuggestions({
      //   where: { stepId, isAdminOnly: forAdmin },
      //   ...commonFilter,
      // });
      this.ecnSuggestionsForAdmin = [];
    } else {
      // const suggestions = await getEcnSuggestions({
      //   where: { stepId },
      //   ...commonFilter,
      // });
      // this.ecnSuggestionsForBasicUser = suggestions.filter(
      //   (suggestion) => !suggestion?.isAdminOnly
      // );
      // this.ecnSuggestionsForAdmin = suggestions.filter(
      //   (suggestion) => suggestion?.isAdminOnly
      // );
    }
  }
}
