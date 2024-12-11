import { makeAutoObservable } from 'mobx'
import { RootStore } from 'stores'

export default class SpinnerStore {
  rootStore: RootStore

  isLoading?: boolean | undefined = undefined

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  showLoading(): void {
    this.isLoading = true
  }

  hideLoading(): void {
    this.isLoading = false
  }

  setLoading(isLoading: boolean): void {
    this.isLoading = isLoading
  }
}
