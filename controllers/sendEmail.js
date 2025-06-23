const sgMail = require('@sendgrid/mail')
const Mailjet = require('node-mailjet');
var SibApiV3Sdk = require('sib-api-v3-sdk');



const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE,
    {
      config: {},
      options: {}
    } 
);


const sendEmailMailjet = async (receiverEmail, fileID, senderName = "Encrypt Share") => {
    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
  
    try {
      const request = await mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "abhishekn.mca24@rvce.edu.in",
                Name: senderName
              },
              To: [
                {
                  Email: receiverEmail,
                  Name: "Recipient"
                }
              ],
              Subject: "Here is your File ID!",
              TextPart: `Dear user, here is your File ID: ${fileID}`,
              HTMLPart: `<h3>Dear user,</h3><br/> Download page: <a href='http://localhost:5173/download'>download page link</a> <br />Here is your File ID: <strong>${fileID}</strong><br /><br /><b>Because of our security policy we don't share passwords. You need to ask the sender for it.</b>`
            }
          ]
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