export default `
  id
  title
  search_title
  social_title
  description
  search_description
  social_description
  thumbnail_image
  social_image
  published_at
  slug
  layout
  featured
  channel_id
  partner_channel_id
  indexable
  keywords
  published
  postscript
  email_metadata {
    headline
    author
    credit_line
    credit_url
    image_url
  }
  contributing_authors {
    name
    id
  }
  vertical {
    name
    id
  }
  hero_section {
    ...Image
    ...Video
    ...on Fullscreen {
      type
      title
      url
    }
  }
  sections {
    ... on Text {
      type
      body
    }
    ... on Embed {
      type
      url
      height
      mobile_height
      layout
    }
    ...Video
    ... on Callout {
      type
    }
    ... on ImageCollection {
      type
      layout
      images {
        ...Artwork
        ...Image
      }
    }
    ... on ImageSet {
      type
      title
      layout
      images {
        ...Image
        ...Artwork
      }
    }
  }
`
