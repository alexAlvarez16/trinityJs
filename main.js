
///CONFIGURACION DE AMAZON CONECT Y VARIABLES
AWS.config.region = cfgAWSRegion; 

AWS.config.update({
    region: cfgAWSRegion,
    accessKeyId: cfgAWSaccessKeyId,
    secretAccessKey: cfgAWSsecretAccessKey,    
});
//let connect = new AWS.Connect();
let connectparticipant = new AWS.ConnectParticipant();
let participantToken;
let agente = null;
let chatStatus=false;
var urlWindows = window.location.href;
var arrayurlWindows = urlWindows.split('/');
let ws = null;
let htmlTxt='';
let transcriptiontext='';
let token = null;
let chatStatusPages='0';
/*
let usrFullName=''
let usrFirstname=''
let usrEmail=''
*/






initCookies();


AWS.config.region = cfgAWSRegion; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cfgAWSIdentityPoolId,
  });
alert(AWS.config.region);
var lexruntime = new AWS.LexRuntime();
var lexUserId = 'chatbot-demo' + Date.now();
var sessionAttributes = {};
var responseCardOptions = null;

//document.getElementById("userName").innerHTML ='Usuario';
document.getElementById("wisdom").focus();
document.getElementById("botonTerminar").disabled = true;











//MODAL DE IMAGEN
function showImageModal(imgurl) {
    var modal = document.getElementById("botImgModal");
    document.getElementById("backdrop").style.display = "block"
    
    var btn = document.getElementById("img01");

    document.getElementById("img01").src= imgurl;
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("botImgModal").style.display = "block"
    document.getElementById("botImgModal").classList.add("show")
}
var spanModalClose = document.getElementsByClassName("close")[0];
spanModalClose.onclick = function() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("botImgModal").style.display = "none"
    document.getElementById("botImgModal").classList.remove("show")

  }

  ///MODAL DE PREGUNTAS
  function showQModal() {
    var modal = document.getElementById("botQModal");
    document.getElementById("backdropQ").style.display = "block"

    document.getElementById("backdropQ").style.display = "block"
    document.getElementById("botQModal").style.display = "block"
    document.getElementById("botQModal").classList.add("show")
}

    var spanModalClose = document.getElementsByClassName("closeQ")[0];
    spanModalClose.onclick = function() {
    document.getElementById("backdropQ").style.display = "none"
    document.getElementById("botQModal").style.display = "none"
    document.getElementById("botQModal").classList.remove("show")

  }









  function initCookies(){ 
    //REINICIO DE VARIABLES 
    if(arrayurlWindows[arrayurlWindows.length-1].length==0)
    {
        localStorage.clear()
        htmlTxt = '<p class="lexResponse">Bienvenido a Trinity 🤖 tu asistente personal Xpertal, ¿En qué te puedo ayudar?<br></p>';
         
        localStorage.setItem("botHtml", htmlTxt);
        document.getElementById('conversation').innerHTML =localStorage.getItem("botHtml");
        
     
        transcriptiontext='';
        localStorage.setItem("transcriptiontext",'');

        chatStatusPages='0';
        setCookie("chatStatus", JSON.stringify('0'), 365); 
        participantToken=null;
        setCookie("participantToken", JSON.stringify(''), 365); 
        token=null;
        setCookie("AWSConnectionToken", JSON.stringify(''), 365);

    
    }
    //CARGA DE VARIABLES ENTRE NAVEGACION DE PAGINAS,CUANDO LA DIRECCION URL TERMINA EN /INDEX( que no sea solo /)
    else{ 
        
        if(localStorage.length > 0)
        {

     
        
        document.getElementById('conversation').innerHTML=localStorage.getItem("botHtml")   

        htmlTxt = document.getElementById('conversation').innerHTML;
        if (htmlTxt.length==0)
        {
          htmlTxt=htmlTxt ? htmlTxt : '<p class="lexResponse">Bienvenido a Trinity 🤖 tu asistente personal Xpertal, ¿En qué te puedo ayudar?<br></p>';
          localStorage.setItem("botHtml", htmlTxt);
            document.getElementById('conversation').innerHTML =localStorage.getItem("botHtml");
        }  
        transcriptiontext= localStorage.getItem('transcriptiontext');
        
        transcriptiontext=transcriptiontext ? transcriptiontext : ''
 
        chatStatusPages=getCookie('chatStatus');
        chatStatusPages=chatStatusPages ? chatStatusPages : '0'
        participantToken= getCookie('participantToken');  
        participantToken=participantToken ? participantToken : '""'
        chatStatusPages=chatStatusPages.substring(1, chatStatusPages.length-1).replace(/['"]+/g, '')
        token=getCookie('AwsConnectionToken');
        //REESTABLECEMOS LA CONEXION SI EXISTE UN PARTICIPANT TOKEN
        if(participantToken!='""')
        { 
            reestablecerConexionConnect (participantToken)
        }    
}else{
    localStorage.clear()
    htmlTxt = '<p class="lexResponse">Bienvenido a Trinity 🤖 tu asistente personal Xpertal, ¿En qué te puedo ayudar?<br></p>';
     
    localStorage.setItem("botHtml", htmlTxt);
    document.getElementById('conversation').innerHTML =localStorage.getItem("botHtml");
    
 
    transcriptiontext='';
    localStorage.setItem("transcriptiontext",'');

    chatStatusPages='0';
    setCookie("chatStatus", JSON.stringify('0'), 365); 
    participantToken=null;
    setCookie("participantToken", JSON.stringify(''), 365); 
    token=null;
    setCookie("AWSConnectionToken", JSON.stringify(''), 365);

}
        
    }

}



//BOTON DE CHARLA CON BOT
function openChatPopUp() {
  var x = document.getElementById('divChatButton');
  if (x.style.display === 'none' || x.style.display=='') {
      x.style.display = 'block';
      document.getElementById("wisdom").focus();

      var scrollChatBot = document.getElementById('conversation');
      scrollChatBot.scrollTop = scrollChatBot .scrollHeight;
  

  } else {
      x.style.display = 'none';
     }
  }

/*openChatPopUp*/

///RESTABLECE LA CONEXION AL CAMBIAR DE PAGINA O RECONECTARSE, UTILIZA LAS VARIABLES CARGADA DE LA FUNCION INITCOOKIES
function reestablecerConexionConnect (participantToken)
{
    AWS.config.region = cfgAWSRegion; 

    AWS.config.update({
        region: cfgAWSRegion,
        accessKeyId: cfgAWSaccessKeyId,
        secretAccessKey: cfgAWSsecretAccessKey,    
    });

    connectparticipant = new AWS.ConnectParticipant();

    const params = {
        ParticipantToken: participantToken.substring(1, participantToken.length-1),
        Type: ['WEBSOCKET','CONNECTION_CREDENTIALS']
    }
    connectparticipant.createParticipantConnection(params, (err, data) => {
      if (err) {
        console.log(err, err.stack); 
        chatStatus=false
        chatStatusPages='0';
        token=null;
        setCookie("chatStatus", JSON.stringify('0'), 365); 
        participantToken=null;
        setCookie("participantToken", JSON.stringify(''), 365);
        document.getElementById("botonTerminar").disabled = true;
        document.getElementById("botonIniciar").disabled = false;

        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';     
        responsePara.appendChild(document.createTextNode('Se perdio la conexion con el agente...'));
        responsePara.appendChild(document.createElement('br'));   
        conversationDiv.appendChild(responsePara);
        
        htmlTxt = document.getElementById('conversation').innerHTML;
        localStorage.setItem("botHtml",htmlTxt)
        var scrollChatBotConnect = document.getElementById('divScroll');
        scrollChatBotConnect.scrollTop = scrollChatBotConnect.scrollHeight;
        var scrollChatBot = document.getElementById('conversation');
        scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

    }
      else{
          let websocket = data.Websocket.Url;
          let connectionToken = data.ConnectionCredentials.ConnectionToken;
          setCookie("AWSConnectionToken", JSON.stringify(connectionToken), 365); 
          this.establecerConexionWebsocket( websocket , connectionToken );

          document.getElementById("botonTerminar").disabled = false;
          document.getElementById("botonIniciar").disabled = true;
      }
    })

}

function setCookie(cname, cvalue, exdays) 
{
var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) 
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
   
}


//ACTUALIZA HTML
setInterval(function() {
    document.getElementById('conversation').innerHTML=localStorage.getItem("botHtml")   

        htmlTxt = document.getElementById('conversation').innerHTML;
 }, cfgHtmlBotRefresh);