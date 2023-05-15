import React, { useEffect } from "react";
import { Button } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useState } from "react";
import { LegacyStack, RadioButton, Checkbox, Spinner } from "@shopify/polaris";

function Recommendations() {
  const [recommendations, setRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetch = useAuthenticatedFetch();
  const handleChange = async (value) => {
    setRecommendations(value);
    await fetch(`/api/add-related-theme/?recommendationsChange=${value}`);
  };

  useEffect(async () => {
    await fetch(`/api/theme-data-status`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setRecommendations(data.themeValueStatus);
        setIsLoading(false);
      });
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
          <Checkbox
            label="Recommendations Products"
            checked={recommendations}
            onChange={handleChange}
            class="sider"
          />
        )}
      </LegacyStack>
    </>
  );
}

export default Recommendations;
