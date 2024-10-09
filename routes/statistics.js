const nodemailer = require('nodemailer');

// Crie um transportador usando SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: 'aderitomuffins@muffinstv.wuaze.com', // seu e-mail
        pass: 'Helbonito2000@' // sua senha do Zoho
    }
});

// Defina as opções do e-mail
const mailOptions = {
    from: 'aderitomuffins@muffinstv.wuaze.com',
    to: 'mufumeaderito@gmail.com', // e-mail do destinatário
    subject: 'Assunto do E-mail',
    text: 'Conteúdo do e-mail aqui!'
};

// Enviar o e-mail
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Erro ao enviar e-mail: ' + error);
    }
    console.log('E-mail enviado: ' + info.response);
});
