var fs = require('fs');
var http = require('http');
var NYT =  require('nyt');
var request = require('request');

var keys = {'article-search':'e29d2a9f72bb4ba8a589e826a2961577'}



exports.handler = (event, context, callback) => {
    
    try {
    
    //New Session
    if (event.session.new) {
        console.log("NEW SESSION");
    }
    switch (event.request.type) {
    //Launch Request - If I just say "ask the book"
        case "LaunchRequest":

 
            context.succeed(
               generateResponse(
                  buildSpeechletResponse("Welcome to the New York Times news portal. What is your news focus today?", true),
                  {}
                 )
                )
           console.log("LAUNCH REQUEST")
           break;

    //Intent Request - Anything with one of the sample utterances
        case "IntentRequest":
           console.log("INTENT REQUEST")
           
           switch(event.request.intent.name) {
	
               case "findArticles":
					var topic = event.request.intent.slots.topic.value;
					// // Built by LucyBot. www.lucybot.com
					request.get({
					  url: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
					  qs: {
					    'api-key': "e29d2a9f72bb4ba8a589e826a2961577",
					    'fq': 'body.search:(\"' + topic + '\")',
					    'fl': "headline,lead_paragraph,web_url"
					  },
					}, function(err, response, body) {
					  body = JSON.parse(body);
					  console.log(body);
					  //var headline = body["response"]["docs"][0]["headline"]["main"];
					  //var lead_paragraph = body["response"]["docs"][0]["lead_paragraph"];
					  //var web_url = body["response"]["docs"][0]["web_url"]
					  //var pub_date = 
					  //var cardText = lead_paragraph + " " + web_url;
					  if (body["response"]["docs"].length > 3) {
 							var bodyText = " ";
 							for (var i = 0; i < 3; i++) {
 								bodyText += String(i + 1) + ": " + body["response"]["docs"][i]["headline"]["main"] + "\n"; 
 								//+ body["response"]["docs"][i]["web_url"] + "\n";
 							}
 						}
 							else {
 								for (var j = 0; j < body["response"]["docs"].length; j++) {
 								bodyText += String(j+ 1) + ": " + body["response"]["docs"][j]["headline"]["main"] + "\n"; //+ body["response"]["docs"][j]["web_url"] + "\n";
 							}
 						}

                      context.succeed(
 							
                       generateResponse(
                           buildSpeechletResponse("from the New York Times" + " " + topic, true, topic, bodyText),
                           {}
                       )
                    )
					});				
			}
                  
           break;
    //Session Ended Request
        case "SessionEndRequest":
           console.log("SESSION END REQUEST")
           break;
        default:
           context.fail('INVALID REQUEST TYPE $(event.request.type)')
    
    }
    }
    catch(error) { context.fail('Exception: $(error)') }
    
   
};

buildSpeechletResponse = (outputText, shouldEndSession, topic, text) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
	card: {
      type: "Simple",
      title: "Here is your New York Times potal response for " + " " + '"' + topic + '"',
      content: text
    },
    shouldEndSession: shouldEndSession
  }
	

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}