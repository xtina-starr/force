import * as routes from './routes'
import express from 'express'
import path from 'path'
import { resize, crop } from '../../components/resizer'
import { toSentence } from 'underscore.string'

const app = express()
app.set('views', path.resolve(__dirname, 'templates'))
app.set('view engine', 'jade')
app.locals.resize = resize
app.locals.crop = crop
app.locals.toSentence = toSentence

app.get('/artsy-primer/:id', routes.article)
app.get('/primer-digest/:id', routes.article)
app.get('/artsy-primer-personalize*', routes.personalize)
app.post('/artsy-primer/set-sailthru', routes.setSailthruData)

export default app
