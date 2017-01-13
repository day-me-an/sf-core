import {Dispatch, AppAction, AppState, GetState} from './types'
import {createSelector} from 'reselect'

export type GeoPosition = {lat: number, lon: number}
export type DateState = {
  from: string
  to: string
  include_unconfirmed: boolean
}
export type SearchArea = 'anywhere' | 'origin_country' | 'abroad'
export type SortType = 'nearest'

export type WhereaboutsState =
    {search_area: 'anywhere' | 'abroad', budget: number}
  | {search_area: 'origin_country', distance: number}
  | {search_area: 'bbox', envelope: MapBoundingBox}

export type OriginState = {
  address: string
  coords: GeoPosition
  country_code: string
  country_nickname: string
}

export type Query = {
  sort: SortType
  origin: OriginState
  dates: DateState
  whereabouts: WhereaboutsState
  duration: Array<string>
  weather: Array<string>
  sites: Array<string>
}

export type PeristedState = {
  query: Query
  stashedWhereabouts: WhereaboutsState
}

export type Facets = {
  has_photos: number
  has_pool: number
  hits: number
  is_coastal: number
  kids_allowed: number
  unconfirmed_dates: number
  search_area: {
    origin_country: number
    anywhere: number
    abroad: number
  }
  // Don't bother specifying each individual key. Just its type.
  duration: {[key: string]: number}
  sites: {[key: string]: number}
  weather: {[key: string]: number}
}

export type Hit = {
  id: string
  dates?: {
    start: string
    end: string
    duration: {unit: string, number: number}
  }
  photos: Array<string>
  avg_temp: number
  location: {
    coords: {lat: number, lon: number}
    country: string
    place: string
    is_abroad: boolean
  }
  distance: number
  travel_costs: number
  summary: Array<string>
}

export type MapBeacon = {id: string, latitude: number, longitude: number}

type MapResponse = {sits: MapBeacon[]}

type ResultsResponse = {
  facets: Facets
  // TODO: specify a type signature for a sit object
  hits: Array<Hit>
}

export type ResultsStatus = 'loading' | 'incrementing' | 'success' | 'error'

export type Results = {
  status: ResultsStatus
  facets: Facets
  pages: Hit[][]
  displayed: number
  error?: any
}

export type MapState = {
  beacons: Array<MapBeacon>
}

export type MapBoundingBox = {
  sw: {
    lat: number
    lon: number
  }
  ne: {
    lat: number
    lon: number
  }
}

export type MapRadius = {
  envelope: MapBoundingBox
  distance: number
  geom: {
    id: string
    type: 'Feature'
    // Don't bother defining a shape for these.
    geometry: any
    properties: any
  }
}

export type State = {
  query: Query
  stashedWhereabouts: WhereaboutsState
  paging: {start: number, size: number}
  results: Results
  map: MapState
  mapRadius: MapRadius
  ui: {
    filtersOpen: boolean
  }
}

const initialState: State = {
  query: {
    sort: 'nearest',
    origin: null,
    dates: {
      from: null,
      to: null,
      include_unconfirmed: true
    },
    whereabouts: {
      search_area: 'origin_country',
      distance: 200
    },
    duration: [],
    weather: [],
    sites: [],
  },
  stashedWhereabouts: null,
  paging: {start: 0, size: 20},  
  results: {
    status: 'loading',
    displayed: 0,
    facets: {
      has_photos: 0,
      has_pool: 0,
      hits: 0,
      is_coastal: 0,
      kids_allowed: 0,
      unconfirmed_dates: 0,
      duration: {},
      search_area: {
        anywhere: 0,
        abroad: 0,
        origin_country: 0
      },
      sites: {},
      weather: {},
    },
    pages: [],
  },
  map: {
    beacons: []
  },
  mapRadius: null,
  ui: {
    filtersOpen: false
  }
}

