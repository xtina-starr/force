import analyticsMiddleware from './analytics_middleware'
import ResponsiveWindow from '../../../components/react/responsive_window'
import React from 'react'
import SubmissionFlow from '../components/submission_flow'
import geo from '../../../components/geo/index.coffee'
import reducers from './reducers'
import createHistory from 'history/createBrowserHistory'
import createLogger from 'redux-logger'
import stepsConfig from './steps_config'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import { Redirect, Router, Route, Switch } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { data as sd } from 'sharify'
import {
  ignoreRedirectOnAuth,
  updateAuthFormStateAndClearError,
  updateCurrentStep,
  updateLocationFromSubmissionAndFreeze,
  updateStepsWithUser,
  updateStepsWithoutUser
} from './actions'
import { render } from 'react-dom'
import { routerMiddleware } from 'react-router-redux'

function setupSubmissionFlow () {
  // load google maps for autocomplete
  geo.loadGoogleMaps()
  const history = createHistory()

  const middleware = []

  middleware.push(thunkMiddleware) // lets us dispatch() functions
  middleware.push(routerMiddleware(history))
  middleware.push(analyticsMiddleware) // middleware to help us track previous and future states

  if (sd.NODE_ENV === 'development' || sd.NODE_ENV === 'staging') {
    middleware.push(createLogger({ // middleware that logs actions
      collapsed: true
    }))
  }

  const store = createStore(
    reducers,
    applyMiddleware(...middleware)
  )

  const determineSteps = () => {
    if (sd.CURRENT_USER) {
      store.dispatch(updateStepsWithUser())
    } else {
      store.dispatch(updateStepsWithoutUser())
    }
  }

  // track pageviews when react-router updates the url
  history.listen((ev) => {
    window.analytics.page(
      { path: ev.pathname },
      { integrations: { 'Marketo': false } }
    )
  })

  render(
    <Provider store={store}>
      <ResponsiveWindow>
        <Router history={history}>
          <Switch>
            <Route
              exact path='/consign/submission'
              render={() => {
                if (sd.CURRENT_USER) {
                  store.dispatch(updateStepsWithUser())
                  return <Redirect to={stepsConfig.chooseArtist.path} />
                } else {
                  store.dispatch(updateStepsWithoutUser())
                  return <Redirect to={stepsConfig.createAccount.path} />
                }
              }}
            />
            <Route
              path={stepsConfig.createAccount.path}
              render={() => {
                store.dispatch(updateStepsWithoutUser())
                store.dispatch(updateCurrentStep('createAccount'))
                return <SubmissionFlow />
              }}
            />
            <Route
              path={stepsConfig.chooseArtist.path}
              render={() => {
                determineSteps()
                store.dispatch(updateCurrentStep('chooseArtist'))
                return <SubmissionFlow />
              }}
            />
            <Route
              path={stepsConfig.describeWork.path}
              render={() => {
                determineSteps()
                store.dispatch(updateCurrentStep('describeWork'))
                return <SubmissionFlow />
              }}
            />
            <Route
              path={stepsConfig.uploadPhotos.submissionPath}
              render={() => {
                determineSteps()
                store.dispatch(updateCurrentStep('uploadPhotos'))
                return <SubmissionFlow />
              }}
            />
            <Route
              path={stepsConfig.describeWork.submissionPath}
              render={() => {
                determineSteps()
                store.dispatch(updateCurrentStep('describeWork'))
                store.dispatch(updateLocationFromSubmissionAndFreeze())
                return <SubmissionFlow />
              }}
            />
            <Route
              path={stepsConfig.uploadLanding.submissionPath}
              render={() => {
                const Component = stepsConfig.uploadLanding.component
                store.dispatch(updateAuthFormStateAndClearError('logIn'))
                store.dispatch(ignoreRedirectOnAuth())
                return <Component />
              }}
            />
            <Route path={stepsConfig.thankYou.submissionPath} component={stepsConfig.thankYou.component} />
          </Switch>
        </Router>
      </ResponsiveWindow>
    </Provider>,
    document.getElementById('consignments-submission__flow')
  )
}

export default () => {
  setupSubmissionFlow()
}
