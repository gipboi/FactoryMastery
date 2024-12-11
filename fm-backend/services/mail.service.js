import {
  CLIENT_BASE_URL,
  MAIL_DEFAULT_SENDER,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_USER,
} from "../config";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import path from "path";

export class MailService {
  constructor() {}

  async sendEmail(options) {
    const { to, subject, context, htmlString, attachments = [] } = options;

    const transport = {
      service: "gmail",
      host: "smtp.gmail.com",
      secure: true,
      port: MAIL_PORT,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(transport);

    const template = Handlebars.compile(htmlString);
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: MAIL_DEFAULT_SENDER,
      to: to,
      subject: subject,
      html: template(
        Object.assign(Object.assign({}, context), {
          platformLink: CLIENT_BASE_URL,
        })
      ),
      attachments: [
        {
          path: path.join(__dirname, "../assets/images/logo.png"),
          cid: "logo",
        },
        ...attachments,
      ],
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
