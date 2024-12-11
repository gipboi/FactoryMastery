import { makeAutoObservable } from 'mobx'
import { RootStore } from 'stores'

export default class GeneralStore {
  rootStore: RootStore

  showSidebarMobile: boolean = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  setShowSidebarMobile(showSidebarMobile: boolean): void {
    this.showSidebarMobile = showSidebarMobile
  }
}
