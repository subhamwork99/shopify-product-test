import { Layout, Page ,Text , Card} from '@shopify/polaris'
import React from 'react'

function Widgets() {
  return (
    <Page fullWidth>
      <Text as="h1" id="page-title">
      Widgets
      </Text>
      <Layout>
      <Layout.Section>
          <div className="card-grid">
            <Card >
              <Card.Section>
                <div className="section-flex">
                <Text id="recommendation">Recommendation</Text>
                <section id="check-box">
                  <div className="card">
                    <div className="toggle">
                      <input type="checkbox" id="check-1" />
                      <label htmlFor="check-1" />
                    </div>
                  </div>
                </section>
                </div>
              </Card.Section>
              <Card.Section>
                <Text id="recommendation-text">
                  Turn on the toggle to enable product recommendations powered
                  by machine learning.
                </Text>
              </Card.Section>
            </Card>
            <Card >
              <Card.Section>
                <div className="section-flex">
                <Text id="recommendation">Recommendation</Text>
                <section id="check-box">
                  <div className="card">
                    <div className="toggle">
                      <input type="checkbox" id="check-1" />
                      <label htmlFor="check-1" />
                    </div>
                  </div>
                </section>
                </div>
              </Card.Section>
              <Card.Section>
                <Text id="recommendation-text">
                  Turn on the toggle to enable product recommendations powered
                  by machine learning.
                </Text>
              </Card.Section>
            </Card>
            <Card >
              <Card.Section>
                <div className="section-flex">
                <Text id="recommendation">Recommendation</Text>
                <section id="check-box">
                  <div className="card">
                    <div className="toggle">
                      <input type="checkbox" id="check-1" />
                      <label htmlFor="check-1" />
                    </div>
                  </div>
                </section>
                </div>
              </Card.Section>
              <Card.Section>
                <Text id="recommendation-text">
                  Turn on the toggle to enable product recommendations powered
                  by machine learning.
                </Text>
              </Card.Section>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default Widgets