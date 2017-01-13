import * as Redux from 'redux'
import * as ReactRedux from 'react-redux'

import * as boot from './boot'
import * as search from './search'

export type AppState = {
  boot: boot.State
  search: search.State
}

export type AppAction = search.Action

/**
 * Dispatches an action.
 * The type parameter allows modularisation of action types, but also supports dispatching
 * actions from other modules.
 */
export type Dispatch<A> = (act: AppAction | A) => void
export type GetState = () => AppState

export type StateMapper<S, O> = (state: AppState, ownProps?: O) => S
export type ActionMapper<A, O> = (dispatch: any, ownProps?: O) => A

// Both copied from React's type definition. Should be compatible with react-native too.
export interface StatelessComponent<P> {
  (props: P, context?: any): any;
}
export interface ComponentClass<P> {
  new(props?: P, context?: any): any;
}

// Support both component classes and stateless component functions.
export interface ConnectorFunc<P, O> {
  (component: ComponentClass<P>): ComponentClass<O>
  (component: StatelessComponent<P>): StatelessComponent<O>
}

export function connect<S, A, O>(
    stateMapper: StateMapper<S, O>,
    actionMapper?: ActionMapper<A, O>
  ): ConnectorFunc<S & A, O> {
  return ReactRedux.connect(stateMapper, actionMapper)
}