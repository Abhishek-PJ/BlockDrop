import React, { useState, useEffect } from 'react'
import { History, FileText, User, Hash, Calendar, HardDrive, Loader2, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react'

const FileHistory = () => {
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    filterAndSortFiles()
  }, [files, searchTerm, sortBy, sortOrder])

  const fetchFiles = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8080/blockchain/getAllFiles')
      
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch files')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortFiles = () => {
    let filtered = [...files]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.fileHash.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort files
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase()
          bValue = b.fileName.toLowerCase()
          break
        case 'fileSize':
          aValue = a.fileSize
          bValue = b.fileSize
          break
        case 'uploader':
          aValue = a.uploader.toLowerCase()
          bValue = b.uploader.toLowerCase()
          break
        case 'timestamp':
        default:
          aValue = a.timestamp
          bValue = b.timestamp
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredFiles(filtered)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  const truncateHash = (hash) => {
    if (!hash) return ''
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleRefresh = () => {
    fetchFiles()
  }

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <History className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">File Upload History</h1>
                <p className="text-gray-600 mt-1">All files uploaded to the blockchain</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by file name, uploader, or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="timestamp">Sort by Date</option>
                <option value="fileName">Sort by Name</option>
                <option value="fileSize">Sort by Size</option>
                <option value="uploader">Sort by Uploader</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="text-emerald-800 font-medium">Total Files</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{files.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Total Size</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatFileSize(files.reduce((sum, file) => sum + file.fileSize, 0))}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">Unique Uploaders</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {new Set(files.map(file => file.uploader)).size}
              </p>
            </div>
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

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading file history...</p>
            </div>
          )}

          {/* Files List */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No files found matching your search.' : 'No files uploaded yet.'}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-medium text-gray-700">File Name:</span>
                          <span className="ml-2 text-gray-900 font-medium">{file.fileName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-gray-700">Uploader:</span>
                          <span 
                            className="ml-2 text-blue-600 font-mono text-sm cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                            onClick={() => copyToClipboard(file.uploader)}
                            title="Click to copy full address"
                          >
                            {truncateAddress(file.uploader)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <HardDrive className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-gray-700">Size:</span>
                          <span className="ml-2 text-gray-900">{formatFileSize(file.fileSize)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Hash className="h-5 w-5 text-orange-600 mr-2" />
                          <span className="font-medium text-gray-700">Hash:</span>
                          <span 
                            className="ml-2 text-orange-600 font-mono text-sm cursor-pointer hover:bg-orange-50 px-2 py-1 rounded"
                            onClick={() => copyToClipboard(file.fileHash)}
                            title="Click to copy full hash"
                          >
                            {truncateHash(file.fileHash)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-700">Uploaded:</span>
                          <span className="ml-2 text-gray-900">{formatTimestamp(file.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Full Hash Display */}
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-xs font-medium text-gray-700 mb-1">Full Hash:</p>
                      <p className="text-xs font-mono text-gray-600 break-all">{file.fileHash}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Results Summary */}
          {!isLoading && !error && filteredFiles.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredFiles.length} of {files.length} files
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileHistory