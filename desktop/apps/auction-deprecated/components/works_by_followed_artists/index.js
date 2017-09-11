import AuctionGridArtwork from '../auction_grid_artwork'
import ChevronLeft from '../../../../components/main_layout/public/icons/chevron-left.svg'
import ChevronRight from '../../../../components/main_layout/public/icons/chevron-right.svg'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'

import {
  nextPageOfFollowedArtistArtworks,
  previousPageOfFollowedArtistArtworks
} from '../../client/actions'

function WorksByFollowedArtists (props) {
  const {
    followedArtistRailPage,
    followedArtistRailSize,
    nextPageOfFollowedArtistArtworksAction,
    numArtistsYouFollow,
    previousPageOfFollowedArtistArtworksAction,
    saleArtworksByFollowedArtists
  } = props

  const initialSlice = (followedArtistRailPage - 1) * followedArtistRailSize
  const displayedSaleArtworks = saleArtworksByFollowedArtists.slice(
    initialSlice,
    initialSlice + followedArtistRailSize
  )
  const isOnlyFollowedArtistsPage = numArtistsYouFollow <= followedArtistRailSize

  const leftPageClasses = classNames(
    'auction-works-by-followed-artists__page-left',
    { disabled: followedArtistRailPage === 1 }
  )

  const rightPageClasses = classNames(
    'auction-works-by-followed-artists__page-right',
    { disabled: isOnlyFollowedArtistsPage }
  )

  return (
    <div className='auction-works-by-followed-artists'>
      <div className='auction-works-by-followed-artists__title'>
        Works By Artists You Follow
      </div>
      <div className='auction-works-by-followed-artists__content'>
        <div
          className={leftPageClasses}
          onClick={() => { previousPageOfFollowedArtistArtworksAction() }}
        >
          <ChevronLeft />
        </div>
        <div className='auction-works-by-followed-artists__artworks'>
          {
            displayedSaleArtworks.map((saleArtwork) => (
              <AuctionGridArtwork key={saleArtwork.id} saleArtwork={saleArtwork} />
            ))
          }
        </div>
        <div
          className={rightPageClasses}
          onClick={() => { nextPageOfFollowedArtistArtworksAction() }}
        >
          <ChevronRight />
        </div>
      </div>
    </div>
  )
}

WorksByFollowedArtists.propTypes = {
  followedArtistRailPage: PropTypes.string.isRequired,
  followedArtistRailSize: PropTypes.number.isRequired,
  nextPageOfFollowedArtistArtworksAction: PropTypes.func.isRequired,
  numArtistsYouFollow: PropTypes.number.isRequired,
  previousPageOfFollowedArtistArtworksAction: PropTypes.func.isRequired,
  saleArtworksByFollowedArtists: PropTypes.array.isRequired
}

const mapStateToProps = (state) => {
  return {
    followedArtistRailPage: state.auctionArtworks.followedArtistRailPage,
    followedArtistRailSize: state.auctionArtworks.followedArtistRailSize,
    numArtistsYouFollow: state.auctionArtworks.numArtistsYouFollow,
    saleArtworksByFollowedArtists: state.auctionArtworks.saleArtworksByFollowedArtists
  }
}

const mapDispatchToProps = {
  nextPageOfFollowedArtistArtworksAction: nextPageOfFollowedArtistArtworks,
  previousPageOfFollowedArtistArtworksAction: previousPageOfFollowedArtistArtworks
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorksByFollowedArtists)
