import React, { useState, useEffect } from "react";
import "./App.css";
import {
  calculateParentValues,
  updateValue,
  updateValueAndDistribute,
  calculateVariance,
  calculateGrandTotal,
} from "./helper/helper";

import {initialData} from "./data/data"

function App() {
  const [data, setData] = useState(initialData);
  const [inputValue, setInputValue] = useState({});

  useEffect(() => {
    // Calculate initial values for parent rows
    const newData = calculateParentValues(JSON.parse(JSON.stringify(data))); // Deep copy to avoid mutating original data
    setData(newData);
  }, [data]);

  const handleInputChange = (id, value) => {
    setInputValue((prev) => ({ ...prev, [id]: value }));
  };

  const handleAllocationPercentage = (id) => {
    const percentage = parseFloat(inputValue[id]);
    if (isNaN(percentage)) {
      alert("Please enter a valid percentage.");
      return;
    }

    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    const updatedData = updateValue(newData, id, (row) => {
      const increase = row.value * (percentage / 100);
      return row.value + increase;
    });

    setData(calculateParentValues(updatedData)); // Recalculate parent values after update
    setInputValue({}); // Clear input
  };

  const handleAllocationValue = (id) => {
    const newValue = parseFloat(inputValue[id]);
    if (isNaN(newValue)) {
      alert("Please enter a valid value.");
      return;
    }

    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    const updatedData = updateValueAndDistribute(newData, id, newValue);

    setData(calculateParentValues(updatedData));
    setInputValue({}); // Clear input
  };

  const renderRows = (rows, level = 0) => {
    return rows.map((row) => (
      <React.Fragment key={row.id}>
        <tr>
          <td style={{ paddingLeft: `${level * 20}px` }}>{row.label}</td>
          <td>{row.value}</td>
          <td>
            <input
              type="number"
              value={inputValue[row.id] || ""}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
            />
          </td>
          <td>
            <button onClick={() => handleAllocationPercentage(row.id)}>
              Allocation %
            </button>
          </td>
          <td>
            <button onClick={() => handleAllocationValue(row.id)}>
              Allocation Val
            </button>
          </td>
          <td>{calculateVariance(row.originalValue, row.value)}</td>
        </tr>
        {row.children && renderRows(row.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="App">
      <h1>Simple Hierarchical Table</h1>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>Input</th>
            <th>Allocation %</th>
            <th>Allocation Val</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>{renderRows(data.rows)}</tbody>
        <tfoot>
            <tr className="grand-total-row">
              <td><b>Grand Total</b></td>
              <td><b>{calculateGrandTotal(data)}</b></td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
      </table>
    </div>
  );
}

export default App;
