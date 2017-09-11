import React from 'react'
import renderTestComponent from 'desktop/apps/auction/__tests__/utils/renderTestComponent'
import { test, __RewireAPI__ } from 'desktop/apps/auction/components/layout/auction_info/index'

const { AuctionInfoContainer } = test

describe('auction/components/layout/auction_info/AuctionInfoContainer.test', () => {
  describe('<AuctionInfoContainer />', () => {
    const AuctionInfoDesktop = () => <div />
    const AuctionInfoMobile = () => <div />

    beforeEach(() => {
      __RewireAPI__.__Rewire__('AuctionInfoDesktop', AuctionInfoDesktop)
      __RewireAPI__.__Rewire__('AuctionInfoMobile', AuctionInfoMobile)
    })

    afterEach(() => {
      __RewireAPI__.__Rewire__('AuctionInfoDesktop', AuctionInfoDesktop)
      __RewireAPI__.__Rewire__('AuctionInfoMobile', AuctionInfoMobile)
    })

    it('renders mobile mode if isMobile', () => {
      const { wrapper } = renderTestComponent({
        Component: AuctionInfoContainer,
        props: {
          isMobile: true
        }
      })

      wrapper.find(AuctionInfoDesktop).length.should.equal(0)
      wrapper.find(AuctionInfoMobile).length.should.equal(1)
    })

    it('renders desktop mode if isMobile is false', () => {
      const { wrapper } = renderTestComponent({
        Component: AuctionInfoContainer,
        props: {
          isMobile: false
        }
      })

      wrapper.find(AuctionInfoDesktop).length.should.equal(1)
      wrapper.find(AuctionInfoMobile).length.should.equal(0)
    })
  })
})
