function enviarAyuda(textToPush, labelToShow, shouldHideRequest){
    var wisdomText = "Ayuda";
    // send it to the Lex runtime
    var params = {
    botAlias:  cfgAWSbotAlias,
    botName: cfgAWSbotName,    
    // if the caller has specifically provided text to be pushed, use it
    inputText: textToPush ? textToPush : wisdomText,
    userId: lexUserId,
    sessionAttributes: sessionAttributes };

    // if the caller has specifically provided a label to be shown, show it
    if (!shouldHideRequest) {
    showRequest(labelToShow ? labelToShow : wisdomText);
    }
    lexruntime.postText(params, function (err, data) {
    if (err) {
    showError('Oh uh, ocurrio un error de conexión, por favor intentalo más tarde.');
    }
    if (data) {
        // check for missed utterances
        checkForMissedUtterances(data);
        // capture the sessionAttributes for the next cycle
        sessionAttributes = data.sessionAttributes;
        // reset the responseCardOptions
        responseCardOptions = null;
        // show response and/or error/dialog status
        showResponse(data);
    }
    // re-enable input
    wisdomText.value = '';
    wisdomText.locked = false;
    });
    // we always cancel form submission
    return false;
}
     


    // if the caller has specifically provided a label to be shown, show it
    if (!shouldHideRequest) {
    showRequest(labelToShow ? labelToShow : wisdomText);
    }
    lexruntime.postText(params, function (err, data) {
    if (err) {
    showError('Oh uh, ocurrio un error de conexión, por favor intentalo más tarde.');
    }
    if (data) {
        // check for missed utterances
        checkForMissedUtterances(data);
        // capture the sessionAttributes for the next cycle
        sessionAttributes = data.sessionAttributes;
        // reset the responseCardOptions
        responseCardOptions = null;
        // show response and/or error/dialog status
        showResponse(data);
    }
    // re-enable input
    wisdomText.value = '';
    wisdomText.locked = false;
    });
    // we always cancel form submission
    return false;
}

