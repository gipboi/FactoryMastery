export function validateVersion(currentVersion: string, inputVersion: string, canEqual?: boolean): boolean | string {
  if (!canEqual && currentVersion === inputVersion) {
    return 'New version must not be equal to current version'
  }

  const currentVersionSplitted = currentVersion.split('.').map(version => Number(version))
  const inputVersionSplitted = inputVersion.split('.').map(version => Number(version))

  if (currentVersionSplitted[0] > inputVersionSplitted[0]) {
    return false
  }
  if (currentVersionSplitted[1] > inputVersionSplitted[1] && currentVersionSplitted[0] <= inputVersionSplitted[0]) {
    return false
  }
  if (
    currentVersionSplitted[2] > inputVersionSplitted[2] &&
    currentVersionSplitted[1] <= inputVersionSplitted[1] &&
    currentVersionSplitted[0] <= inputVersionSplitted[0]
  ) {
    return false
  }

  return true
}

export function validatePatternVersion(event: any, versionValue: string) {
  if (!isNaN(Number(event.key))) {
    return
  }

  if (event.key === 'Backspace' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Tab') {
    return
  }

  if (event.key === '.') {
    if (versionValue.split('.').length === 3) {
      event.preventDefault()
    } else {
      return
    }
  }

  event.preventDefault()
}
