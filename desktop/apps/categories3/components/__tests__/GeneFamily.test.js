import React from 'react'
import { render } from 'enzyme'
import GeneFamily from '../GeneFamily'

describe('GeneFamily', () => {
  let rendered
  let geneFamily
  let featuredGenes

  beforeEach(() => {
    geneFamily = {
      id: 'materials',
      name: 'Materials',
      genes: [
        {
          id: 'gold',
          name: 'Gold'
        },
        {
          id: 'silver',
          name: 'Silver'
        },
        {
          id: 'bronze',
          name: 'Bronze'
        }
      ]
    }

    featuredGenes = {
      name: 'Materials',
      genes: [
        {
          id: 'gold',
          title: 'Gold',
          href: '/gene/gold',
          image: {
            url: 'gold.jpg'
          }
        },
        {
          id: 'silver',
          title: 'Silver',
          href: '/gene/silver',
          image: {
            url: 'silver.jpg'
          }
        },
        {
          id: 'bronze',
          title: 'Bronze',
          href: '/gene/bronze',
          image: {
            url: 'bronze.jpg'
          }
        },
        {
          id: 'wood',
          title: 'Wood',
          href: '/gene/wood',
          image: {
            url: 'wood.jpg'
          }
        }
      ]
    }

    rendered = render(<GeneFamily featuredGenes={featuredGenes} {...geneFamily} />)
  })

  it('renders a family name heading', () => {
    rendered.find('h2').text().should.equal('Materials')
  })

  it('renders image links for featured genes', () => {
    rendered.find('a + img').length.should.equal(3)
  })

  it('renders a list of genes', () => {
    rendered.find('ul').length.should.equal(1)
    rendered.find('li').length.should.equal(3)
  })

  it('alphabetizes the genes', () => {
    rendered.find('li a').eq(0).text().should.equal('Bronze')
    rendered.find('li a').eq(1).text().should.equal('Gold')
    rendered.find('li a').eq(2).text().should.equal('Silver')
  })
})
