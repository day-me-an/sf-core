/**
 * This used to be a normal part of the Redux state tree, with corresponding actions and multiple states.
 * 
 * It was decided that fetching the boot data *before* mounting the app would cut down on boiler plate.
 * 
 * Therefore, this is now rather empty and doesn't do anything.
 */

/**
 * It's now guaranteed that the boot data has successfully loaded.
 */
export type State = {status: 'success', data: any}

/**
 * Dummy reducer function.
 */
export function reducer(state = {}) {
    return state
}