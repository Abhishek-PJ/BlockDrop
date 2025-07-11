const sgMail = require("@sendgrid/mail");
const Mailjet = require("node-mailjet");
var SibApiV3Sdk = require("sib-api-v3-sdk");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
  {
    config: {},
    options: {},
  }
);

const sendEmailMailjet = async (
  receiverEmail,
  fileID,
  senderName = "Encrypt Share"
) => {
  const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "abhishekn.mca24@rvce.edu.in",
            Name: senderName,
          },
          To: [
            {
              Email: receiverEmail,
              Name: "Recipient",
            },
          ],
          Subject: "You've Received a Secure File via Encrypt-Share",
          TextPart: `Hello,\n\nYou have received a secure file using Encrypt-Share.\n\nFile ID: ${fileID}\nDownload Page: https://encrypt-share.vercel.app/\n\nNote: For security reasons, the password is not shared via email. Please contact the sender directly.\n\nBest regards,\nEncrypt-Share Team`,
          HTMLPart: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure File Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }
        
        .email-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
            position: relative;
            margin: 0 auto;
        }
        
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
        }
        
        .header h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px;
            line-height: 1.6;
        }
        
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .sender-info {
            color: #4a5568;
            margin-bottom: 24px;
            font-size: 16px;
        }
        
        .sender-name {
            font-weight: 600;
            color: #667eea;
        }
        
        .file-info {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }
        
        .file-info::before {
            content: '🔒';
            position: absolute;
            top: -10px;
            left: 20px;
            background: white;
            padding: 0 8px;
            font-size: 16px;
        }
        
        .file-id-label {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .file-id-container {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .file-id {
            background: #4a5568;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            flex: 1;
            word-break: break-all;
            min-width: 200px;
        }
        
        .copy-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
        }
        
        .copy-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .copy-btn:hover::before {
            left: 100%;
        }
        
        .copy-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .copy-btn:active {
            transform: translateY(0);
        }
        
        .copy-btn.copied {
            background: #48bb78;
            animation: pulse 0.6s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .download-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .download-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        
        .download-text {
            color: white;
            margin-bottom: 16px;
            font-size: 16px;
            position: relative;
            z-index: 1;
        }
        
        .download-btn {
            background: white;
            color: #667eea;
            padding: 16px 32px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .download-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            color: #764ba2;
        }
        
        .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #856404;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .note-icon {
            font-size: 18px;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 24px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            margin-bottom: 8px;
        }
        
        .team-signature {
            font-weight: 600;
            color: #495057;
        }
        
        .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #e8f5e8;
            color: #2d5a2d;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 16px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h2 {
                font-size: 24px;
            }
            
            .file-id-container {
                flex-direction: column;
                align-items: stretch;
            }
            
            .file-id {
                min-width: unset;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>🔐 Secure File Received</h2>
            <div class="subtitle">Your file is waiting for you</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello there! 👋</div>
            
            <div class="sender-info">
                You have received a secure file from <span class="sender-name">${senderName}</span> using <strong>Encrypt-Share</strong>.
            </div>
            
            <div class="file-info">
                <div class="file-id-label">File ID</div>
                <div class="file-id-container">
                    <div class="file-id" id="fileId">${fileID}</div>
                    <button class="copy-btn" onclick="copyFileId()">Copy</button>
                </div>
            </div>
            
            <div class="download-section">
                <div class="download-text">Ready to download your secure file?</div>
                <a href="https://encrypt-share.vercel.app/" target="_blank" class="download-btn">
                    🚀 Visit Secure Download Page
                </a>
            </div>
            
            <div class="note">
                <div class="note-icon">⚠️</div>
                <div>
                    <strong>Important:</strong> For your privacy and protection, the password is not included in this email. Please contact the sender directly to retrieve it.
                </div>
            </div>
            
            <div class="security-badge">
                🛡️ End-to-End Encrypted
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                If you do not recognize this request, you can safely ignore this message.
            </div>
            <div class="team-signature">— The Encrypt-Share Team</div>
        </div>
    </div>
    
    <script>
        function copyFileId() {
            const fileId = document.getElementById('fileId').textContent;
            const copyBtn = document.querySelector('.copy-btn');
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(fileId).then(() => {
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = fileId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
        }
    </script>
</body>
</html>
          `,
        },
      ],
    });

    if (request && request.body) {
      return { success: true, data: request.body };
    } else {
      return { success: false, error: "Email sending failed" };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = sendEmailMailjet;