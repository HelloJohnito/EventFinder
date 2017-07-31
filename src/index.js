"use strict";
var Alexa = require('alexa-sdk');
var axios = require('axios');
var accountSid = "";
var authToken = "";

var client = require('twilio')(accountSid, authToken);

var APP_ID = "";
var speechOutput;
var reprompt;

var handlers = {
  'state': {},

  'LaunchRequest': function(){
    var welcomeOutput = "What events are you looking for?";
    var welcomeReprompt = "What events are you looking for?";
    this.emit(':ask', welcomeOutput, welcomeReprompt);
  },

  // Alexa, ask event finder ""
  'EventsIntent': function(){
    var title = this.event.request.intent.slots.title.value;
    var city = this.event.request.intent.slots.city.value;

    var returnedEvent = handlers.getEvent(title, city);
    var self = this;
    returnedEvent.then(function(data){
      var tenData = data.data.events.slice(0,5);
      var tenEventTitles = [];
      var numId = 1;
      tenData.forEach(function(el){
        tenEventTitles.push(`${numId}: ${el.name.text}`);
        handlers.state[numId] = el.name.text;
        numId += 1;
      });


      console.log(`This is the retreived events: ${tenEventTitles}`);

      var introOutput = `Here are the first five events from ${title} at ${city}: `;
      speechOutput = tenEventTitles.join(", ").replace(/&/g, "and");
      self.emit(":tell",  `${introOutput} ${speechOutput}`);
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
