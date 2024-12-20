import axios from "axios";
import React, { useState } from "react";
import {
  FaUpload,
  FaCheckCircle,
  FaCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";

// Import axios for making requests

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      setError(null);
    }
  };

  const validateFiles = (files) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        `Unsupported file format(s): ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload");
      return;
    }

    if (!validateFiles(files)) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      // Send the files to the backend API
      const response = await axios.post(
        "http://localhost:5000/api/upload/files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setProgress(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            }
          },
        }
      );

      setUploading(false);
      setExtracting(true);

      // Simulate AI extraction (this should ideally be replaced with actual data extraction logic)
      setTimeout(() => {
        setExtracting(false);
        setSuccess(response.data.message || "Data extracted successfully!");
      }, 5000); // Simulate extraction delay
    } catch (err) {
      setUploading(false);
      setError(
        err.response?.data?.message ||
          "An error occurred during file upload or extraction"
      );
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-400">
          Upload Files for AI Extraction
        </h1>

        <button
          className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-300"
          onClick={() =>
            alert(
              "Upload Instructions:\n1. Select files\n2. Click Upload\n3. Wait for extraction"
            )
          }
        >
          <FaQuestionCircle className="h-6 w-6 text-gray-400 hover:text-blue-400 transition-colors duration-300" />
        </button>
      </div>

      <div className="p-8 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800 mb-6 hover:border-blue-400 transition-colors duration-300">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".xlsx,.pdf,.jpg,.jpeg,.png"
          className="hidden"
          id="file-upload"
          disabled={uploading || extracting}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block text-center"
        >
          <FaUpload className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <p className="text-lg mb-2 text-gray-300">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-sm text-gray-400">
            Supports Excel (.xlsx), PDF, and image files (JPEG, PNG)
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Selected Files:
          </h2>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="bg-gray-700 p-2 rounded-lg flex justify-between items-center"
              >
                <span className="text-gray-200">{file.name}</span>
                <span className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || extracting || files.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-colors duration-300 flex items-center justify-center"
      >
        {uploading
          ? "Uploading..."
          : extracting
          ? "Extracting Data..."
          : "Upload and Extract Data"}
        {(uploading || extracting) && (
          <FaCircle className="ml-2 animate-pulse" />
        )}
      </button>

      {(uploading || extracting) && (
        <div className="mt-4">
          <div
            className="h-2 bg-gray-700 rounded overflow-hidden"
            style={{ width: "100%" }}
          >
            <div
              className="h-full bg-blue-500 rounded transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {uploading ? "Uploading files..." : "Extracting data with AI..."}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900 border border-red-700 p-4 rounded mt-4 flex items-center">
          <FiAlertTriangle className="mr-2 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 p-4 rounded mt-4 flex items-center">
          <FaCheckCircle className="mr-2 text-green-400" />
          <p className="text-green-200">{success}</p>
        </div>
      )}
    </div>
  );
}

export default UploadPage;