require('backbone').$ = $

routes =
  '/artist/.*': require('../apps/artist/client/index.coffee').init

  '/artists': require('../apps/artists/client/index.coffee').init

  '/artwork': ->
    if location.pathname.match 'checkout'
      require('../apps/artwork_purchase/client/index.coffee').init()
    else
      require('../apps/artwork/client/index.coffee').init()

  '/collect': require('../apps/collect/client.coffee').init

  '/inquiry': require('../apps/inquiry/client/index.coffee')

  '/order': require('../apps/order/client/index.coffee').init

for path, init of routes
  $(init) if location.pathname.match path
