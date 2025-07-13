import React, { useState, useEffect } from 'react'
import { Upload, Wallet, CheckCircle, AlertCircle, Loader2, FileText, Hash, Clock } from 'lucide-react'

const Aboutus = () => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResponse, setUploadResponse] = useState(null)
  const [error, setError] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setIsWalletConnected(true)
          setWalletAddress(accounts[0])
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask or another Ethereum wallet')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setIsWalletConnected(true)
        setWalletAddress(accounts[0])
        setError('')
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message)
    }
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setUploadResponse(null)
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

  const handleUploadClick = () => {
    if (!file) {
      setError('Please select a file first')
      return
    }
    if (!isWalletConnected) {
      setError('Please connect your wallet first')
      return
    }
    setShowConfirmation(true)
  }

  const confirmUpload = async () => {
    setShowConfirmation(false)
    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8080/blockchain/uploadFile', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResponse(data)
        setFile(null)
        const fileInput = document.getElementById('file-input')
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.message || data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const cancelUpload = () => {
    setShowConfirmation(false)
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
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain File Upload</h1>
            <p className="text-gray-600">Upload files securely to the blockchain</p>
          </div>

          <div className="mb-8">
            {!isWalletConnected ? (
              <div className="text-center">
                <button
                  onClick={connectWallet}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Wallet Connected:</span>
                  <span className="ml-2 text-green-700 font-mono">{truncateAddress(walletAddress)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop a file here, or click to select</p>
              <input id="file-input" type="file" onChange={handleFileInputChange} className="hidden" />
              <button
                onClick={() => document.getElementById('file-input').click()}
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
                  <span className="ml-auto text-sm text-gray-600">{formatFileSize(file.size)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleUploadClick}
              disabled={!file || !isWalletConnected || isUploading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload to Blockchain'
              )}
            </button>
          </div>

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Upload</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to upload "<span className="font-medium">{file?.name}</span>" to the blockchain?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={confirmUpload}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Yes, Upload
                  </button>
                  <button
                    onClick={cancelUpload}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {uploadResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Upload Successful!
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">File:</span>
                  <span className="ml-2 text-green-700">{uploadResponse.fileName}</span>
                </div>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">File Hash:</span>
                  <span className="ml-2 text-green-700 font-mono text-sm">
                    {truncateHash(uploadResponse.fileHash)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Transaction Hash:</span>
                  <span className="ml-2 text-green-700 font-mono text-sm">
                    {truncateHash(uploadResponse.txHash)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">File Size:</span>
                  <span className="ml-2 text-green-700">{formatFileSize(uploadResponse.fileSize)}</span>
                </div>
                {uploadResponse.previousHash && (
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Previous Hash:</span>
                    <span className="ml-2 text-green-700 font-mono text-sm">
                      {truncateHash(uploadResponse.previousHash)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Aboutus
