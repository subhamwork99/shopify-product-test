import React, { useEffect } from "react";
import {
  Button,
  LegacyStack,
  RadioButton,
  Checkbox,
  Spinner,
  Toast,
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useState } from "react";

function Analytics() {
  const [analytics, setAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  
  const [toastContent, setToastContent] = useState({});
  const fetch = useAuthenticatedFetch();

  const handleChange = async (value) => {
    setAnalytics(value);
    await fetch(`/api/add-related-theme/?recommendationsChange=${value}`)
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
    <>
      <LegacyStack vertical>
        {isLoading ? (
          <Spinner
            accessibilityLabel="Spinner example"
            size="large"
            hasFocusableParent={isLoading}
          />
        ) : (
          <>
            <Checkbox
              label="Analytics Products"
              checked={analytics}
              onChange={handleChange}
              class="sider"
            />
            {showToast && (
              <Toast
                error={toastContent.error}
                content={toastContent.content}
                onDismiss={() => setShowToast(false)}
              />
            )}
          </>
        )}
      </LegacyStack>
    </>
  );
}

export default Analytics;
