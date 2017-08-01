"use strict";
var Alexa = require('alexa-sdk');
var axios = require('axios');
// var accountSid = "";
// var authToken = "";

// var client = require('twilio')(accountSid, authToken);

var APP_ID = "";
var speechOutput;
var reprompt;
var state = {};

var handlers = {

  'LaunchRequest': function(){
    var welcomeOutput = "What events are you looking for? Please say the event and the city.";
    var welcomeReprompt = "What events are you looking for?";
    this.emit(':ask', welcomeOutput, welcomeReprompt);
  },

  // Alexa, ask event finder ""
  'EventsIntent': function(){
    var title = this.event.request.intent.slots.title.value;
    var city = this.event.request.intent.slots.city.value;

    // console.log(`this is title: ${title}`);
    // console.log(`this is city: ${city}`);

    var returnedEvent = handlers.getEvent(title, city);
    var self = this;
    returnedEvent.then(function(data){
      var tenData = data.data.events.slice(0,5);
      var tenEventTitles = [];
      var numId = 1;
      tenData.forEach(function(el){
        tenEventTitles.push(`${numId}: ${el.name.text}`);
        state[numId] = {text: el.name.text, url: el.url};
        numId += 1;
      });

      var introOutput;
      if(city === null){
        introOutput = `Here are the first five events for ${title} events: `;
      } else {
        introOutput = `Here are the first five events for ${title} events at ${city}: `;
      }
      speechOutput = tenEventTitles.join(", ").replace(/&/g, "and");
      self.emit(":ask",  `${introOutput} ${speechOutput}. Which one are you interested in? Say the number.`);
    });
  },

  getEvent: function(title, city){
    return axios({
      method: 'get',
      url:"https://www.eventbriteapi.com/v3/events/search/?token=FL7XRX7KTFAZN3TLOMLO",
      params: {
        q: title,
        "location.address": city
      }
    });
  },

  'SelectionIntent': function(){
    var number = this.event.request.intent.slots.number.value;
    if(number > 5 || number < 1){
      this.emit(':ask', "choose a number between 1 and 5. What would you like to choose?");
    } else {
      state['selected'] = number;
      this.emit(':tell', `You have chosen ${state[number].text}. Do you want me to send you a link to your phone? If yes, say send me a text.`);
    }
  },

  'SendTextIntent': function(){
    if(state['selected']){
      var eventUrl = state[state['selected']].url;
      
      this.emit(':tell', 'The link had been sent to your phone.');
    } else {
      this.emit('ask', 'which event number did you select? Please select again.');
    }
  },

  'AMAZON.HelpIntent': function () {
      speechOutput = "What event are you looking for?";
      reprompt = "What event are you looking for?";
      this.emit(':ask', speechOutput, reprompt);
  },

  'AMAZON.CancelIntent': function () {
      speechOutput = "";
      this.emit(':tell', speechOutput);
  },

  'AMAZON.StopIntent': function () {
      speechOutput = "";
      this.emit(':tell', speechOutput);
  },
};

exports.handler = function (event, context, callback){
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
