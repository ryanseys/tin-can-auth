var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var tabutils = require("sdk/tabs/utils");
var {Cc, Ci, Cu, Cr, Cm} = require("chrome");

Cu.import(data.url("RTCIdentity.jsm"));
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/PopupNotifications.jsm");

const { getTabs, getTabId } = require('sdk/tabs/utils');

tabs.on("ready", openedNewTab);

function getChromeTab(sdkTab) {
  for (let tab of getTabs())
    if (sdkTab.id === getTabId(tab))
      return tab;

  return null;
}

function openedNewTab(tab) {
  var contentWindow;
  let chromeTab = getChromeTab(tab);
  if(chromeTab) {
    contentWindow = tabutils.getTabContentWindow(chromeTab);
  }

  var RTCPeerConnectionID = function() {
    this._nbox = tabutils.getTabBrowser(tabutils.getOwnerWindow(chromeTab)).getNotificationBox();
    this._pc = new contentWindow.mozRTCPeerConnection();
    this._idp = new PeerConnectionIDP(this._pc, contentWindow, console.log);

    this.addIceCandidate = function() {
      return this._pc.addIceCandidate.apply(this._pc, arguments);
    };

    this.addStream = function() {
      return this._pc.addStream.apply(this._pc, arguments);
    };

    this.close = function() {
      return this._pc.close.apply(this._pc, arguments);
    };

    this.connectDataConnection = function() {
      return this._pc.connectDataConnection.apply(this._pc, arguments);
    };

    this.createAnswer = function(successCB, failureCB, constraints) {
      return this._pc.createAnswer(function(desc) {
        this._idp.signSDPWithAssertion(desc.sdp, function(sdp) {
          successCB(new contentWindow.mozRTCSessionDescription({ type: "answer", sdp: sdp }));
        }.bind(this));
      }.bind(this), failureCB, constraints);
    };

    this.createOffer = function(successCB, failureCB, constraints) {
      return this._pc.createOffer(function(desc) {
        this._idp.signSDPWithAssertion(desc.sdp, function(sdp) {
          successCB(new contentWindow.window.mozRTCSessionDescription({ type: "offer", sdp: sdp }));
        }.bind(this));
      }.bind(this), failureCB, constraints);
    };

    this.createDataChannel = function() {
      return this._pc.createDataChannel.apply(this._pc, arguments);
    };

    this.setLocalDescription = function() {
      return this._pc.setLocalDescription.apply(this._pc, arguments);
    };

    this.setRemoteDescription = function(desc, successCB, failureCB) {
      let verifyCallback = function(identity) {
        let message, icon, priority;

        if(!identity) {
          message = "WARNING: The identity of the other party could not be verified.";
          icon = "chrome://global/skin/icons/warning-16.png";
          priority = this._nbox.PRIORITY_WARNING_HIGH;
        }
        else  {
          message = "You are now talking securely to " + identity;
          icon = "chrome://browser/skin/Secure-Glyph.png";
          priority = this._nbox.PRIORITY_WARNING_MEDIUM;
        }

        let buttons = [
        // {
        //   label: "Okay",
        //   accessKey: "Y",
        //   popup: "test",
        //   callback: null
        // }
        ];

        this._nbox.appendNotification(message, "webrtc-auth", icon, priority, buttons);
      }.bind(this);
      this._idp.verifySDP(desc.sdp, verifyCallback);
      this._pc.setRemoteDescription(desc, successCB, failureCB);
    };

    this.updateIce = function() {
      return this._pc.updateIce.apply(this._pc, arguments);
    };

    this.__defineSetter__('onaddstream', function(val) {
      this._pc.onaddstream = val;
    });

    this.__defineGetter__('onaddstream', function(val) {
      return this._pc.onaddstream;
    });

    this.__defineSetter__('onclosedconnection', function(val) {
      this._pc.onclosedconnection = val;
    });

    this.__defineGetter__('onclosedconnection', function(val) {
      return this._pc.onclosedconnection;
    });

    this.__defineSetter__('onconnection', function(val) {
      this._pc.onconnection = val;
    });

    this.__defineGetter__('onconnection', function(val) {
      return this._pc.onconnection;
    });

    this.__defineSetter__('ondatachannel', function(val) {
      this._pc.ondatachannel = val;
    });

    this.__defineGetter__('ondatachannel', function(val) {
      return this._pc.ondatachannel;
    });

    this.__defineSetter__('ongatheringchange', function(val) {
      this._pc.ongatheringchange = val;
    });

    this.__defineGetter__('ongatheringchange', function(val) {
      return this._pc.ongatheringchange;
    });

    this.__defineSetter__('onicecandidate', function(val) {
      this._pc.onicecandidate = val;
    });

    this.__defineGetter__('onicecandidate', function(val) {
      return this._pc.onicecandidate;
    });

    this.__defineSetter__('onicechange', function(val) {
      this._pc.onicechange = val;
    });

    this.__defineGetter__('onicechange', function(val) {
      return this._pc.onicechange;
    });

    this.__defineSetter__('onopen', function(val) {
      this._pc.onopen = val;
    });

    this.__defineGetter__('onopen', function(val) {
      return this._pc.onopen;
    });

    this.__defineSetter__('onremotestream', function(val) {
      this._pc.onremotestream = val;
    });

    this.__defineGetter__('onremotestream', function(val) {
      return this._pc.onremotestream;
    });

    this.__defineSetter__('onstatechange', function(val) {
      this._pc.onstatechange = val;
    });

    this.__defineGetter__('onstatechange', function(val) {
      return this._pc.onstatechange;
    });

    /**
     * Getters
     */

    this.__defineGetter__('remoteStreams', function(val) {
      return this._pc.remoteStreams;
    });

    this.__defineGetter__('iceGatheringState', function(val) {
      return this._pc.iceGatheringState;
    });

    this.__defineGetter__('iceState', function(val) {
      return this._pc.iceState;
    });

    this.__defineGetter__('localDescription', function(val) {
      return this._pc.localDescription;
    });

    this.__defineGetter__('localStreams', function(val) {
      return this._pc.localStreams;
    });

    this.__defineGetter__('remoteDescription', function(val) {
      return this._pc.remoteDescription;
    });

    this.__defineGetter__('readyState', function(val) {
      return this._pc.readyState;
    });

    this.setIdentityProvider = function(provider, protocol, username) {
      this._idp.init(provider, protocol, username); //initialize the idp
    }.bind(this);

    this.__exposedProps__ = {
      'setIdentityProvider': "r",
      'onaddstream' : "rw",
      'onclosedconnection' : "rw",
      'onconnection' : "rw",
      'ondatachannel' : "rw",
      'ongatheringchange' : "rw",
      'onicecandidate' : "rw",
      'onicechange' : "rw",
      'onopen' : "rw",
      'onremotestream' : "rw",
      'onstatechange' : "rw",
      'remoteStreams': "r",
      'iceGatheringState': "r",
      'iceState': "r",
      'localDescription': "r",
      'localStreams': "r",
      'remoteDescription': "r",
      'readyState': "r",
      'addIceCandidate': "r",
      'addStream': "r",
      'close': "r",
      'connectDataConnection': "r",
      'createAnswer': "r",
      'createOffer': "r",
      'createDataChannel': "r",
      'setLocalDescription': "r",
      'setRemoteDescription': "r",
      'updateIce': "r"
    };
  };

  contentWindow.wrappedJSObject.RTCPeerConnectionID = RTCPeerConnectionID;
}

