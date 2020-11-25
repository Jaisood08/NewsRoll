var Ls = false

// GIF SHOW 
document.onreadystatechange = function () {
    console.log("Load ho rha tha")
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementById('Jcontent').style.visibility = "hidden";
    } else if (state == 'complete') {
        setTimeout(function () {
            document.getElementById('interactive');
            document.getElementById('Jload').style.visibility = "hidden";
            document.getElementById('Jcontent').style.visibility = "visible";
        }, 1000);
    }
}

// HEADER PIC
function ShowPic(Z) {

    const J = document.querySelector(".ProState")

    J.innerHTML = "";
    J.setAttribute('style', "display: flex; margin-left: 40px;margin-bottom:-32px;")


    var b64 = btoa(
        new Uint8Array(Z.profilepic.data.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    // console.log(b64)
    const R = "data: " + Z.profilepic.contentType + ";base64," + b64;


    const img = document.createElement("img");
    img.setAttribute('src', R)
    img.setAttribute('width', "50")
    img.setAttribute('height', "50")
    img.setAttribute('style', "display:table;border-radius: 50%;")


    const a = document.createElement("a");
    a.setAttribute('href', '/' + Z.id);
    a.setAttribute('style', 'margin-top: -5px; margin-left: 3px;');
    const U = document.createTextNode("   " + Z.name);
    a.appendChild(U);


    const Jj = document.querySelector(".Jcart-value")


    const jR = document.createElement("a");
    jR.setAttribute('href', '/api/auth/profile/logout');
    jR.setAttribute('onclick', 'deleteCookies()');
    jR.setAttribute('style', 'margin-left: 94px');
    const JU = document.createTextNode("Logout");
    jR.appendChild(JU);



    J.appendChild(img);
    J.appendChild(a);
    Jj.appendChild(jR);
}

function deleteCookies() {
    var allCookies = document.cookie.split(';');

    // The "expire" attribute of every cookie is  
    // Set to "Thu, 01 Jan 1970 00:00:00 GMT" 
    for (var i = 0; i < allCookies.length; i++)
        document.cookie = allCookies[i] + "=;expires="
            + new Date(0).toUTCString();

    displayCookies.innerHTML = document.cookie;

}

// Check If Login
function Login() {
    Ls = false
    fetch("/api/auth/profile/token").then(response =>
        response.json().then(data => ({
            data: data,
            status: response.status
        })
        ).then(res => {
            const Z = res.data.token
            // console.log(Z)
            fetch("/api/auth/profile/", {
                headers: {
                    Authorization: Z
                }
            }).then(response =>
                response.json()
                    .then(data => ({
                        data: data,
                        status: response.status
                    }))
                    .catch(err => {
                        // if (confirm('Session Timed Out')) document.location = '/Login'
                    })
                    .then(res => {
                        // console.log(res.data)
                        ShowPic(res.data);
                        Ls = true
                    }));
        }));
}
console.log(Ls)

function OFFERS() {


}


window.onload = Login();