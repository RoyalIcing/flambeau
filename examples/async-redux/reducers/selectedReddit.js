export function getInitialState({ defaultReddit }) {
  return defaultReddit;
}

export const SelectionActions = {
  selectReddit(state, { reddit }) {
    return reddit;
  }
}