function PeerConnectionIDP(pc, win, logger) {
  this.debug = false;
  this.log = this.debug ? logger : function() {};
  this._win = win; //contentWindow
  this._dompc = pc; // peer connection object
  this.provider = null; // user specified idp domain (gmail.com/login.persona.org/yahoo.com)
  this.protocol = null; // protocol to use ("default")
  this.username = null; // unique identity string for that IDP
  this.set = false; // true if the IDP has been initialized previously
  this.idpChannel = null;
  this.messages = {};
  this.messageCount = 0;
  this.ready = false;

  this.init();
};

PeerConnectionIDP.prototype = {
  init: function(provider, protocol, username) {
    // set the required values
    this.set = true;
    this.provider = provider || null;
    this.protocol = protocol || null;
    this.username = username || null;
    // this._dompc._peerIdentity.idp = this.provider;
    this.idpChannel = !this.provider ? null : new IDPChannel(this.onMessage.bind(this), { provider: this.provider, protocol: this.protocol, username: this.username, logger: this.log });
  },

  onMessage: function(message) {
    message = JSON.parse(message);
    /*
      RETURNED FROM SIGN MESSAGE:
      {
        "type":"SUCCESS",
        "id":1,
        "message": {
          "idp":{
            "domain": "example.org"
            "protocol": "bogus"
          },
          "assertion":\"{\"identity\":\"bob@example.org\",
                         \"contents\":\"abcdefghijklmnopqrstuvwyz\",
                         \"request_origin\":\"rtcweb://peerconnection\",
                         \"signature\":\"010203040506\"}"
        }
      }

      RETURNED FROM VERIFY MESSAGE:
      {
        "type":"SUCCESS",
        "id":2,
        "message": {
          "identity" : {
            "name" : "bob@example.org",
            "displayname" : "Bob"
          },
          "request_origin":"rtcweb://peerconnection",
          "contents":"abcdefghijklmnopqrstuvwyz" //fingerprint
        }
      }
    */
    this.log("Received message: " + JSON.stringify(message));

    // let message = JSON.parse(message);
    if(!message) return;
    let msg = message.message || {};
    let identity = msg.identity || {};
    let stored = this.messages[message.id] || { callback: function(){} }; // lookup stored message
    if(message.type == 'SUCCESS') {
      if(stored.type == 'SIGN') {
        return stored.callback(msg.assertion); // callback with assertion
      }
      else if(stored.type == 'VERIFY') {
        if(msg.request_origin == "rtcweb://peerconnection") { // very important check!
          let stored_fingerprint = stored.message.fingerprint;
          if(stored_fingerprint && msg.contents == stored_fingerprint) { // most important check
            return stored.callback(identity.name); // no error: callback with identity
          }
        }
      }
    }
    else if(message.type == "ERROR"){
      this.log("ERROR: " + message.error);
    }
    else if(message.type == "READY") {
      this.ready = true;
    }
    return stored.callback(null);
  },

  /**
   * Extracts and returns a fingerprint from SDP
   * @param  {String} sdp a given SDP from PC offer/answer
   * @return {String}     fingerprint from the SDP (or null)
  */
  getFingerprintFromSDP: function(sdp) {
    if(!sdp) return null;
    let pattern = /\na=fingerprint:\s*(\S+\s*\S*)/i; //TODO: test the shit outta this
    let fingerprint_matches = sdp.match(pattern);
    if(!fingerprint_matches) return null;
    return fingerprint_matches[1];
  },

  /**
   * Extracts and returns an identity assertion from SDP
   * @param  {String} sdp a given SDP from PC offer/answer
   * @return {String}     a identity assertion from SDP (or null)
   */
  getIdentityFromSDP: function(sdp) {
    let id_patt = /\na=identity:\s*(\S+\s*\S*)/i; // TODO: test the shit outta this too
    let assertion_matches = sdp.match(id_patt);
    if(!assertion_matches) return null; //no matches (old browser?)
    return assertion_matches[1]; // a match!
  },

  /**
   * Signs a given SDP with an assertion from IDP
   * @param  {String}     sdp       the SDP of the offer/answer
   * @param  {Function}   callback  callback returning modified SDP with assertion
   * @return {undefined}            undefined
   */
  signSDPWithAssertion: function(sdp, callback) {
    let fingerprint = this.getFingerprintFromSDP(sdp);

    this.requestIdentityAssertion(fingerprint, function(assertion) {

      sdp += "a=identity: " + assertion;
      callback(sdp);
    });
  },

  /**
   * Requests an assertion from the IDP Channel
   * @param  {String}   fingerprint fingerprint associated with Peer Connection
   * @param  {Function} callback    callback returning the assertion or null
   * @return {undefined}            undefined
   */
  requestIdentityAssertion: function(fingerprint, callback) {
    if(!this.ready) {
      return callback(null);
    }

    let origin = this._win.location.origin;

    let message_id = ++this.messageCount;

    let data = JSON.stringify({
      type: 'SIGN',
      id: message_id,
      origin: origin,
      message: fingerprint
    });

    this.messages[message_id] = {
      type: 'SIGN',
      message: fingerprint,
      callback: callback
    };

    this.log('Sending to idpChannel: ' + data);

    //send fingerprint to idp channel to create assertion
    this.idpChannel.send(data);
  },

  verifyIdentityAssertion: function(assertion, fingerprint, callback) {
    if(!this.ready) {
      return callback(null);
    }

    let message = {
      identity: assertion,
      fingerprint: fingerprint
    };

    let message_id = ++this.messageCount;

    let data = JSON.stringify({
      type: 'VERIFY',
      id: message_id,
      message: assertion
    });

    this.messages[message_id] = {
      type: 'VERIFY',
      message: message,
      callback: callback
    };

    this.log('Sending to idpChannel: ' + data);

    this.idpChannel.send(data);
  },

  verifySDP: function(sdp, callback) {
    if(!sdp) return callback(null);

    let fingerprint = this.getFingerprintFromSDP(sdp);
    if(!fingerprint) return callback(null);

    let assertion = this.getIdentityFromSDP(sdp);
    if(!assertion) return callback(null);

    this.verifyIdentityAssertion(assertion, fingerprint, callback);
  }
};
