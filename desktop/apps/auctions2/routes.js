import * as actions from 'desktop/apps/auctions2/actions/appActions'
import App from 'desktop/apps/auctions2/components/App'
import React from 'react'
import auctionsReducer from 'desktop/apps/auctions2/reducers'
import configureStore from 'desktop/components/react/utils/configureStore'
import { initialState as appInitialState } from 'desktop/apps/auctions2/reducers/appReducer'
import { renderLayout } from '@artsy/stitch'

export async function index (req, res, next) {
  const store = configureStore(auctionsReducer, {
    app: appInitialState
  })

  try {
    await store.dispatch(actions.getCurrentAuctions())

    const layout = await renderLayout({
      basePath: res.app.get('views'),
      layout: '../../../components/main_layout/templates/react_index.jade',
      blocks: {
        head: 'meta.jade',
        body: (props) => <App store={store} {...props} />
      },
      locals: {
        ...res.locals,
        assetPackage: 'auctions',
        bodyClass: 'auctions2-body body-header-fixed body-no-margins'
      },
      data: {
        app: store.getState().app
      }
    })
    res.send(layout)
  } catch (error) {
    next(error)
  }
}
