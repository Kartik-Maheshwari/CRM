import React, { useEffect, useState } from "react";
import axios from "axios";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem("token");
      console.log("token from local storage", token);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/campaign`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  const fetchCustomers = async (campaignId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/campaign/${campaignId}/customers`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const toggleCustomerList = (campaignId) => {
    if (selectedCampaign === campaignId) {
      setSelectedCampaign(null);
    } else {
      setSelectedCampaign(campaignId);
      fetchCustomers(campaignId);
    }
  };

  const formatRules = (rules) => {
    return rules
      .map((rule, index) => {
        const logicOperator = index !== 0 ? `${rule.logicOperator} ` : "";
        return `${logicOperator}${rule.field} ${rule.operator} ${rule.value}`;
      })
      .join(" ");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
      <ul className="space-y-4">
        {campaigns.map((campaign) => (
          <li key={campaign._id} className="border rounded-md p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{campaign.name}</h3>
                <p>Audience Size: {campaign.audienceSize}</p>
                <p>Rules: {formatRules(campaign.rules)}</p>
                <p>Sent: {campaign.sent}</p>
                <p>Failed: {campaign.failed}</p>
                <p>
                  Created At:{" "}
                  {new Date(campaign.createdAt).toLocaleDateString()}{" "}
                  {new Date(campaign.createdAt).toLocaleTimeString()}
                </p>{" "}
                {/* Add this line */}
              </div>
              <button
                onClick={() => toggleCustomerList(campaign._id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {selectedCampaign === campaign._id
                  ? "Hide Customers"
                  : "Show Customers"}
              </button>
            </div>
            {selectedCampaign === campaign._id && (
              <div className="mt-4">
                {customers.length === 0 ? (
                  <p>No customers found.</p>
                ) : (
                  <ul className="space-y-2">
                    {customers.map((customer) => (
                      <li
                        key={customer._id}
                        className="border rounded-md p-2 shadow-sm"
                      >
                        <h4 className="text-md font-medium">{customer.name}</h4>
                        <p>Email: {customer.email}</p>
                        <p>Total Spends: {customer.totalSpends}</p>
                        <p>Visits: {customer.visits}</p>
                        <p>
                          Last Visit:{" "}
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignList;