export type Action =
      {type: 'sf/search/RESET'}
    | {type: 'sf/search/SET_ORIGIN', position: GeoPosition, geocodedAddress: string, country: string, countryNickname: string}
    | {type: 'sf/search/SET_DATE_START', start: string}
    | {type: 'sf/search/SET_DATE_END', end: string}
    | {type: 'sf/search/SET_DATE_UNCONFIRMED', unconfirmed: boolean}
    | {type: 'sf/search/SET_WHEREABOUTS', whereabouts: WhereaboutsState}
    | {type: 'sf/search/STASH_WHEREABOURS'}
    | {type: 'sf/search/CLEAR_STASHED_WHEREABOUTS'}
    | {type: 'sf/search/REVERT_WHEREABOURS'}
    | {type: 'sf/search/SET_DURATION', durations: Array<string>}
    | {type: 'sf/search/SET_WEATHER', weathers: Array<string>}
    | {type: 'sf/search/SET_SITES', sites: Array<string>}
    | {type: 'sf/search/TOGGLE_ADVANCED_FILTERS'}
    | {type: 'sf/search/RESULTS_UPDATE_START'}
    | {type: 'sf/search/RESULTS_UPDATE', facets: Facets, hits: Array<Hit>}
    | {type: 'sf/search/INCREMENT_START'}
    | {type: 'sf/search/INCREMENT', newHits: Array<Hit>}
    | {type: 'sf/search/MAP_BEACONS_UPDATE', newBeacons: Array<MapBeacon>}
    | {type: 'sf/search/MAP_RADIUS_UPDATE', newRadius: MapRadius}
    | {type: 'sf/search/RESTORE_STATE', state: PeristedState}

export function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'sf/search/RESET':
      // Reset everything EXCEPT the query origin.
      return {
        ...initialState,
        query: {
          ...initialState.query,
          origin: state.query.origin
        }
      }
    case 'sf/search/SET_ORIGIN':
      return {
        ...state,
        query: {
          ...state.query,
          origin: {
            coords: action.position,
            country_code: action.country,
            address: action.geocodedAddress,
            country_nickname: action.countryNickname
          }
        }
      }
    case 'sf/search/SET_DATE_START':
      return {
        ...state,
        query: {
          ...state.query,
          dates: {
            ...state.query.dates,
            from: action.start
          }
        }
      }
    case 'sf/search/SET_DATE_END':
      return {
        ...state,
        query: {
          ...state.query,
          dates: {
            ...state.query.dates,
            to: action.end
          }
        }
      }
    case 'sf/search/SET_DATE_UNCONFIRMED':
      return {
        ...state,
        query: {
          ...state.query,
          dates: {
            ...state.query.dates,
            include_unconfirmed: action.unconfirmed
          }
        }
      }
    case 'sf/search/SET_WHEREABOUTS':
      return {
        ...state,
        mapRadius: null,
        query: {
          ...state.query,
          whereabouts: action.whereabouts
        }
      }
    case 'sf/search/STASH_WHEREABOURS':
      return {
        ...state,
        stashedWhereabouts: state.query.whereabouts
      }
    case 'sf/search/CLEAR_STASHED_WHEREABOUTS':
      return {...state, stashedWhereabouts: null}
    case 'sf/search/REVERT_WHEREABOURS':
      return {
        ...state,
        query: {
          ...state.query,
          whereabouts: state.stashedWhereabouts
        },
        stashedWhereabouts: null
      }
    case 'sf/search/SET_DURATION':
      return {
        ...state,
        query: {
          ...state.query,
          duration: action.durations
        }
      }
    case 'sf/search/SET_WEATHER':
      return {
        ...state,
        query: {
          ...state.query,
          weather: action.weathers
        }
      }
    case 'sf/search/SET_SITES':
      return {
        ...state,
        query: {
          ...state.query,
          sites: action.sites
        }
      }
    case 'sf/search/TOGGLE_ADVANCED_FILTERS':
      return {
        ...state,
        ui: {filtersOpen: !state.ui.filtersOpen},
      }
    case 'sf/search/RESULTS_UPDATE':
      return {
        ...state,
        paging: initialState.paging,
        results: {
          status: 'success',
          pages: [action.hits],
          facets: action.facets,
          displayed: action.hits.length,
        },
      }
    case 'sf/search/RESULTS_UPDATE_START':
      return {
        ...state,
        paging: initialState.paging,
        results: {
          ...state.results,
          status: 'loading',
        },
      }
    case 'sf/search/INCREMENT_START':
      return {
        ...state,
        results: {
          ...state.results,
          status: 'incrementing'
        }
      }
    case 'sf/search/INCREMENT':
      return {
        ...state,
        paging: {
          ...state.paging,
          start: state.paging.start + action.newHits.length,
        },
        results: {
          status: 'success',
          pages: state.results.pages.concat([action.newHits]),
          displayed: state.results.displayed + action.newHits.length,
          facets: state.results.facets,
        },
      }
    case 'sf/search/MAP_BEACONS_UPDATE':
      return {
        ...state,
        map: {
          beacons: action.newBeacons
        }
      }
    case 'sf/search/MAP_RADIUS_UPDATE':
      return {
        ...state,
        mapRadius: action.newRadius
      }
    case 'sf/search/RESTORE_STATE':
      return {
        ...state,
        query: action.state.query,
        stashedWhereabouts: action.state.stashedWhereabouts,
      }
    default:
      return state
  }
}

