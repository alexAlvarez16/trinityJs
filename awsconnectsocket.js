

//ENVIO DE EVENTO DE ESCRITURA A AWS CONENCT
setInterval(function() {

    if(ws!=null && chatStatusPages=='1')
    {
        agentTyping()
    }
 }, cfgTypingInterval);
 

//FUNCINO PARA INICIAR LLAMADA EN AWS CONNECT
function iniciarLlamada(){
    document.getElementById("botonTerminar").disabled = true;
    document.getElementById("botonIniciar").disabled = true;


//DELAY DE N SEGUNDOS PARA ESPERAR LA CONEXION CON AWS CONNECT
    setTimeout(function(){
        document.getElementById("botonTerminar").disabled = false;
        document.getElementById("botonIniciar").disabled = true; 
    }, 7000 );  
        

 //DE NO OBTENER RESPUESTA EN N MINUTOS, CERRAR LA CONEXION   
    setTimeout(function(){
    if(chatStatusPages=='0')
    { 
        desconectarWebsocket()
    /*    
        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';     
        responsePara.appendChild(document.createTextNode('Por el momento no se encuentran agentes,favor de intentar mas tarde.'));
        responsePara.appendChild(document.createElement('br'));
        conversationDiv.appendChild(responsePara);
        var scrollChatBotConnect = document.getElementById('divScroll');
        scrollChatBotConnect.scrollTop = scrollChatBotConnect.scrollHeight;
    */
        var scrollChatBot = document.getElementById('conversation');
        scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

        htmlTxt = document.getElementById('conversation').innerHTML;
        localStorage.setItem("botHtml",htmlTxt);

        document.getElementById("botonTerminar").disabled = true;
        //document.getElementById("botonIniciar").disabled = false;
        document.getElementById("botonIniciar").disabled = true;
    }    
    }, cfgCloseConnectConection );  


///LLAMADA A AWS CONNECT MEDIANTE FUNCION chatConAgente
    var conversationDiv = document.getElementById('conversation');
    var responsePara = document.createElement("P");
    responsePara.className = 'lexResponse';     
    responsePara.appendChild(document.createTextNode('Muchas gracias por contactarnos. En un momento uno de nuestros agentes se pondrá en contacto contigo en un momento.'));
    responsePara.appendChild(document.createElement('br'));   
    conversationDiv.appendChild(responsePara);

    var scrollChatBotConnect = document.getElementById('divScroll');
    scrollChatBotConnect.scrollTop = scrollChatBotConnect.scrollHeight;
    var scrollChatBot = document.getElementById('conversation');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

    htmlTxt = document.getElementById('conversation').innerHTML;
        localStorage.setItem("botHtml",htmlTxt);
    chatConAgente();
 }


 //FUNCION INICIAL CON LAS CREDENCILES DEL FLUJO DE AWS CONNECT
function chatConAgente(){
    participantToken = '';
    const params = {
        ContactFlowId: cfgAWSContactFlowId,
        InstanceId: cfgAWSInstanceId,
        Attributes: {
            customerName: document.getElementById('usrFirstName').innerHTML
    },
        ParticipantDetails: {
            DisplayName:document.getElementById('usrFirstName').innerHTML
        }
    } 

  
    
 //CREAR PARTICIPANT TOKEN
    connect.startChatContact(params, (err, data) => {
        if (err) console.log(err, err.stack); 
            else{
            this.crearParticipantConnection( data.ParticipantToken );
            setCookie("participantToken", JSON.stringify(data.ParticipantToken), 365); 
            }
    })
}




//MEDIANTE PARTICIPANT TOKEN ,OBTENER URL PARA WEB SOCKET                
function crearParticipantConnection(token){
  
    const params = {
        ParticipantToken: token,
        Type: ['WEBSOCKET','CONNECTION_CREDENTIALS']
    }
    connectparticipant.createParticipantConnection(params, (err, data) => {
      if (err) console.log(err, err.stack); 
      else{
          let websocket = data.Websocket.Url;
          let connectionToken = data.ConnectionCredentials.ConnectionToken;
          setCookie("AWSConnectionToken", JSON.stringify(connectionToken), 365); 
          this.establecerConexionWebsocket( websocket , connectionToken );
      }
    })
}            






