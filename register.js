const form=document.getElementById("register-form");
form.addEventListener("submit",async function(event){
    event.preventDefault();
    const username=document.getElementById("username").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const formMessage=document.getElementById("register-message");
if(!username||!email||!password){
formMessage.textContent="please fill in all fields.";
return;
}
const data={
username:username,
email:email,
password:password
};
console.log(data);
try{
    const response=await fetch("/api/register",{
    method:"POST",
    headers:{
        "content-type":"application/json"
    },
    body:JSON.stringify(data)
});
const result = await response.json();
if(response.ok){
formMessage.textContent="Your account has been created";
form.reset();
window.location.href="login.html";
}else{
    formMessage.textContent=result.error||"something went wrong";
}
}catch(error){
    formMessage.textContent="unable to create your account";
}
});