import { Layout, Page, Text, Card, Spinner ,Toast, Icon ,Modal, TextContainer, Image} from "@shopify/polaris";
import React, { useState, useEffect, useCallback } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";
import windowImage from "../../image/window-element.png"; 
import "./index.css"
import mobile from "../../image/mobile.png";
import desktop from "../../image/desktop.png"
function Widgets() {
  const [analytics, setAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({});
  const [active, setActive] = useState(false);
  const isMobileView = window.innerWidth <= 767;
  const handleChangePopup = useCallback(() => setActive(!active), [active]);
  const fetch = useAuthenticatedFetch();

  const handleChange = async (value) => {
    console.log("value", value.target.checked);
    console.log("analytics == 'true'",analytics == "true");
    await fetch(
      `/api/add-related-theme/?recommendationsChange=${value.target.checked}`
    )
      .then(async(res) => {
        if (res.ok) {
          setToastContent({ content: "API Success", error: false });
          await fetch(`/api/theme-data-status-checkBox`)
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
    await fetch(`/api/theme-data-status-checkBox`)
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
                            checked={analytics == "true"}
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
                  {analytics == "true" ?
                <div className="preview-text" onClick={handleChangePopup} >
                  <span>
              preview 
                  </span>
                </div>
              :null}
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
    <Modal 
        open={active}
        onClose={handleChangePopup}
        title="PREVIEW"
        id="page-title"
      >
        <Modal.Section>
          <div className="popUp-img">
          {isMobileView ? (
        <Image source={mobile} />
      ) : (
        <Image source={desktop} />
      )}
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}

export default Widgets;
