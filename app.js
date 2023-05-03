import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import validator from "validator";
import * as dotenv from "dotenv";

const app = express();
const port = 8080;

dotenv.config();

app.use(express.static('build'));
app.use(cors());
app.use(express.json());

const emailUsername = process.env.EMAILUSERNAME;
const emailPassword = process.env.EMAILPASSWORD;

const contactEmail = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    auth: {
        user: emailUsername,
        pass: emailPassword
    }
 });

 contactEmail.verify((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready to send");
    }
 });

 function getSanitizedString(dirtyString) {
    let cleanString = String(dirtyString);
    cleanString = validator.stripLow(dirtyString);
    cleanString = validator.blacklist(cleanString, "=/\<>`'");
    cleanString = validator.blacklist(cleanString, '"');
    cleanString = validator.escape(cleanString);
    return cleanString;
};

app.post("/appointment", (req, res) => {

    const date = getSanitizedString(req.body.date);
    const time = getSanitizedString(req.body.time);
    const name = getSanitizedString(req.body.name) || "Unknown name";
    const phone = getSanitizedString(req.body.phone);
    const message = getSanitizedString(req.body.message);
    const email = {
        from: `"${name}" info@drwatsondental.com`,
        to: "info@drwatsondental.com",
        subject: "New Appointment",
        html: `
            <h1>This is a new appointment from our website.</h1>
            <p>Contact the patient to confirm the appointment or suggest another time.</p>
            <p>Date: ${date}.</p>
            <p>Time: ${time}.</p>
            <p>Name: ${name}.</p>
            <p>Phone: ${phone}.</p>
            <p>Message: ${message}.</p>
            <p><em>This is an automated message. Do not reply directly in the email.</em></p>
        `
    };
    contactEmail.sendMail(email, (error) => {
        if (error) {
            res.json({status: "ERROR WHEN SENDING MESSAGE"});
        } else {
            res.json({status: "Message sent"});
        }
    });
});

app.post("/contact", (req, res) => {

    const name = getSanitizedString(req.body.name) || "Unknown name";
    const email = getSanitizedString(req.body.email);
    const phone = getSanitizedString(req.body.phone);
    const message = getSanitizedString(req.body.message);
    const mail = {
        from: `"${name}" info@drwatsondental.com`,
        to: "info@drwatsondental.com",
        subject: "New Message",
        html: `
            <h1>This is a new message from our website.</h1>
            <p>Contact the patient via phone or email indicated below.</p>
            <p>Name: ${name}.</p>
            <p>Phone: ${phone}.</p>
            <p>Email: ${email}.</p>
            <p>Message: ${message}.</p>
            <p><em>This is an automated message. Do not reply directly in the email. Contact the patient using the details above. </em></p>
        `
    };
    contactEmail.sendMail(mail, (error) => {
        if (error) {
            res.json({status: "ERROR WHEN SENDING MESSAGE"});
        } else {
            res.json({status: "Message sent"});
        }
    });
});

app.listen(port, () => console.log(`Listening to port ${port}`));

