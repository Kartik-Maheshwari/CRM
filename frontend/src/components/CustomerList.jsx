import React from "react";
import { useLocation } from "react-router-dom";

const CustomerList = () => {
  const location = useLocation();
  const { customers } = location.state || { customers: [] };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Filtered Customers</h2>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <ul className="space-y-4">
          {customers.map((customer) => (
            <li key={customer._id} className="border rounded-md p-4 shadow-sm">
              <h3 className="text-lg font-medium">{customer.name}</h3>
              <p>Email: {customer.email}</p>
              <p>Total Spends: {customer.totalSpends}</p>
              <p>Visits: {customer.visits}</p>
              <p>
                Last Visit: {new Date(customer.lastVisit).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;
