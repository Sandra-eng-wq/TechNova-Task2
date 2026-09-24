const form=document.getElementById("request-form");
form.addEventListener("submit",async function(event){
    event.preventDefault();
    const service=document.getElementById("service").value;
    const description=document.getElementById("description").value;
    const message=document.getElementById("message");
    if(!service||!description){
        message.textContent="please fill in all fields.";
        return;
    }
    try{
        const response=await fetch("/api/requests",{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify({
                service:service,
                description:description
            })   
        });
        const result=await response.json();
        if(response.ok){
            message.textContent="your request has been submitted successfully.";
            form.requestFullscreen
        }else{
            message.textContent=result.error||"unable to submit request";
        }
    } catch(error){
        console.log(error);
        message.textContent="something went wrong";
    }
});