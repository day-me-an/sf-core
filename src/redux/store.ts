import * as Redux from 'redux'
import thunk from 'redux-thunk'

import {AppState} from './types'
import {reducer as boot} from './boot'
import {reducer as search} from './search'

const reducers = Redux.combineReducers<AppState>({
  boot,
  search,
})

export function configureStore(initialState?: AppState): Redux.Store<AppState> {
  const enhancer = Redux.compose(Redux.applyMiddleware(thunk))
  const store = Redux.createStore<AppState>(reducers, initialState, enhancer)
  return store
}

/**
 * Constructs a Redux store seeded with the `boot` initialisation data. This is required throughout the app.
 * 
 * Performing this step client-side would become obsolete if server-side rendering were used, but
 * since the initial version will be deployed as a basic static site to AWS S3, this isn't required yet.
 * 
 * Obviously, this does cause a small delay before the app can render, but the benefits far outweigh that.
 * 
 * TODO: possibly add support for supplying a POJO of 'extra reducers'. These would be contained under an `extras` key
 * on the root reducer.
 * They would be used for platform-specific features. For example, the iOS variant of the app may have a feature that
 * wouldn't make sense on the web or android variant.
 */
export function configureStoreFromBoot() {
  return new Promise<Redux.Store<AppState>>((resolve, reject) => {
    fetch("/_api/boot")
      .then(resp => resp.json())
      .then((bootData: any) => {
        const initialState = {
          boot: {status: 'success', data: bootData}
        } as AppState
        const store = configureStore(initialState)
        resolve(store)
      })
      .catch(reject)
  })
}