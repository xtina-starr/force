Backbone = require 'backbone'
sd = require('sharify').data
_ = require 'underscore'
VeniceVideoView = require './video.coffee'
UAParser = require 'ua-parser-js'
initCarousel = require '../../../../../components/merry_go_round/bottom_nav_mgr.coffee'
initFooterCarousel = require '../../../../../components/merry_go_round/horizontal_nav_mgr.coffee'
Curation = require '../../../../../models/curation.coffee'
Artist = require '../../../../../models/artist.coffee'
FlashMessage = require '../../../../../components/flash/index.coffee'
{ Following, FollowButton } = require '../../../../../components/follow_button/index.coffee'
videoDescription = -> require('../templates/video_description.jade') arguments...
analyticsHooks = require '../../../../../lib/analytics_hooks.coffee'
markdown = require '../../../../../components/util/markdown.coffee'

module.exports = class VeniceView extends Backbone.View

  events:
    'click .venice-overlay__play': 'fadeOutCoverAndStartVideo'
    'click .venice-overlay__cta-button': 'showCta'
    'click .venice-body__help a, .venice-guide__modal-bg, .venice-guide__body a.icon-close': 'toggleVideoGuide'
    'click .venice-overlay__subscribe-form button': 'onSubscribe'
    'click .venice-overlay--completed__buttons .next': 'onNextVideo'
    'click .venice-info-icon, .venice-overlay--completed__buttons .read-more': 'onReadMore'
    'submit .venice-body__text-link': 'submitPhoneLink'

  initialize: ->
    @parser = new UAParser()
    @curation = new Curation sd.CURATION
    @section = @curation.get('sections')[sd.VIDEO_INDEX]
    @sectionIndex = sd.VIDEO_INDEX
    @setupCarousel()
    @setupFooterCarousel() if @curation.get('sub_articles').length
    @following = new Following(null, kind: 'artist') if sd.CURRENT_USER?
    @swapDescription()
    @setupFollowButtons()
    @VeniceVideoView = new VeniceVideoView
      el: $('.venice-video')
      video: @chooseVideoFile()
      slug: @section.slug
      isMobile: @parser.getDevice().type is 'mobile'
    @listenTo @VeniceVideoView, 'videoCompleted', @onVideoCompleted
    @listenTo @VeniceVideoView, 'closeVideo', @fadeInCoverAndPauseVideo
    @listenTo @VeniceVideoView, 'videoReady', @onVideoReady
    @listenTo @VeniceVideoView, 'videoError', @onVideoError

  setupCarousel: ->
    initCarousel $('.venice-carousel'),
      advanceBy: 1
      wrapAround: true
      initialIndex: sd.VIDEO_INDEX
      friction: 0.8
      selectedAttraction: 0.2
    , (carousel) =>
      $('.venice-header__overlay').fadeOut()
      @flickity = carousel.cells.flickity
      # Use 'settle' for changes that should have a delay ie: video swapping
      @flickity.on 'settle', =>
        @settleSection @flickity.selectedIndex
      # Use 'select' for changes that should happen immediately ie: loading
      @flickity.on 'select', =>
        @selectSection @flickity.selectedIndex

  setupFooterCarousel: ->
    initFooterCarousel $('.venice-footer__article-carousel'),
      advanceBy: 1
      wrapAround: true

  settleSection: (i) ->
    @section = @curation.get('sections')[i]
    @sectionIndex = i
    @swapVideo() if @section.published
    @swapDescription()
    @setupFollowButtons()

  selectSection: (i) ->
    return if i is @sectionIndex # window resize triggers a 'select'
    @section = @curation.get('sections')[i]
    @sectionIndex = i
    $('.venice-overlay__play').attr 'data-state', 'loading'
    window.history.replaceState {}, i, '/venice-biennale/' + @section.slug

  onNextVideo: ->
    @flickity.next true
    vid = $('.venice-overlay--completed').get(@sectionIndex)
    $(vid).animate({'opacity': 0, 'z-index': -1}, 500)

  fadeOutCoverAndStartVideo: (e) ->
    return unless e.currentTarget.getAttribute('data-state') is 'ready'
    $('.venice-nav, .venice-carousel').fadeOut()
    @VeniceVideoView.vrView.play()
    @VeniceVideoView.fadeOutControls()

  fadeInCoverAndPauseVideo: ->
    $('.venice-nav, .venice-carousel').fadeIn()
    @VeniceVideoView.vrView.pause()

  onVideoReady: ->
    $('.venice-overlay__play').attr 'data-state', 'ready'

  onVideoError: (msg) ->
    $('.venice-overlay__play').attr 'data-state', 'error'
    $('.venice-overlay__error').text msg

  onVideoCompleted: ->
    @fadeInCoverAndPauseVideo()
    vid = $('.venice-overlay--completed').get(@sectionIndex)
    $(vid).css({'opacity': 1, 'z-index': 100})

  swapVideo: ->
    @VeniceVideoView.trigger 'swapVideo',
      video: @chooseVideoFile()
      slug: @section.slug

  onReadMore: (e) ->
    e.preventDefault()
    vid = $('.venice-overlay--completed').get(@sectionIndex)
    $(vid).animate({'opacity': 0, 'z-index': -1}, 500)
    $('html,body').animate({ scrollTop: window.innerHeight }, 400)

  swapDescription: ->
    $('.venice-body--article').remove()
    $('.venice-body').prepend videoDescription
      section: @section
      sd: sd
      markdown: markdown
    $('.venice-body--article').addClass('active')

  chooseVideoFile: ->
    section = if @section.published then @section else @curation.get('sections')[0]
    if @parser.getOS().name is 'iOS'
      sd.APP_URL + section.video_url_medium
    else if @parser.getDevice().type is 'mobile'
      sd.APP_URL + section.video_url_adaptive
    else
      sd.APP_URL + section.video_url

  showCta: (e) ->
    @$(e.target).fadeOut()
    @$(e.target).next('.venice-overlay__subscribe-form').fadeIn()

  onSubscribe: (e) ->
    @$(e.currentTarget).addClass 'is-loading'
    @email = @$(e.currentTarget).prev('input').val()
    $.ajax
      type: 'POST'
      url: '/editorial-signup/form'
      data:
        email: @email
        name: sd.CURRENT_USER?.name or= ''
      error: (res) =>
        new FlashMessage message: 'Whoops, there was an error. Please try again.'
        @$(e.currentTarget).removeClass 'is-loading'
      success: (res) =>
        analyticsHooks.trigger 'email:signup', {user_email: @email}
        new FlashMessage message: 'Thank you for signing up.'
        @$(e.currentTarget).removeClass 'is-loading'
        @$('.venice-overlay__cta').hide()

  toggleVideoGuide: (e) ->
    e.preventDefault()
    $('.venice-guide').fadeToggle('fast')

  setupFollowButtons: ->
    @artists = []
    @$('.venice-body .artist-follow').each (i, artist) =>
      @artists.push {id: $(artist).data('id'), _id: $(artist).attr('artist-id')}
    @followButtons = _.uniq(@artists).map (artist) =>
      artist = new Artist id: artist.id, _id: artist._id
      new FollowButton
        el: @$(".venice-body .artist-follow[data-id='#{artist.id}']")
        following: @following
        modelName: 'artist'
        model: artist
        context_page: 'venice_biennale_2017'
        context_module: 'article_artist_follow'
        entity_id: artist.id
        href: sd.APP_URL + sd.CURRENT_PATH
      new FollowButton
        el: @$(".venice-carousel .artist-follow[data-id='#{artist.id}']")
        following: @following
        modelName: 'artist'
        model: artist
        context_page: 'venice_biennale_2017'
        context_module: 'article_artist_follow'
        entity_id: artist.id
        href: sd.APP_URL + sd.CURRENT_PATH
    @following.syncFollows(_.pluck @artists, 'id') if sd.CURRENT_USER?
    @$('.venice-body__follow-item').show()

  submitPhoneLink: (e) ->
    e.preventDefault()
    @$('.venice-body__text-link button').addClass 'is-loading'
    url = @curation.get('sections')[@sectionIndex].video_url_external
    $.ajax
      type: 'POST'
      url: '/venice-biennale/sms'
      data:
        to: $('.venice-body__text-link input').val()
        message: 'Explore Venice in 360°: ' + url
      error: (xhr) ->
        new FlashMessage message: xhr.responseJSON.msg
      success: ->
        new FlashMessage message: 'Message sent, please check your phone.'
      complete: ->
        $('.venice-body__text-link button').removeClass 'is-loading'
