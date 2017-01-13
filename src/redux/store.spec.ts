import * as chai from 'chai'

import {configureStore} from './store'
import {State as BootState} from './boot'

describe('Redux store', function() {
  it('should be creatable', function() {
    const store = configureStore()
    chai.expect(store).to.not.be.undefined
  })
})