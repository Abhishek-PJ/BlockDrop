import React, { useState } from 'react'
import { Upload, Shield, CheckCircle, XCircle, AlertCircle, Loader2, FileText, Hash, Search } from 'lucide-react'

const VerifyFile = () => {
  const [file, setFile] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setVerificationResult(null)
    setError('')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8080/blockchain/verifyFile', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationResult(data)
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const truncateHash = (hash) => {
    if (!hash) return ''
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  const getStatusColor = (valid) => {
    return valid ? 'text-green-600' : 'text-red-600'
  }

  const getStatusBgColor = (valid) => {
    return valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  }

  const getStatusIcon = (valid) => {
    return valid ? (
      <CheckCircle className="h-6 w-6 text-green-600" />
    ) : (
      <XCircle className="h-6 w-6 text-red-600" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">File Verification</h1>
            </div>
            <p className="text-gray-600">Verify if your file exists and is authentic on the blockchain</p>
          </div>

          {/* File Upload Area */}
          <div className="mb-8">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop a file here, or click to select</p>
              <input
                id="verify-file-input"
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('verify-file-input').click()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Select File
              </button>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-800">{file.name}</span>
                  <span className="ml-auto text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="inline mr-2 h-5 w-5" />
                  Verify File
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`border rounded-lg p-6 ${getStatusBgColor(verificationResult.valid)}`}>
              <div className="flex items-start mb-4">
                {getStatusIcon(verificationResult.valid)}
                <div className="ml-3">
                  <h3 className={`text-lg font-bold ${getStatusColor(verificationResult.valid)}`}>
                    Verification Result
                  </h3>
                  <p className={`text-sm ${getStatusColor(verificationResult.valid)} mt-1`}>
                    {verificationResult.status}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className={`h-4 w-4 mr-2 ${getStatusColor(verificationResult.valid)}`} />
                  <span className={`font-medium ${getStatusColor(verificationResult.valid)}`}>File:</span>
                  <span className={`ml-2 ${getStatusColor(verificationResult.valid)}`}>{file.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Hash className={`h-4 w-4 mr-2 ${getStatusColor(verificationResult.valid)}`} />
                  <span className={`font-medium ${getStatusColor(verificationResult.valid)}`}>File Hash:</span>
                  <span className={`ml-2 font-mono text-sm ${getStatusColor(verificationResult.valid)}`}>
                    {truncateHash(verificationResult.fileHash)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Shield className={`h-4 w-4 mr-2 ${getStatusColor(verificationResult.valid)}`} />
                  <span className={`font-medium ${getStatusColor(verificationResult.valid)}`}>Status:</span>
                  <span className={`ml-2 font-medium ${getStatusColor(verificationResult.valid)}`}>
                    {verificationResult.valid ? 'AUTHENTIC' : 'NOT VERIFIED'}
                  </span>
                </div>
              </div>

              {/* Full Hash Display */}
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className={`text-xs font-medium mb-1 ${getStatusColor(verificationResult.valid)}`}>
                  Full Hash:
                </p>
                <p className={`text-xs font-mono break-all ${getStatusColor(verificationResult.valid)}`}>
                  {verificationResult.fileHash}
                </p>
              </div>

              {/* Additional Information */}
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className={`h-4 w-4 mr-2 ${getStatusColor(verificationResult.valid)}`} />
                  <span className={`text-sm font-medium ${getStatusColor(verificationResult.valid)}`}>
                    What does this mean?
                  </span>
                </div>
                <p className={`text-xs ${getStatusColor(verificationResult.valid)}`}>
                  {verificationResult.valid 
                    ? "This file has been verified as authentic and exists on the blockchain. The file has not been tampered with since it was uploaded."
                    : "This file could not be verified on the blockchain. Either the file has been modified since upload, or it was never uploaded to the blockchain."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">How it works</span>
            </div>
            <p className="text-sm text-blue-700">
              File verification works by generating a cryptographic hash of your file and checking if it exists on the blockchain. 
              If the hash matches a recorded entry, the file is authentic and hasn't been modified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyFile;