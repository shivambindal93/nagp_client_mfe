import React, { useCallback, useEffect, useState } from "react";
import MockInsuranceProducts from "./assets/insuranceProducts.json";
import { isDevEnv } from "./index.js";
import "./PremiumDetails.scss";

const PremiumDetails = () => {
  const [selectedProduct, setSelectedProduct] = useState(
    MockInsuranceProducts[0],
  );
  const [formData, setFormData] = useState({ age: "", coverageAmount: "" });
  const [premiumResult, setPremiumResult] = useState(null);

  const handleProductChange = (productId) => {
    const selected = MockInsuranceProducts.find(
      (product) => product.id === productId,
    );
    setSelectedProduct(selected);
  };

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const calPremiumCallback = (eventData) => {
    debugger;
    setPremiumResult(eventData.detail.result);
  };

  const calculatePremium = useCallback(async () => {
    debugger;
    if (isDevEnv) {
      const { calculatePremiumWorker } = await import(
        "./assets/calculator.worker.js"
      );
      const result = calculatePremiumWorker(formData, selectedProduct);
      setPremiumResult(result);
    } else {
      const calPremium = new CustomEvent("calPremium", {
        detail: { formData, selectedProduct },
      });
      window.dispatchEvent(calPremium);

      window.addEventListener("resolvedCalPremium", calPremiumCallback);

      return () => {
        window.removeEventListener("resolvedCalPremium", calPremiumCallback);
      };
    }
  }, [formData, selectedProduct]);

  useEffect(() => {
    return () => {
      window.removeEventListener("resolvedCalPremium", calPremiumCallback);
    };
  }, []);

  return (
    <div className="insurance-container">
      <h2>Insurance Products</h2>
      <ul className="product-list">
        {MockInsuranceProducts.map((product) => (
          <li key={product.id} className="product-item">
            <label className="product-label">
              <input
                type="radio"
                value={product.id}
                checked={selectedProduct.id === product.id}
                onChange={() => handleProductChange(product.id)}
                className="product-radio"
              />
              {product.name}
            </label>
          </li>
        ))}
      </ul>

      <div className="selected-product-details">
        <h2>Selected Product Details</h2>
        <div>
          <strong>Name:</strong> {selectedProduct.name}
          <br />
          <strong>Coverage:</strong> {selectedProduct.coverage}
          <br />
          <strong>Premium:</strong> {selectedProduct.premium}
        </div>
      </div>

      <div className="quote-form">
        <h2>Insurance Quote Form</h2>
        <form>
          <label>
            Age:
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleFormChange("age", e.target.value)}
            />
          </label>
          <br />
          <label>
            Coverage Amount:
            <input
              type="number"
              value={formData.coverageAmount}
              onChange={(e) =>
                handleFormChange("coverageAmount", e.target.value)
              }
            />
          </label>
        </form>
        <button onClick={calculatePremium}>Calculate Premium</button>
        {premiumResult && <div>{premiumResult}</div>}
      </div>
    </div>
  );
};

export default PremiumDetails;