function pushChat(textToPush, labelToShow, shouldHideRequest) {

    if( ws == null ){
	{	
            // if there is text to be sent...
            var wisdomText = document.getElementById('wisdom');
            if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {
                // disable input to show we're sending it
                var wisdom = wisdomText.value.trim();
                //wisdomText.value = '...';
                wisdomText.value = '';
                wisdomText.locked = true;
  
           
                
                // if a response card was being used and the user typed in an option that is one
                // of the responses, then send the value of the response, not the text that was typed in
                if (responseCardOptions && !labelToShow) {
                // this means a response card was shown to the user, but she chose to type in a response instead
                // of clicking
                // TODO:  hide the responseCardOptions
                for (var i = 0; i < responseCardOptions.length; i++) {
                    //if (window.CP.shouldStopExecution(0)) break;
                    var item = responseCardOptions[i];
                    if (wisdom.toUpperCase() === item.text.toUpperCase()) {
                    textToPush = item.value;
                    labelToShow = item.text;
                    // break out of the loop
                    i = responseCardOptions.length + 1;
                    }
              
                }//window.CP.exitedLoop(0);
                }
                // send it to the Lex runtime
                var params = {
                botAlias: cfgAWSbotAlias,
                botName: cfgAWSbotName,
                // if the caller has specifically provided text to be pushed, use it
                inputText: textToPush ? textToPush : wisdom,
                userId: lexUserId,
                sessionAttributes: {
                    userFullName:document.getElementById('usrFullName').innerText,
                    userFirstName:document.getElementById('usrFirstName').innerText,
                    userEmail: document.getElementById('usrEmail').innerText
                }
             };

                transcriptiontext='|User:'+params.inputText.replace(/(\r\n|\n|\r)/gm, "").replace(/['"]+/g, '')+transcriptiontext.replace(/(\r\n|\n|\r)/gm, "").replace(/['"]+/g, '');

                var transcriptiontextFormat=transcriptiontext
                localStorage.setItem("transcriptiontext",transcriptiontextFormat)
                //console.log(localStorage.getItem("transcriptiontext"));
   
                // if the caller has specifically provided a label to be shown, show it
                if (!shouldHideRequest) {
                showRequest(labelToShow ? labelToShow : wisdom);
                }

                var scrollChatBot = document.getElementById('divScroll');
                scrollChatBot.scrollTop = scrollChatBot .scrollHeight;
                var scrollChatBot2 = document.getElementById('conversation');
                scrollChatBot2.scrollTop = scrollChatBot2 .scrollHeight;
                lexruntime.postText(params, function (err, data) {
                if (err) {
                showError('Perdona, no encontre información acerca de lo que pediste, intenta de nuevo');
                }
                if (data) {
                    // check for missed utterances
                    checkForMissedUtterances(data);
                    // capture the sessionAttributes for the next cycle
                    sessionAttributes = data.sessionAttributes;
                    // reset the responseCardOptions
                    responseCardOptions = null;
                    // show response and/or error/dialog status
                    showResponse(data);
                    transcriptiontext='|Bot:'+data.message.replace(/(\r\n|\n|\r)/gm, "").replace(/['"]+/g, '')+transcriptiontext.replace(/(\r\n|\n|\r)/gm, "").replace(/['"]+/g, '');
                    var transcriptiontextFormat=transcriptiontext
                    localStorage.setItem("transcriptiontext",transcriptiontextFormat);
                    //console.log(localStorage.getItem("transcriptiontext"));

                }
                // re-enable input
                wisdomText.value = '';
                wisdomText.locked = false;                
                });
            }
            }
    }
    else{


        var wisdomText = document.getElementById('wisdom');
        if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {
                // disable input to show we're sending it
                var wisdom = wisdomText.value.trim();
                wisdomText.value = '...';
                wisdomText.locked = true;

                labelToShow = wisdom

                showRequest(labelToShow ? labelToShow : wisdom);
                wisdomText.value = '';
                wisdomText.locked = false;
        }
        enviaMensajeWebsocket(wisdom);
        htmlTxt = document.getElementById('conversation').innerHTML;
        localStorage.setItem("botHtml",htmlTxt)
    }
    htmlTxt = document.getElementById('conversation').innerHTML;    
    localStorage.setItem("botHtml",htmlTxt)

    var scrollChatBot = document.getElementById('divScroll');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;

    return false;
  }
  function checkForMissedUtterances(lexResponse) {
      // clarificationPrompt entries for the bot so we know when we get these responses
      var clarificationPrompts = [
          'I hate to admit it, but I only know about Amazon Lex at this time. Sorry.',
          'Sorry; I don\'t understand that. Can we try something easier like, "Tell me about Amazon Lex."'
      ];

      if (!lexResponse.sessionAttributes) {
          lexResponse.sessionAttributes = {};
          lexResponse.sessionAttributes.missedUtterances = '0';
      }
      // missed utterances result in an ElicitIntent
      if (lexResponse.dialogState && lexResponse.dialogState === 'ElicitIntent') {
          // missed utterances result in clarificationPrompts
          if (lexResponse.message && clarificationPrompts.indexOf(lexResponse.message) != -1) {
          lexResponse.sessionAttributes.missedUtterances =
          ((parseInt(lexResponse.sessionAttributes.missedUtterances) || 0) + 1).toString();
          return;
          }
      }
      // if we got to this point, then we didn't have a missed utterance
      lexResponse.sessionAttributes.missedUtterances = '0';
  }
  function showRequest(daText) {
      var conversationDiv = document.getElementById('conversation');
      var requestPara = document.createElement("P");
      requestPara.className = 'userRequest';
      requestPara.appendChild(document.createTextNode(daText));
      conversationDiv.appendChild(requestPara);
      var scrollChatBot = document.getElementById('divScroll');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;
  }
  function showError(daText) {
      var conversationDiv = document.getElementById('conversation');
      var errorPara = document.createElement("P");
      errorPara.className = 'lexResponse';
      errorPara.appendChild(document.createTextNode(daText));
      conversationDiv.appendChild(errorPara);
      var scrollChatBot = document.getElementById('divScroll');
    scrollChatBot.scrollTop = scrollChatBot .scrollHeight;
  }
  function postCardOption(optionLabel, optionValue, optionsSpan) {
      // hide the options, now that one has been chosen
      // TODO:  also do this if the user has typed an answer
      optionsSpan.style.display = 'none';
      // post the optionLabel to the bot, but show the optonValue
      var wisdomText = document.getElementById('wisdom');
      if (wisdomText) {
          wisdomText.value = optionLabel;
          pushChat(optionValue, optionLabel);
      }
  }
 
  function renderResponseCard(message, responseCard, responsePara){

  if (responseCard.genericAttachments && responseCard.genericAttachments.length > 0) {
      // we will render at most 1 card
      var card = responseCard.genericAttachments[0];
      var ImagenCarta = card.imageUrl;
      var BotonCarta = card.attachmentLinkUrl
      document.getElementById("img01").src = ImagenCarta;  

      // title              
    //   var elem = document.createElement('span');
    //   elem.className = 'cardTitle';
    //   elem.appendChild(document.createTextNode(card.title));
    //   responsePara.appendChild(elem);
      

      // subtitle
      elem = document.createElement('span');
      elem.className = 'cardSubtitle';
      elem.innerHTML = card.subTitle;
      responsePara.appendChild(elem);

      // subtitle
      elem = document.createElement('span');
      elem.className = 'cardResponse';
      elem.innerHTML = "<p class='lexResponse'>"+ message+"</p>";
      responsePara.appendChild(elem);
      
    //Buttons
    if (card.buttons) {
        var optionsSpan = document.createElement('span');
        optionsSpan.className = 'cardOptions';
        responsePara.appendChild(optionsSpan);
        // remember the responseCardOptions so we know if the user types one in
            responseCardOptions = card.buttons;
        for (var i = 0; i < card.buttons.length; i++){
            var item = card.buttons[i];
            elem = document.createElement('a');
            elem.className = 'cardOption';
            elem.href = '#';
            elem.setAttribute('onclick', "postCardOption(\"" + item.text + "\", \"" + item.value + "\", this.parentNode); return false;");
            elem.title = item.text;
            elem.appendChild(document.createTextNode(item.text));
            optionsSpan.appendChild(elem);
        }
    }

    localStorage.setItem("botHtml",htmlTxt)

    if(typeof card.imageUrl === 'undefined' || card.imageUrl === null){
        //return
    }
    else{
        //Video
        if (card.imageUrl.endsWith('mp4' || 'MP4' || 'MOV' || 'mov')) {
        elem = document.createElement('span');
        elem.className = 'videoUrl';
        elem.innerHTML = "<video class=\"msg-video\" width='400' controls> <source src='" + card.imageUrl + "'> Tu navegador no soporta el video. </video>";
        responsePara.appendChild(elem);
        htmlTxt = document.getElementById('conversation').innerHTML;
        localStorage.setItem("botHtml",htmlTxt)
        }
        //Imagenes
        else {
            elem = document.createElement('span');
            elem.className = 'imageUrl';
            elem.innerHTML = "<img src='"+card.imageUrl+"'  name=\"imagenLex\" data-toggle=\"modal\"  onclick=\"showImageModal('"+card.imageUrl+"' )\"  class=\"msg-image\" width=\'390px\' width=\'200px\'>";
            //onclick=\"imagenAmpli()\"
            responsePara.appendChild(elem);
            htmlTxt = document.getElementById('conversation').innerHTML;
            localStorage.setItem("botHtml",htmlTxt)
        }
    }
    // boton link
    if(typeof card.attachmentLinkUrl === 'undefined' || card.attachmentLinkUrl === null){
      //  return
    }else{
            elem = document.createElement('span');
            elem.className = 'link';
            elem.innerHTML = "<a href='" + card.attachmentLinkUrl + "'class=\"cardOption\" target=\"_blank\">Ver Liga</a>";
            responsePara.appendChild(elem);
            htmlTxt = document.getElementById('conversation').innerHTML;
            localStorage.setItem("botHtml",htmlTxt)
    }

    htmlTxt = document.getElementById('conversation').innerHTML;
    localStorage.setItem("botHtml",htmlTxt)

  } 
  
  else

  throw new Error('I have no response card content to work with!');
}

  function showResponse(lexResponse) {
      var conversationDiv = document.getElementById('conversation');
      var responsePara = document.createElement("P");
      responsePara.className = 'lexResponse';
      htmlTxt = document.getElementById('conversation').innerHTML;  

      
  
      // look for a response card first
      if (lexResponse.responseCard) {
          // if a larger title is available, use it
          if (lexResponse.sessionAttributes && lexResponse.sessionAttributes.fullTitle &&
              lexResponse.sessionAttributes.fullTitle != lexResponse.responseCard.genericAttachments[0].title) {
              lexResponse.responseCard.genericAttachments[0].title = lexResponse.sessionAttributes.fullTitle;
          }
          // if a larger subtitle is available, use it
          if (lexResponse.sessionAttributes && lexResponse.sessionAttributes.fullSubtitle &&
              lexResponse.sessionAttributes.fullSubtitle != lexResponse.responseCard.genericAttachments[0].subTitle) {
              lexResponse.responseCard.genericAttachments[0].subTitle = lexResponse.sessionAttributes.fullSubtitle;
          }
          if (lexResponse.message && lexResponse.sessionAttributes && lexResponse.sessionAttributes.fullLink &&
              lexResponse.sessionAttributes.fullLink != lexResponse.responseCard.genericAttachments[0].attachmentLinkUrl) {
              lexResponse.responseCard.genericAttachments[0].attachmentLinkUrl = lexResponse.sessionAttributes.fullLink;
          }
          if (lexResponse.message && lexResponse.sessionAttributes && lexResponse.sessionAttributes.fullImageUrl &&
              lexResponse.sessionAttributes.fullImageUrl != lexResponse.responseCard.genericAttachments[0].imageUrl) {
              lexResponse.responseCard.genericAttachments[0].imageUrl = lexResponse.sessionAttributes.fullImageUrl;
              
          }
          renderResponseCard(lexResponse.message, lexResponse.responseCard, responsePara);
          } else
              if(lexResponse.messageFormat === "Composite"){
                  //var mesresult = "";
                  var mnsg = lexResponse.message;
                  let response = JSON.parse(mnsg);
                  var cantidadMsg = response.messages;
                  console.log(cantidadMsg);
                

                  //Manda mensajes juntos y separados por br
                  for (var i = 0; i < cantidadMsg.length; i++) {
                      responsePara.appendChild(document.createTextNode(cantidadMsg[i].value));
                      responsePara.appendChild(document.createElement('br'));
                      

                  }  
              }else{
                  responsePara.appendChild(document.createTextNode(lexResponse.message));
                  responsePara.appendChild(document.createElement('br'));
              }

              if (lexResponse.message === 'Llamada con el Agente en progreso'){
                // AmazonConnect();
                iniciarLlamada();
                 console.log("Conectando con Amazon Connect");
              }
              if (lexResponse.dialogState === 'ReadyForFulfillment') {
                  responsePara.appendChild(document.createTextNode('Ready for fulfillment'));
                  // TODO:  show slot values
              } else
              {
                  missedUtterances = lexResponse.sessionAttributes.missedUtterances;
              }
          conversationDiv.appendChild(responsePara);
          conversationDiv.className = 'lexResponse';

          var scrollChatBot = document.getElementById('divScroll');
          scrollChatBot.scrollTop = scrollChatBot .scrollHeight;
          htmlTxt = document.getElementById('conversation').innerHTML;

          localStorage.setItem("botHtml",htmlTxt)

   
  }
  

