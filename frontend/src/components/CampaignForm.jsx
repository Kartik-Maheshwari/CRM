import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCampaign = () => {
  const [name, setName] = useState("");
  const [rules, setRules] = useState([
    { field: "", operator: "", value: "", logicOperator: "AND" },
  ]);
  const [audienceSize, setAudienceSize] = useState(0);
  const navigate = useNavigate();

  const handleAddRule = () => {
    setRules([
      ...rules,
      { field: "", operator: "", value: "", logicOperator: "AND" },
    ]);
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleLogicOperatorChange = (index, value) => {
    const newRules = [...rules];
    newRules[index].logicOperator = value;
    setRules(newRules);
  };

  const fetchAudienceSize = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/campaign/audience-size`,
        { rules }
      );
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      console.error("Error fetching audience size:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/campaign/create`,
        { name, rules },
        {
          headers: { Authorization: `${token}` },
        }
      );
      console.log("Campaign created:", response.data);
      navigate("/customers", { state: { customers: response.data.customers } });
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Campaign Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {rules.map((rule, index) => (
          <div key={index} className="space-y-2">
            {index !== 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logic Operator
                </label>
                <select
                  value={rule.logicOperator}
                  onChange={(e) =>
                    handleLogicOperatorChange(index, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field
              </label>
              <select
                value={rule.field}
                onChange={(e) =>
                  handleRuleChange(index, "field", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select field</option>
                <option value="totalSpends">Total Spends</option>
                <option value="visits">Visits</option>
                <option value="lastVisit">Last Visit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Operator
              </label>
              <select
                value={rule.operator}
                onChange={(e) =>
                  handleRuleChange(index, "operator", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select operator</option>
                <option value=">">Greater than</option>
                <option value="<=">Less than or equal to</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                type="number"
                value={rule.value}
                onChange={(e) =>
                  handleRuleChange(index, "value", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        ))}
        <div className="flex justify-around">
          <button
            type="button"
            onClick={handleAddRule}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Rule
          </button>
          <button
            type="button"
            onClick={fetchAudienceSize}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Check Audience Size
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Campaign
          </button>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Current Audience Size is : {audienceSize}
        </label>
      </form>
    </div>
  );
};

export default CreateCampaign;
