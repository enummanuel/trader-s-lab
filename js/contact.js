const contactForm =
    document.getElementById("contact-form");

const contactMessage =
    document.getElementById("contact-message");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const subject =
                document
                    .getElementById("message-subject")
                    .value
                    .trim();


            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();


            contactMessage.textContent = "";

            contactMessage.className =
                "contact-message";


            // ==============================
            // VALIDATION
            // ==============================

            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                contactMessage.textContent =
                    "Please complete all fields.";

                contactMessage.classList.add(
                    "error"
                );

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                contactMessage.textContent =
                    "Please enter a valid email address.";

                contactMessage.classList.add(
                    "error"
                );

                return;
            }


            if (message.length < 10) {

                contactMessage.textContent =
                    "Please enter a little more detail in your message.";

                contactMessage.classList.add(
                    "error"
                );

                return;
            }


            // ==============================
            // SEND TO WEB3FORMS
            // ==============================

            const formData =
                new FormData(contactForm);


            const submitButton =
                contactForm.querySelector(
                    "button[type='submit']"
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Sending...";


            try {

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                if (result.success) {

                    contactMessage.textContent =
                        "Thanks for reaching out. Your message has been sent.";

                    contactMessage.classList.add(
                        "success"
                    );


                    contactForm.reset();

                } else {

                    throw new Error(
                        "Message submission failed."
                    );
                }

            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                contactMessage.textContent =
                    "Something went wrong. Please try again.";

                contactMessage.classList.add(
                    "error"
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Send message";
            }
        }
    );
}