import { CLIENT_BASE_URL } from "../config";

export function getOrgDomain(subdomain) {
  const baseUrl = new URL(CLIENT_BASE_URL);
  baseUrl.hostname = `${subdomain}.${baseUrl.hostname}`;
  return baseUrl.toString()?.replace(/\/$/, "");
}

export function getResetPasswordByAdminTemplate({ name, password, subdomain }) {
  const orgLink = getOrgDomain(subdomain);

  return `
    <div>  
      <p>Hi ${name},</p>  
      <p>Your password has been reset by an administrator. Here is your new password:</p>
      <p><strong>${password}</strong></p>
      <p>To ensure the security of your account, please use the link below to set up a new password:</p>  
      <p><a href="${orgLink}/forgot-password">Reset your password</a></p>  
      <p>If you did not request this change, please contact support immediately.</p>  
      <p>Best regards,<br>FM Team</p>  
    </div>  
  `;
}

export function getResetPasswordGeneralTemplate({
  name,
  resetPasswordToken,
  subdomain,
}) {
  const orgLink = getOrgDomain(subdomain);

  return `
    <div>
      <p>Hi ${name},</p>
      <p>Your password has been reset</p>
      <a href="${orgLink}/reset-password?resetPasswordToken=${resetPasswordToken}" target="_blank">Click here to finish update your password.</a>
      <p>Best regards,</p>
      <p>FM Team</p>
    </div>
  `;
}

export function getInvitationTemplate({ name, password, orgName, subdomain }) {
  const orgLink = getOrgDomain(subdomain);

  return `
    <div>
      <p>Hi ${name},</p>
      <p>You have been invited to join ${orgName}</p>
      <p>Here is your password:</p>
      <p><strong>${password}</strong></p>
      <p>Please click the link below to access the platform and set up your password:</p>
      <a href="${orgLink}/login">Access Platform</a>
    </div>
  `;
}
