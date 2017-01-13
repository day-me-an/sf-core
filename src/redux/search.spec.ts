import * as chai from 'chai'
import {MapUpdateHelper, Query} from './search'

const INITIAL_QUERY = {
  whereabouts: {search_area: 'anywhere'},
  origin: {coords: {lat: 50, lon: 1}}
} as Query

describe('MapUpdateHelper', function() {
  describe('radius', function() {
    it("should NOT fetch if nothing changed", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, INITIAL_QUERY)
      chai.assert(!shouldFetch.radius())
    })

    it("should NOT fetch if an irrelevant part of the query changed", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, sites: ['ths']})
      chai.assert(!shouldFetch.radius())
    })

    it("should fetch if whereabouts changed and is NOT bbox-restricted", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, whereabouts: {...INITIAL_QUERY.whereabouts}})
      chai.assert(shouldFetch.radius())
    })

    it("should NOT fetch if whereabouts changed but is bbox-restricted", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, whereabouts: {search_area: 'bbox', envelope: null}})
      chai.assert(!shouldFetch.radius())
    })

    it("should fetch if origin changed and is NOT bbox-restricted", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, origin: {...INITIAL_QUERY.origin}})
      chai.assert(shouldFetch.radius())
    })

    it("should NOT fetch if origin changed but is bbox-restricted", function() {
      const initialQuery: Query = {...INITIAL_QUERY, whereabouts: {search_area: 'bbox', envelope: null}}
      const shouldFetch = MapUpdateHelper(initialQuery, {...initialQuery, origin: {...initialQuery.origin}})
      chai.assert(!shouldFetch.radius())
    })
  })

  describe('beacons', function() {
    it("should NOT fetch if nothing changed", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, INITIAL_QUERY)
      chai.assert(!shouldFetch.beacons())
    })

    it("should fetch if the query changed", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY})
      chai.assert(shouldFetch.beacons())
    })

    it("should NOT fetch if origin changed but is bbox-restricted", function() {
      const initialQuery: Query = {...INITIAL_QUERY, whereabouts: {search_area: 'bbox', envelope: null}}
      const shouldFetch = MapUpdateHelper(initialQuery, {...initialQuery, origin: {...initialQuery.origin}})
      chai.assert(!shouldFetch.beacons())
    })

    it("should NOT fetch if the query change included a new whereabouts", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, whereabouts: {...INITIAL_QUERY.whereabouts}})
      chai.assert(!shouldFetch.beacons())
    })

    it("should NOT fetch if the query change included a new origin", function() {
      const shouldFetch = MapUpdateHelper(INITIAL_QUERY, {...INITIAL_QUERY, origin: {...INITIAL_QUERY.origin}})
      chai.assert(!shouldFetch.beacons())
    })
  })  
})