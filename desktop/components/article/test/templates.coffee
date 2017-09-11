_ = require 'underscore'
_s = require 'underscore.string'
cheerio = require 'cheerio'
path = require 'path'
jade = require 'jade'
fs = require 'fs'
moment = require 'moment'
markdown = require '../../../components/util/markdown'
Article = require '../../../models/article'
Articles = require '../../../collections/articles'
fixtures = require '../../../test/helpers/fixtures.coffee'

render = (templateName) ->
  filename = path.resolve __dirname, "../templates/#{templateName}.jade"
  jade.compile(
    fs.readFileSync(filename),
    { filename: filename }
  )

describe 'article show template', ->

  it 'renders sectionless articles', ->
    html = render('index')
      article: new Article title: 'hi', sections: [], section_ids: [], contributing_authors: []
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
    html.should.containEql 'hi'

  it 'renders fullscreen headers with video', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: []
        contributing_authors: []
        hero_section:
          type: 'fullscreen'
          url: 'http://video.mp4'
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
    html.should.containEql '<video src="http://video.mp4" autoplay="autoplay" loop="loop" muted="muted" playsinline="playsinline" class="article-fullscreen__video-player">'
    html.should.containEql 'article-fullscreen__video-player'

  it 'renders fullscreen headers with static image', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: []
        contributing_authors: []
        hero_section:
          type: 'fullscreen'
          url: 'http://image.jpg'
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
    html.should.containEql '<img src="http://image.jpg"'
    html.should.containEql 'class="article-fullscreen__image"'

  it 'superSubArticles can render fullscreen header and SA menu with correct classes', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: []
        contributing_authors: []
        hero_section:
          type: 'fullscreen'
          url: 'http://image.jpg'
      footerArticles: new Articles
      superArticle: new Article
        super_article:
          partner_logo: 'http://logo.jpg'
          partner_logo_link: 'http://logo.com'
          partner_fullscreen_header_logo: 'http://fullscreen-logo.jpg'
      superSubArticles: {models: []}
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
    html.should.containEql '<img src="http://image.jpg"'
    html.should.containEql 'class="article-fullscreen__image"'
    html.should.containEql 'article-sa-sticky-header'
    html.should.containEql '<a href="http://logo.com"><img src="http://fullscreen-logo.jpg"'
    html.should.not.containEql 'visible no-transition'

  it 'super articles have markdown-supported footers', ->
    html = render('index')
      article: new Article
        title: 'Super Article Title'
        sections: []
        contributing_authors: []
        is_super_article: true
      footerArticles: new Articles
      superArticle: new Article
        super_article:
          partner_logo: 'http://logo.jpg'
          partner_logo_link: 'http://logo.com'
          partner_fullscreen_header_logo: 'http://fullscreen-logo.jpg'
          footer_blurb: 'Article Test [Link](http://artsy.net)'
      superSubArticles: new Articles
      crop: ->
      resize: ->
      moment: moment
      sd: {}
      asset: ->
      markdown: markdown
    html.should.containEql '<a href="http://artsy.net">Link</a>'

  it 'can optionally exclude share buttons', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'text'
            body: '<p>Bob Olsen</p>'
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      hideShare: true
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->

    html.should.not.containEql 'share'

  it 'can optionally exclude subscribe section', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'text'
            body: '<p>Bob Olsen</p>'
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      hideSubscribe: true
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->

    html.should.not.containEql 'Subscribe'


  it 'does not render a TOC header if there are no links', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'toc'
            links: []
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
    html.should.not.containEql 'Table Of Contents'

  it 'renders top stories', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'callout'
            top_stories: true
            article: ''
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: PARSELY_ARTICLES: [
        {
          url: 'http://artsy.net/article/editorial-cool-article'
          image_url: 'http://artsy.net/image.png'
          title: '5 Must Read Stories'
        }
      ]
      asset: ->
    html.should.containEql 'Top Stories on Artsy'
    html.should.containEql '5 Must Read Stories'
    html.should.containEql 'http://artsy.net/article/editorial-cool-article'
    html.should.containEql 'http://artsy.net/image.png'

  it 'renders pull quotes', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'callout'
            top_stories: false
            article: ''
            text: 'It isn’t about ownership. It is about understanding these pieces not as static works of art for study, but as living pieces of significance to indigenous groups who have a right to them.'
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      calloutArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      asset: ->
      sd: {}
    html.should.containEql 'It isn’t about ownership.'

  it 'renders callouts without a text field', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'callout'
            top_stories: false
            article: '54276766fd4f50996aeca2b8'
            text: ''
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      calloutArticles: new Articles fixtures.article
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      asset: ->
      sd: {}
    html.should.containEql 'Top Ten Booths at miart 2014'

  it 'renders callouts with a text field', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'callout'
            top_stories: false
            article: '54276766fd4f50996aeca2b8'
            text: 'There is a text field here.'
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      calloutArticles: new Articles fixtures.article
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      asset: ->
      sd: {}
    html.should.containEql 'There is a text field here.'

  it 'renders artworks', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'artworks',
            ids: ['5321b73dc9dc2458c4000196', '5321b71c275b24bcaa0001a5'],
            layout: 'overflow_fillwidth',
            artworks: [
              {
                type: 'artwork'
                id: '5321b73dc9dc2458c4000196'
                slug: "govinda-sah-azad-in-between-1",
                date: "2015",
                title: "In Between",
                image: "https://d32dm0rphc51dk.cloudfront.net/zjr8iMxGUQAVU83wi_oXaQ/larger.jpg",
                partner: {
                  name: "October Gallery",
                  slug: "october-gallery"
                },
                artists: [{
                  name: "Govinda Sah 'Azad'",
                  slug: "govinda-sah-azad"
                },
                {
                  name: "Andy Warhol",
                  slug: "andy-warhol"
                }]
              },{
                type: 'artwork'
                id: '5321b71c275b24bcaa0001a5'
                slug: "govinda-sah-azad-in-between-2",
                date: "2015",
                title: "In Between 2",
                image: "https://d32dm0rphc51dk.cloudfront.net/zjr8iMxGUQAVU83wi_oXaQ2/larger.jpg",
                partner: {
                  name: "October Gallery",
                  slug: "october-gallery"
                },
                artists: [{
                  name: "Govinda Sah 'Azad'",
                  slug: "govinda-sah-azad"
                }]
              }
            ]
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
      _s: _s
    html.should.containEql '/artwork/govinda-sah-azad-in-between-1'
    html.should.containEql '/artwork/govinda-sah-azad-in-between-2'
    html.should.containEql 'October Gallery'
    html.should.containEql "Govinda Sah 'Azad'"
    html.should.containEql "Andy Warhol"
    html.should.containEql 'In Between 2'


  it 'renders image collections', ->
    html = render('index')
      article: new Article
        title: 'hi'
        sections: [
          {
            type: 'image_collection',
            layout: 'overflow_fillwidth',
            images: [
              {
                type: 'artwork'
                id: '5321b73dc9dc2458c4000196'
                slug: "govinda-sah-azad-in-between-1",
                date: "2015",
                title: "In Between",
                image: "https://d32dm0rphc51dk.cloudfront.net/zjr8iMxGUQAVU83wi_oXaQ/larger.jpg",
                partner: {
                  name: "October Gallery",
                  slug: "october-gallery"
                },
                artists: [{
                  name: "Govinda Sah 'Azad'",
                  slug: "govinda-sah-azad"
                },
                {
                  name: "Andy Warhol",
                  slug: "andy-warhol"
                }]
              },{
                type: 'image'
                url: "http://artsy.net/image.jpg",
                caption: "<p>Some cool art from 2015</p>",
              }
            ]
          }
        ]
        contributing_authors: []
      footerArticles: new Articles
      crop: (url) -> url
      resize: (u) -> u
      moment: moment
      sd: {}
      asset: ->
      _s: _s
    html.should.containEql '/artwork/govinda-sah-azad-in-between-1'
    html.should.containEql 'http://artsy.net/image.jpg'
    html.should.containEql '/october-gallery'
    html.should.containEql "Govinda Sah 'Azad'"
    html.should.containEql "Andy Warhol"
    html.should.containEql '<p>Some cool art from 2015</p>'
