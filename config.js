/*CONFIGURACION PARA AWS CONNECT */
if(typeof cfgAWSaccessKeyId === 'undefined') {
   let cfgAWSaccessKeyId ='AKIAXBIN2SGZ5O7RQOOW';
} 


if(typeof cfgAWSsecretAccessKey === 'undefined') {
  let cfgAWSsecretAccessKey = 'fsnsBLZdFGbwjT4tu+un/epmJbnuYV6AF4lX02G4';
} 

if(typeof cfgAWSRegion  === 'undefined') {
let cfgAWSRegion = 'us-east-1';
} 


if(typeof cfgAWSContactFlowId === 'undefined') {
let cfgAWSContactFlowId= '9e4f5bf3-daf9-4464-bed3-be407ca0adee';
} 

if(typeof cfgAWSInstanceId === 'undefined') {
let cfgAWSInstanceId='ffc7cb15-45c9-4a6e-ade6-926090dfa1fe';
} 




/*CONFIGURACIOND EL BOT*/

if(typeof cfgAWSIdentityPoolId === 'undefined') {
let cfgAWSIdentityPoolId = 'us-east-1:22ae9aac-d9ed-406b-9330-646907cc8262';
} 

if(typeof cfgAWSbotAlias === 'undefined') {
let cfgAWSbotAlias =  'Dev';
} 


if(typeof cfgAWSbotName === 'undefined') {
let cfgAWSbotName =  'Trinity';
} 

if(typeof cfgTypingInterval === 'undefined') {
let cfgTypingInterval =  120000; //Tiempo en ms para el envio de evento typing entre agente y usuario
} 
if(typeof cfgCloseConnectConection === 'undefined') {
let cfgCloseConnectConection =300000 ;//Tiempo en ms para desconectar automaticamente la llamada pendiente a AWS CONNECT
} 
if(typeof cfgHtmlBotRefresh === 'undefined') {
let cfgHtmlBotRefresh = 5000;   //Tiempo en ms para actualizacion de HTMl de la conversacion con bot
} 







