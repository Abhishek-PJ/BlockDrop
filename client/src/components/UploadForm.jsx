import React from "react";
import { useState } from "react";
import {
  AdvancedPasswordInput,
  FilePreview,
  ProgressBar,
  CopyToClipboardBtn,
} from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";

const receiversEmailSchema = z.string().email();
const passwordSchema = z.string().min(20, "Password field must be valid length and value")

const UploadForm = ({ progress }) => {
  const [file, setFile] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [filePassword, setFilePassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const allowedExtensions = [
    "pdf",
    "docx",
    "doc",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "rtf",
    "html",
    "zip",
    "mp3",
    "m4a",
    "wma",
    "mpg",
    "flv",
    "avi",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "ppt",
    "pptx",
    "wav",
    "mp4",
    "m4v",
    "wmv",
    "avi",
    "epub",
  ];

  const onFileSelect = (file) => {
    if (file && file.size > 20000000) {
      toast.warn("File size is more than 20MB");
      setErrorMsg("Max file upload size is 20MB");
      return;
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      toast.warn("File type not allowed");
      setErrorMsg(
        `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`
      );
      return;
    }

    setErrorMsg(null);
    setFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  async function generateKey(password, salt, keyLength = 256) {
    const algo = {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 1000,
    };
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const aesKey = await crypto.subtle.deriveKey(
      algo,
      baseKey,
      { name: "AES-GCM", length: keyLength },
      true,
      ["encrypt", "decrypt"]
    );

    return aesKey;
  }

  const encryptFile = async (file, password) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await generateKey(password, salt);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      await file.arrayBuffer()
    );

    return new Blob([salt, iv, new Uint8Array(encryptedContent)]);
  };

  const upload = async (e) => {
    e.preventDefault();

    if (receiverEmail.length === 0) {
      toast.warn("Please enter value for email");
      return;
    }

    if (!receiversEmailSchema.safeParse(receiverEmail).success) {
      toast.warn("Please enter valid email");
      return;
    }

    if (!passwordSchema.safeParse(filePassword).success) {
      toast.warn("File password must be minimum 20 characters and must be string");
      return;
    }

    if (!hasUpperCase(filePassword)) {
      toast.warn("File password should have at least 1 uppercase character");
      return;
    }

    try {
      const hashedPassword = await hashPassword(filePassword);

      const encryptedFile = await encryptFile(file, filePassword);

      let formData = new FormData();
      formData.append("encryptedFile", encryptedFile);
      formData.append("originalName", file.name);
      formData.append("receiverEmail", receiverEmail);
      formData.append("password", hashedPassword);

      await axios.post("http://localhost:4000", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("File successfully uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Error uploading file");
    }
  };

  const hasUpperCase = (str) => {
    return str !== str.toLowerCase();
  };

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Upload Dropzone */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl group ${
            isDragOver 
              ? 'border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 scale-[1.02] shadow-2xl' 
              : 'border-blue-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className={`relative transition-all duration-500 ${isDragOver ? 'animate-bounce' : 'group-hover:animate-pulse'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <svg
                className="relative w-16 h-16 mb-4 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg md:text-2xl text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Click to upload</span> or{" "}
              <strong className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300">drag</strong> and{" "}
              <strong className="text-purple-500 group-hover:text-purple-600 transition-colors duration-300">drop</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Max Size: 20MB • Multiple formats supported
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3 opacity-60 group-hover:opacity-80 transition-opacity duration-300">
              {['PDF', 'DOCX', 'XLSX', 'ZIP', 'MP4', 'JPG'].map((format) => (
                <span key={format} className="px-2 py-1 text-xs bg-white/50 dark:bg-gray-700/50 rounded-full text-gray-600 dark:text-gray-300">
                  {format}
                </span>
              ))}
            </div>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={(event) => onFileSelect(event.target.files[0])}
          />
        </label>
      </div>

      {file && (
        <div className="animate-fadeIn">
          <FilePreview file={file} removeFile={() => setFile(null)} />
        </div>
      )}

      {/* Email Input */}
      <div className="my-8 flex flex-col items-start">
        <label
          htmlFor="receiver-email-input"
          className="flex items-center mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200"
        >
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse"></div>
          Receiver's Email Address
        </label>
        <div className="relative w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <input
            required={true}
            type="email"
            placeholder="Enter recipient's email address"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            id="receiver-email-input"
            className="relative block w-full p-4 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-lg placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-300/50 dark:focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Password Input */}
      <div className="mb-8">
        <AdvancedPasswordInput
          seePassword={seePassword}
          setSeePassword={setSeePassword}
          filePassword={filePassword}
          setFilePassword={setFilePassword}
          idValue="file-password-encrypt"
          placeValue="Set File Password"
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="animate-slideIn mb-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-4 shadow-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-white font-bold text-lg">Error!</p>
                <p className="text-white/90 text-sm">{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-amber-200 dark:border-gray-600 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl"></div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">🔒 Security Notice</h3>
            <p className="text-amber-700 dark:text-amber-200 font-medium leading-relaxed">
              Remember to copy your password and share it with the receiver separately. For security reasons, we don't send passwords via email.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col w-full items-center space-y-4">
        <CopyToClipboardBtn filePassword={filePassword} />

        {progress === 0 ? (
          <ProgressBar progress={progress} />
        ) : (
          <button
            disabled={!file}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:shadow-none focus:ring-4 focus:ring-blue-300/50 min-w-[200px] overflow-hidden"
            onClick={(e) => upload(e)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-3">
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <span>Send Now</span>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse"></div>
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UploadForm;