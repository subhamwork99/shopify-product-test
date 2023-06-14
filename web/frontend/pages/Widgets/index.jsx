import { Layout, Page, Text, Card, Spinner ,Toast} from "@shopify/polaris";
import React, { useState, useEffect } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";

function Widgets() {
  const [analytics, setAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({});
  const fetch = useAuthenticatedFetch();

  const handleChange = async (value) => {
    console.log("value", value.target.checked);
    console.log("analytics", analytics);
    setAnalytics(value.target.checked);
    await fetch(
      `/api/add-related-theme/?recommendationsChange=${value.target.checked}`
    )
      .then((res) => {
        if (res.ok) {
          setToastContent({ content: "API Success", error: false });
        } else {
          setToastContent({ content: "API Error", error: true });
        }
        setShowToast(true);
      })
      .catch((err) => {
        setToastContent({ content: "API Error", error: true });
        setShowToast(true);
      });
  };

  useEffect(async () => {
    await fetch(`/theme-data-status`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setAnalytics(data.themeValueStatus);
      })
      .catch((err) => {
        setToastContent({ content: "API Error", error: true });
        setShowToast(true);
      });
    setIsLoading(false);
  }, []);

  return (
    <div className="widgetsWrapper">
    <Page fullWidth>
      <Text as="h1" id="page-title">
        Widgets
      </Text>
      <Layout>
        {isLoading ? (
          <Spinner
            accessibilityLabel="Spinner example"
            size="large"
            hasFocusableParent={isLoading}
          />
        ) : (
          <Layout.Section>
            <div className="card-grid">
              <Card>
                <Card.Section>
                  <div className="section-flex">
                    <Text id="recommendation">Product Recommendations</Text>
                    <section id="check-box">
                      <div className="card">
                        <div className="toggle">
                          <input
                            type="checkbox"
                            id="check-1"
                            checked={analytics}
                            onChange={handleChange}
                          />
                          <label htmlFor="check-1" />
                        </div>
                      </div>
                    </section>
                  </div>
                </Card.Section>
                <Card.Section>
                  <Text id="recommendation-text">
                  Discover related products and make informed purchasing decisions with personalized recommendations.
                  </Text>
                </Card.Section>
              </Card>
            </div>
          </Layout.Section>
        )}
      </Layout>
      {showToast && (
              <Toast
                error={toastContent.error}
                content={toastContent.content}
                onDismiss={() => setShowToast(false)}
              />
            )}
    </Page>
    </div>
  );
}

export default Widgets;
