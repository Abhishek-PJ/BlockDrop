// import React from 'react'
// import { PageHeader } from '../components'

// const FileHistory = () => {
//   return (
//     <div>
//       <PageHeader title="File History Page" path="Home > File History Page" />
//     </div>
//   )
// }

// export default FileHistory

import React from 'react';

const FileHistory = () => {
  // Sample file data
  const files = [
    { id: 1, name: 'Project_Doc.pdf', size: '1.2 MB', date: '2025-06-20', status: 'Downloaded' },
    { id: 2, name: 'Image_Backup.png', size: '500 KB', date: '2025-06-19', status: 'Uploaded' },
    { id: 3, name: 'Encrypted_Data.zip', size: '3.4 MB', date: '2025-06-18', status: 'Downloaded' },
    { id: 4, name: 'Final_Report.docx', size: '850 KB', date: '2025-06-17', status: 'Uploaded' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">File History</h1>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3 px-6 text-left">File Name</th>
              <th className="py-3 px-6 text-left">Size</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr
                key={file.id}
                className={`border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ${
                  index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <td className="py-3 px-6">{file.name}</td>
                <td className="py-3 px-6">{file.size}</td>
                <td className="py-3 px-6">{file.date}</td>
                <td className="py-3 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      file.status === 'Downloaded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {file.status}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <button className="text-blue-600 hover:underline hover:scale-105 transform transition-transform duration-200">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileHistory;
