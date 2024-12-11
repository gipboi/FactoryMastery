export enum StepPosition {
  ImmediatelyAfterCurrentStep = 1,
  ImmediatelyBeforeCurrentStep = 2,
  PrependToTheBeginningOfList = 3,
  AppendToTheEndOfList = 4,
  SpecifyExactPositionInListToInsertStep = 5,
  ProcessStepLimit = 5
}

export enum StepPositionNames {
  ImmediatelyAfterCurrentStep = 'Immediately after current step',
  ImmediatelyBeforeCurrentStep = 'Immediately before current step',
  PrependToTheBeginningOfList = 'Beginning of the list',
  AppendToTheEndOfList = 'The end of  the list',
  SpecifyExactPositionInListToInsertStep = 'Specify exact position in list to insert step'
}

export enum StepNotify {
  SUCCESS = 'Create STEP successfully!',
  FALSE = 'Failed to create STEP. Please try again or contact admin.',
  WARNING = 'You need to fill in all the fields.'
}

export enum StepDefaultId {
  NONE = ""
}
