import FilterSort from '../filter_sort'
import Grid from '../../../../components/main_layout/public/icons/grid.svg'
import List from '../../../../components/main_layout/public/icons/list.svg'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { toggleListView } from '../../client/actions'

function displayButtonClass (buttonType, displayType) {
  return classNames(
    `auction-artworks-header__${buttonType}`,
    { active: displayType === buttonType }
  )
}

function Header (props) {
  const {
    isFetchingArtworks,
    isListView,
    toggleListViewAction,
    total
  } = props

  const displayType = isListView ? 'list' : 'grid'
  const totalLabel = isFetchingArtworks
    ? 'Loading results.'
    : `${total} Artworks`

  return (
    <div className='auction-artworks-header'>
      <div className='auction-artworks-header__left'>
        <div className='auction-artworks-header__total'>
          { totalLabel }
        </div>
      </div>
      <div className='auction-artworks-header__right'>
        <div className='auction-artworks-header__sort'>
          <FilterSort />
        </div>
        <div className='auction-artworks-header__switch'>
          <div className={displayButtonClass('grid', displayType)} onClick={() => toggleListViewAction(false)}>
            <Grid />
          </div>
          <div className={displayButtonClass('list', displayType)} onClick={() => toggleListViewAction(true)}>
            <List />
          </div>
        </div>
      </div>
    </div>
  )
}

Header.propTypes = {
  isFetchingArtworks: PropTypes.bool.isRequired,
  isListView: PropTypes.bool.isRequired,
  toggleListViewAction: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired
}

const mapStateToProps = (state) => {
  return {
    isFetchingArtworks: state.auctionArtworks.isFetchingArtworks,
    isListView: state.auctionArtworks.isListView,
    total: state.auctionArtworks.total
  }
}

const mapDispatchToProps = {
  toggleListViewAction: toggleListView
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
