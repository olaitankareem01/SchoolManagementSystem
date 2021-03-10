
















import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'olaitankareem01@gmail.com',
        pass: 'tsquare0601'
    }
});

const mailOptions = {
    from: 'olaitankareem01@gmail.com',
    to: 'kabdrahman01@gmail.com',
    subject: 'precious gift academy',
    text: `Hi,Rahman, welcome to precious gift academy`
};

transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        console.log('an error occurred');
    }
    else {
        console.log(data);
    }
})