/**
 * Converts the internal Redux store query into one expected by the backend.
 */
function serversideQuery(state: AppState) {
  const query = state.search.query
  const filters = {...query}
  delete filters.origin
  delete filters.sort
  return {
    origin: selectors.origin(state),
    filters,
    sort: query.sort
  }
}

function getResults(state: AppState, start: number, size: number): Promise<ResultsResponse> {
  const body = JSON.stringify({
    query: serversideQuery(state),
    start,
    size,
  })
  return fetch("/_api/sit/search/results", {method: 'POST', headers: {'Content-Type': "application/json"}, body})
    .then(resp => resp.json() as Promise<ResultsResponse>)
    .catch(error => {
      console.error("Failed to fetch results from server", error)
    })
}

export const actions = {
  reset: (): Action => ({type: 'sf/search/RESET'}),

  /**
   * Replaces the current search results by fetching with the current query.
   */
  fetchResults: () => (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch({type: 'sf/search/RESULTS_UPDATE_START'})
    const searchState = getState().search
    getResults(getState(), searchState.paging.start, searchState.paging.size)
      .then(respJson => {
        dispatch({type: 'sf/search/RESULTS_UPDATE', hits: respJson.hits, facets: respJson.facets})
      })
      .catch(error => {
        console.error("Failed to fetch facets from server", error)
      })
  },

  /**
   * Loads more results by incrementing the current paging position and performing a fetch.
   */
  loadMore: () => (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch({type: 'sf/search/INCREMENT_START'})
    const searchState = getState().search
    // Advance it by the current paging `size`, which may vary between devices.
    const newStart = searchState.paging.start + searchState.paging.size
    getResults(getState(), newStart, searchState.paging.size)
      .then(respJson => {
        dispatch({type: 'sf/search/INCREMENT', newHits: respJson.hits})
      })
      .catch(error => {
        console.error("Failed to fetch more search hits from server", error)
      })
},

  /**
   * Fetches all sit locations using the current query to populate the beacons on the map.
   */
  fetchMapBeacons: (bbox: MapBoundingBox) => (dispatch: Dispatch<Action>, getState: GetState) => {
    const searchState = getState().search
    const body = JSON.stringify({
      query: serversideQuery(getState()),
      map_bbox: bbox
    })

    fetch("/_api/sit/search/map/results", {method: 'POST', headers: {'Content-Type': "application/json"}, body})
      .then(resp => resp.json() as Promise<MapResponse>)
      .then(respJson => {
        dispatch({type: 'sf/search/MAP_BEACONS_UPDATE', newBeacons: respJson.sits})
      })
      .catch(error => {
        console.error("Failed to fetch map beacons from server", error)
      })
  },

  /**
   * 
   */
  fetchMapRadius: () => (dispatch: Dispatch<Action>, getState: GetState) => {
    const body = JSON.stringify(serversideQuery(getState()))
    fetch("/_api/sit/search/map/radius", {method: 'POST', headers: {'Content-Type': "application/json"}, body})
      .then(resp => resp.json() as Promise<MapRadius>)
      .then(respJson => {
        dispatch({type: 'sf/search/MAP_RADIUS_UPDATE', newRadius: respJson})
      })
      .catch(error => {
        console.error("Failed to fetch map radius from server", error)
      })
  },

  /**
   * Sets the user's starting geo location.
   * This is used to calculate distances to sits.
   */
  setOrigin: (position: GeoPosition) => (dispatch: Dispatch<Action>) => {
    fetch(`//maps.googleapis.com/maps/api/geocode/json?latlng=${position.lat},${position.lon}`)
      .then(resp => resp.json() as any)
      .then(body => {
        const result = body.results[0]
        const countryComponent = result.address_components.find(
          (component) => component.types.indexOf('country') != -1
        )
        // Picks "USA" from "1026 Clayton Street, San Francisco, CA 94117, USA".
        const countryNickname = result.formatted_address.split(', ').reverse()[0]
        dispatch({
          type: 'sf/search/SET_ORIGIN',
          position: position,
          geocodedAddress: result.formatted_address as string,
          country: countryComponent.short_name as string,
          countryNickname
        })
      })
      .catch(error => {
        console.error("Failed to set origin due to", error)
      })
  },

  setDateStart: (start: string) => (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch({type: 'sf/search/SET_DATE_START', start})
    // Set end date to null if this date is after it.
    const currentEnd = new Date(getState().search.query.dates.to)
    if (new Date(start) > currentEnd) {
      dispatch({type: 'sf/search/SET_DATE_END', end: null})  
    }
  },

  setDateEnd: (end: string) => (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch({type: 'sf/search/SET_DATE_END', end})
    // Set start date to null if this date is before it.
    const currentStart = new Date(getState().search.query.dates.from)
    if (new Date(end) < currentStart) {
      dispatch({type: 'sf/search/SET_DATE_START', start: null})  
    }
  },

  setDateUnconfirmed: (unconfirmed: boolean): Action => {
    return {type: 'sf/search/SET_DATE_UNCONFIRMED', unconfirmed}
  },

  setWhereaboutsOrigin: (distance: number) => (dispatch: Dispatch<Action>) => {
    dispatch({
      type: 'sf/search/SET_WHEREABOUTS', 
      whereabouts: {search_area: 'origin_country', distance}
    })
    dispatch({type: 'sf/search/CLEAR_STASHED_WHEREABOUTS'})
  },

  setWhereaboutsAnywhere: (budget: number) => (dispatch: Dispatch<Action>) => {
    dispatch({
      type: 'sf/search/SET_WHEREABOUTS',
      whereabouts: {search_area: 'anywhere', budget}
    })
    dispatch({type: 'sf/search/CLEAR_STASHED_WHEREABOUTS'})
  },

  setWhereaboutsAbroad: (budget: number) => (dispatch: Dispatch<Action>) => {
    dispatch({
      type: 'sf/search/SET_WHEREABOUTS', 
      whereabouts: {search_area: 'abroad', budget}
    })
    dispatch({type: 'sf/search/CLEAR_STASHED_WHEREABOUTS'})
  },

  /**
   * Limits the search area to a bounding box. This should be called by a map UI element.
   * 
   * If the current search area is not a bounding box, it stashes it so it can be restored later.
   */
  setWhereaboutsBbox: (bbox: MapBoundingBox) => (dispatch: Dispatch<Action>, getState: GetState) => {
    const currentWhereabouts = getState().search.query.whereabouts
    if (currentWhereabouts.search_area != 'bbox') {
      dispatch({type: 'sf/search/STASH_WHEREABOURS', whereabouts: currentWhereabouts})
    }
    dispatch({type: 'sf/search/SET_WHEREABOUTS', whereabouts: {search_area: 'bbox', envelope: bbox}})
  },

  revertWhereabouts: (): Action => {
    return {type: 'sf/search/REVERT_WHEREABOURS'}
  },

  setDuration: (durations: Array<string>): Action => {
    return {type: 'sf/search/SET_DURATION', durations }
  },

  setWeather: (weathers: Array<string>): Action => {
    return {type: 'sf/search/SET_WEATHER', weathers }
  },

  setSites: (sites: Array<string>): Action => {
    return {type: 'sf/search/SET_SITES', sites }
  },

  toggleAdvancedFilters: (): Action => {
    return {type: 'sf/search/TOGGLE_ADVANCED_FILTERS'}
  },

  restoreState: (state: PeristedState): Action => {
    return {type: 'sf/search/RESTORE_STATE', state}
  },
}

