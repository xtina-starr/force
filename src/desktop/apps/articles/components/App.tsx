import React, { Component } from "react"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import { ContextProvider } from "reaction/Artsy"
import { InfiniteScrollNewsArticle } from "desktop/apps/article/components/InfiniteScrollNewsArticle"
import { data as sd } from "sharify"

export interface Props {
  articles: ArticleData[]
  isMobile: boolean
  marginTop: string
}

export default class App extends Component<Props, any> {
  render() {
    return (
      <ContextProvider user={sd.CURRENT_USER}>
        <InfiniteScrollNewsArticle {...this.props} />
      </ContextProvider>
    )
  }
}
