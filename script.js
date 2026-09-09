const form =document.getElementById("contact-form");
form.addEventListener("submit",async function(event){
    event.preventDefault();
    const name=document.getElementById("name").value;
    const email=document.getElementById("email").value;
    const subject=document.getElementById("subject").value;
    const message=document.getElementById("message").value;
const formMessage=document.getElementById("form-message");
    if(!name||!email||!subject||!message){
        formMessage.textContent="please fill in all fields.";
        return;
    }
    const data={
        name:name,
        email:email,
        subject:subject,
        message:message
    };
    console.log(data);
     try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            formMessage.textContent = "Your message has been sent successfully.";
            form.reset();
        } else {
            formMessage.textContent = result.error || "Something went wrong.";
        }

    } catch (error) {
        formMessage.textContent = "Unable to send your message. Please try again.";
    }
});