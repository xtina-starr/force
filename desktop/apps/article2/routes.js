import * as _ from 'underscore'
import App from 'desktop/apps/article2/components/App'
import ArticleQuery from 'desktop/apps/article2/queries/article'
import Article from 'desktop/models/article.coffee'
import positronql from 'desktop/lib/positronql.coffee'
import embed from 'particle'
import { crop, resize } from 'desktop/components/resizer/index.coffee'
import { data as sd } from 'sharify'
import { renderLayout } from '@artsy/stitch'
import { stringifyJSONForWeb } from 'desktop/components/util/json.coffee'

export async function index (req, res, next) {
  const articleId = req.params.slug

  try {
    const data = await positronql({ query: ArticleQuery(articleId) })
    const article = data.article
    const relatedArticles = data.relatedArticles

    if (article.channel_id !== sd.ARTSY_EDITORIAL_CHANNEL) {
      return classic(req, res, next)
    }

    if (articleId !== article.slug) {
      return res.redirect(`/article2/${article.slug}`)
    }

    const layout = await renderLayout({
      basePath: res.app.get('views'),
      layout: '../../../components/main_layout/templates/react_index.jade',
      config: {
        styledComponents: true
      },
      blocks: {
        head: 'meta.jade',
        body: App
      },
      locals: {
        ...res.locals,
        assetPackage: 'article2',
        bodyClass: 'body-no-margins',
        crop: crop
      },
      data: {
        article,
        relatedArticles
      }
    })

    res.send(layout)
  } catch (error) {
    next(error)
  }
}

async function classic (req, res, next) {
  const article = new Article({id: req.params.slug})
  const accessToken = req.user ? req.user.get('accessToken') : null

  article.fetchWithRelated({
    accessToken,
    error: res.backboneError,
    success: (data) => {
      if (req.params.slug !== data.article.get('slug')) {
        return res.redirect(`/article2/${data.article.get('slug')}`)
      }

      if (data.partner) {
        return res.redirect(`/${data.partner.get('default_profile_id')}/article/${data.article.get('slug')}`)
      }

      res.locals.sd.ARTICLE = data.article.toJSON()
      res.locals.sd.INCLUDE_SAILTHRU = res.locals.sd.ARTICLE && res.locals.sd.ARTICLE.published
      res.locals.sd.ARTICLE_CHANNEL = data.channel.toJSON()
      res.locals.jsonLD = stringifyJSONForWeb(data.article.toJSONLD())

      res.render('article', _.extend(data, {
        embed,
        crop,
        resize
      }))
    }
  })
}

export function amp (req, res, next) {
  const article = new Article({id: req.params.slug})

  article.fetchWithRelated({
    error: res.backboneError,
    success: (data) => {
      if (req.params.slug !== data.article.get('slug')) {
        return res.redirect(`/article2/${data.article.get('slug')}/amp`)
      }

      if (!data.article.hasAMP()) {
        return next()
      }

      data.article = data.article.prepForAMP()
      res.locals.jsonLD = stringifyJSONForWeb(data.article.toJSONLDAmp())

      return res.render('amp_article', _.extend(data, {
        resize,
        crop,
        embed
      }))
    }
  })
}
