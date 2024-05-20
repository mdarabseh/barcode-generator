import React, { useState } from "react";

function App() {
  const [barcodeList, setBarcodeList] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [weight, setWeight] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleInputChange = (event) => {
    setBarcodeList(event.target.value);
    setErrorMessage("");
  };

  const handleWeightChange = (event) => {
    const value = event.target.value;
    if (value.length <= 5 || /^\d{0,5}$/.test(value)) {
      setWeight(value);
      setErrorMessage(""); // Clear any existing error message
    } else {
      setErrorMessage("Weight should not exceed 5 digits.");
    }
  };

  const generateChecksums = () => {
    const barcodes = barcodeList
      .split("\n")
      .filter((barcode) => barcode.trim() !== "");
    const validBarcodes = [];
    for (const barcode of barcodes) {
      if (!/^(21\d{10})(-\w+)?$/.test(barcode)) {
        setErrorMessage(
          `Invalid barcode: ${barcode}. Barcode must start with '21' followed by exactly 10 digits and optionally a product name separated by a dash.`
        );
        return;
      }
      const newBarcode = weight ? addWeightToBarcode(barcode, weight) : barcode;
      const checksum = calculateChecksum(newBarcode);
      validBarcodes.push(`${newBarcode}${checksum}`);
    }
    setGeneratedCodes(validBarcodes);
    setErrorMessage("");
    setCopiedIndex(null);
  };

  const addWeightToBarcode = (barcode, weight) => {
    const productNumber = barcode.substring(2, 7);
    const newBarcode = `21${productNumber}${weight.padStart(5, "0")}`;
    return newBarcode;
  };

  const calculateChecksum = (barcode) => {
    const digits = barcode.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += i % 2 === 0 ? digits[i] : digits[i] * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum;
  };

  const copyCodeToClipboard = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
  };

  const copyAllToClipboard = () => {
    const allCodes = generatedCodes.join("\n");
    navigator.clipboard.writeText(allCodes);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          EAN-13 Barcode Checksum Generator
        </h2>
        <textarea
          className="mt-6 p-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter barcode numbers (one per line)"
          value={barcodeList}
          onChange={handleInputChange}
          rows={10}
        />
        <div className="mt-4 flex items-center justify-between">
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700"
          >
            Weight (in grams):
          </label>
          <input
            type="text"
            name="weight"
            id="weight"
            className="mt-1 p-1 block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Optional"
            value={weight}
            onChange={handleWeightChange}
          />
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={generateChecksums}
          >
            Generate Checksums
          </button>
          <button
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={copyAllToClipboard}
          >
            Copy All
          </button>
        </div>
        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        <h2 className="mt-8 mb-2 text-center text-xl font-semibold text-gray-900">
          Generated Codes:
        </h2>
        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
          {generatedCodes.map((code, index) => (
            <li
              key={index}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-gray-900">{code}</span>
              <button
                className={`ml-2 py-1 px-2 border border-transparent shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  copiedIndex === index
                    ? "text-white bg-green-500"
                    : "text-white bg-indigo-600 hover:bg-indigo-700"
                }`}
                onClick={() => copyCodeToClipboard(code, index)}
              >
                {copiedIndex === index ? "Copied" : "Copy"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
