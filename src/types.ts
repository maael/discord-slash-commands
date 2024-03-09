export interface StateItGuess {
  day: string
  stateId: number
  answer: string
  guesses: {
    [guesser: string]: string
  }
}
