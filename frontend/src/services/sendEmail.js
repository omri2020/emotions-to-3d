import emailjs from "emailjs-com";

emailjs.init("XgctWn0fwAGItMbh5");

export const sendEmail = (email, username, fileUrl) => {
  const templateParams = {
    email,
    username,
    fileUrl,
  };

  emailjs.send("service_5sgogmn", "template_hcjsqtl", templateParams).then(
    (response) => {
      console.log("SUCCESS!", response.status, response.text);
    },
    (error) => {
      console.log("FAILED...", error);
    }
  );
};