export const selectors = {
  /**
   * Returns either the user's manually selected origin, or their guessed location from the boot data.
   */
  origin: createSelector(
    (state: AppState) => state.search.query.origin,
    (state: AppState) => state.boot.data.geoip,
    (queryOrigin, bootGeoip) => queryOrigin || bootGeoip
  )
}

/**
 * A utility for deciding whether various map actions need calling based on changes to the query.
 * This should be applicable to map components on every platform.
 */
export function MapUpdateHelper(currentQuery: Query, nextQuery: Query) {
  const hasWhereaboutsChanged = nextQuery.whereabouts !== currentQuery.whereabouts
  const hasOriginChanged = nextQuery.origin !== currentQuery.origin
  const isBoundingBox = nextQuery.whereabouts.search_area == 'bbox'
  return {
    radius: () => {
      // Fetch a new radius if the `search_area` isn't a bbox they've manually dragged on the map.
      if (hasWhereaboutsChanged && !isBoundingBox) {
        return true
      }
      if (hasOriginChanged && !isBoundingBox) {
        return true
      }
      return false
    },

    beacons: () => {
      // Keep the beacons at the place the user has chosen to move to, rather than the new origin.
      if (hasOriginChanged && isBoundingBox) {
        return false
      }
      /*
      Fetch new beacons when the query changes.
      
      However, it skips this if `whereabouts` or `origin` changed because these cause a radius fetch,
      which in turn fires the Leaflet `moveend` event handler that will fetch new beacons.

      TODO: ignore changes to `sort`. However, sorting isn't yet implemented in this version.
      */
      if (nextQuery !== currentQuery && !hasWhereaboutsChanged && !hasOriginChanged) {
        return true
      }
      return false
    }
  }
}