//CONEXION CON WEB SOCKET
 function  establecerConexionWebsocket( websocket , connectionToken ){
    ws= new WebSocket(websocket.substring(0,6)+ websocket.substring(6,websocket.length).replace(/%22/g, "").replace(/['"]+/g, '').replace("\\",""))  
    ws.onopen = function(e){
        ws.send('{"topic":"aws/subscribe","content":{"topics":["aws/chat"]}}');
        token = connectionToken;
    }
    
    ws.onmessage = (event) => {
        let mensaje_recibido = JSON.parse(event.data);
        if(mensaje_recibido.message!='Forbidden')
        {
        mensaje_recibido = mensaje_recibido.content;
        mensaje_recibido = JSON.stringify(mensaje_recibido);

        let contenido = mensaje_recibido.replace(/\\n/g,'¦').replace(/\\/g, '')
       
        if( contenido[0] == '"'){
            contenido = contenido.substring(1);
            contenido = contenido.slice(0,-1);
        }
        contenido = JSON.parse(contenido);

     
                    
        if( contenido.ContentType && contenido.ContentType == 'application/vnd.amazonaws.connect.event.participant.joined' && contenido.ParticipantRole == 'AGENT' ){         
            this.enviarTexto( 'Se está conectando ' + contenido.DisplayName + ', quien te atenderá el día de hoy');
           
            agente = contenido.DisplayName + ": ";
            chatStatus=true;
            chatStatusPages='1'
            setCookie("chatStatus", JSON.stringify('1'), 365); 
 
            if(transcriptiontext!=''){
            transcriptText(transcriptiontext.replace(/(\r\n|\n|\r)/gm, "").replace(/['"]+/g, ''),'|');
            }
         
            localStorage.setItem("transcriptiontext",'');
            transcriptiontext='';
             }
        
            if( contenido.Type && contenido.Type == 'MESSAGE' && contenido.ParticipantRole == 'AGENT' ){
                agente = contenido.DisplayName + ": ";
            this.enviarTexto( agente + contenido.Content );	
            }

            if( contenido.Attachments? contenido.Attachments.length:0 >0  && contenido.ParticipantRole == 'AGENT'){
                this.enviarEnlaceDescarga(contenido.Attachments[0].AttachmentId,contenido.Attachments[0].AttachmentName);      
            }
            
            if( contenido.ContentType && contenido.ContentType == 'application/vnd.amazonaws.connect.event.participant.left' && contenido.ParticipantRole == 'AGENT' ){
                this.enviarTexto( contenido.DisplayName + ' se ha desconectado. Que tengas un buen día' );
                token = null;
                ws = null;
                agente = null;
                chatStatus=false
                chatStatusPages='0';
                setCookie("chatStatus", JSON.stringify('0'), 365);
                participantToken=null;
                setCookie("participantToken", JSON.stringify(''), 365); 

                document.getElementById("botonTerminar").disabled = true;
                //document.getElementById("botonIniciar").disabled = false;
                document.getElementById("botonIniciar").disabled = true;
            }
        
    }
}

} 

// RECIBE MENSAJES DEL AGENTE DE AWS CONNECT Y  LO IMPRIME EN HTML
function enviarTexto(texto){
    var conversationDiv = document.getElementById('conversation');
    var responsePara = document.createElement("P");
    responsePara.className = 'lexResponse';
    var spaceline= texto.split('¦');


    for(i=0 ;i<=spaceline.length-1;i++)
    {
        responsePara.appendChild(document.createTextNode(spaceline[i]));
        responsePara.appendChild(document.createElement('br'));
    }


    conversationDiv.appendChild(responsePara);
    var scrollChatBotConnect = document.getElementById('divScroll');
    scrollChatBotConnect.scrollTop = scrollChatBotConnect.scrollHeight;

    var scrollChatBot = document.getElementById('conversation');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

    htmlTxt = document.getElementById('conversation').innerHTML;
    localStorage.setItem("botHtml",htmlTxt);
    }


// RECIBE MENSAJES DE ARHCIVO ADJUNTO  DEL AGENTE DE AWS CONNECT Y  LO IMPRIME EN HTML
function enviarEnlaceDescarga(AttachmentId,AttachmentName){
    const params = {
        ConnectionToken: token,
        AttachmentId: AttachmentId
    }
    connectparticipant.getAttachment(params, (err,data) => {

    var conversationDiv = document.getElementById('conversation');
    var responsePara = document.createElement("a");

    responsePara.className = 'lexResponse';
    responsePara.setAttribute('href',data.Url)
    responsePara.appendChild(document.createTextNode(AttachmentName));
    responsePara.appendChild(document.createElement('br'));
               
    
    conversationDiv.appendChild(responsePara);

    var scrollChatBotConnect = document.getElementById('divScroll');
    scrollChatBotConnect.scrollTop = scrollChatBotConnect.scrollHeight;

    var scrollChatBot = document.getElementById('conversation');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

    htmlTxt = document.getElementById('conversation').innerHTML;
    localStorage.setItem("botHtml",htmlTxt);
    if( err )
        console.log(err,err.stack);
    })
}

// ENVIA MENSAJE DE USUARIO A AGENTE DE AWS CONNECT MEDIANTE WEBSOCKET
function enviaMensajeWebsocket( mensaje ){		
    const params = {
        ConnectionToken: token,
        Content: mensaje,
        ContentType: 'text/plain'
    }
 
    connectparticipant.sendMessage(params, (err,data) => {
        if( err )
        {
            console.log(err,err.stack);
    }
    else{

        var scrollChatBot_Refresh = document.getElementById('divScroll');
        scrollChatBotRefresh.scrollTop = scrollChatBotRefresh.scrollHeight;
        var scrollChatBot_Refresh_Conversation = document.getElementById('conversation');
        scrollChatBot_Refresh_Conversation.scrollTop = scrollChatBot_Refresh_Conversation.scrollHeight;
    }
        })
}

/*
//WA: ENVIA EVENTO TYPING PARA MANTENER LA CONEXION CON AGENTE
function mantenerWebsocket(){
    const params = {
        ConnectionToken: token,
        contentType: "application/vnd.amazonaws.connect.event.typing"
    }
            
    connectparticipant.sendEvent(params, (err,data) => {
    
        if (err) console.log(err, err.stack);
        console.log(err,err.stack);
    })
}
    */

//DESCONECTA CONENECT PARTICIPANT
function desconectarWebsocket(){
    const params = {
        ConnectionToken: token
    }
            
    connectparticipant.disconnectParticipant(params, (err,data) => {
        chatStatus=false
        chatStatusPages='0';
        token=null;
        setCookie("chatStatus", JSON.stringify('0'), 365); 
        participantToken=null;
        setCookie("participantToken", JSON.stringify(''), 365); 


        document.getElementById("botonTerminar").disabled = true;
        //document.getElementById("botonIniciar").disabled = false;
        document.getElementById("botonIniciar").disabled = true;

        if (err) console.log(err, err.stack);
            console.log(err,err.stack);
            chatStatus=false
            chatStatusPages='0';
            token=null;
            setCookie("chatStatus", JSON.stringify('0'), 365); 
            participantToken=null;
            setCookie("participantToken", JSON.stringify(''), 365); 

            document.getElementById("botonTerminar").disabled = true;
            //document.getElementById("botonIniciar").disabled = false;
            document.getElementById("botonIniciar").disabled = true;
    })
}

//DESCONECTA CONENECT PARTICIPANT E IMPRIME MENSAJE EN HTML
 function desconectarWebsocket(booleano){  
    const params = {
        ConnectionToken: token
    }
            
    connectparticipant.disconnectParticipant(params, (err,data) => {
        document.getElementById("botonTerminar").disabled = true;
        //document.getElementById("botonIniciar").disabled = false;
        document.getElementById("botonIniciar").disabled = true;

        this.enviarTexto(  ' Te has desconectado. Que tengas un buen día' );
        token = null;
        ws = null;
        agente = null;
        chatStatus=false
        chatStatusPages='0';
        setCookie("chatStatus", JSON.stringify('0'), 365); 
        participantToken=null;
        setCookie("participantToken", JSON.stringify(''), 365); 

        if (err) console.log(err, err.stack);
            chatStatus=false
            chatStatusPages='0';
            token=null;
            setCookie("chatStatus", JSON.stringify('0'), 365); 
            participantToken=null;
            setCookie("participantToken", JSON.stringify(''), 365); 

            document.getElementById("botonTerminar").disabled = true;
          //  document.getElementById("botonIniciar").disabled = false;
            document.getElementById("botonIniciar").disabled = true;
    }) 
}


//ENVIA EVENTO TYPING A AGENTE DE AWS
function agentTyping(){
    const params = {
        ConnectionToken: token,
        ContentType: "application/vnd.amazonaws.connect.event.typing"
    }
            
    connectparticipant.sendEvent(params, (err,data) => {
        if (err) console.log(err, err.stack);

    })
}

/*
function agentacknowledged(){
    const params = {
        ConnectionToken: token,
        ContentType: "application/vnd.amazonaws.connect.event.connection.acknowledged"
    }
            
    connectparticipant.sendEvent(params, (err,data) => {
        if (err) console.log(err, err.stack);
 
    })
}
*/


// ENVIA LA TRANSCRIPTION DEL TEXTO EN BLOQUES DE 1024 caracteres
async function transcriptText(text,splitChar){
    var a = text.split(splitChar)
    var texto =''
        for (i = 0 ; i <=a.length-1; i++) {
            texto=a[i].replace(/['"]+/g, '')+'\r\n'+texto
                 
        } 
        console.log(texto.replace("\\",'').replace(/['"]+/g, ''));

    var chunks = [];
        if(texto.length>0){
        for (var i = 0, charsLength = texto.length; i < charsLength; i += 1024) {
            chunks.push(texto.substring(i, i + 1024));
        }

        for (i = 0 ; i <=chunks.length-1; i++) {          
                 await enviaMensajeWebsocketPromise(chunks[i]);              
        } 
    }  
}


// ENVIA MENSAJE A WEBSOCKET DE MANERA ASINCRONA (PARA MOSTAR EN ORDEN LOS MENSAJES DE TRANSCRIPCION)
async function enviaMensajeWebsocketPromise(mensaje){
 return new Promise( function(resolve, reject){
        const params = {
            ConnectionToken: token,
            Content: mensaje,
            ContentType: 'text/plain'
        }                
   connectparticipant.sendMessage(params, (err,data) => {
            if( err )
                console.log(err,err.stack);
            })
            setTimeout(function() {
         resolve();
        }, 500);
    });
}





