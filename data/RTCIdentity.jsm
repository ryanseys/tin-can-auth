/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

//

this.EXPORTED_SYMBOLS = ["IDPChannel"];

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// XXX protocol handler example
// https://mxr.mozilla.org/mozilla-central/source/toolkit/components/thumbnails/PageThumbsProtocol.js

XPCOMUtils.defineLazyModuleGetter(this, "Sandbox",
                                  "resource://gre/modules/identity/Sandbox.jsm");
/*
 * IDPChannel: A message channel between the RTC PeerConnection and a
 * designated IdP Proxy.
 *
 * @param aMessageCallback  Callback to invoke to send messages back to
 *        (function)        the caller.
 *
 * @param aOptions          Options from caller, as well as overrides to
 *        (object)          make testing easier.
 *
 *                          PeerConnection.js may use any of the following
 *                          options:
 *
 *                          provider:  identity provider (e.g., example.com)
 *                          protocol:  identity protocol (e.g., browserid)
 *                          identity:  user identity (e.g., alice@example.com)
 */
function IDPChannel(aMessageCallback, aOptions) {
  let doNothing = function() {};
  this.debug = false;
  aOptions = aOptions || {};
  this.log = this.debug ? aOptions.logger || doNothing : doNothing;
  this.logError = this.debug ? function() { this.log("Error: " + arguments[0]); } : doNothing;
  this.log(aOptions);

  this.receiveResponse = aMessageCallback;

  this.provider = aOptions.provider;
  this.protocol = aOptions.protocol || "default";
  this.well_known = this.provider + '/.well-known/idp-proxy/' + this.protocol;
  this.contentWindow = null;
  try {
    Services.io.newURI(this.well_known, null, null).spec;
    this.init();
  }
  catch(e) {
    this.logError("Bad URL");
  }
  // XXX Try to get an assertion immediately
}

IDPChannel.prototype = {
  init: function idpChannel_init() {
    // XXX origin for postMessage should be rtcweb://peerconnection
    // Does this require using Cu.Sandbox instead?
    new Sandbox(this.well_known, function(aSandbox) {
      this.contentWindow = aSandbox._frame.contentWindow;

      // when getting msg sent from sandbox
      this.contentWindow.addEventListener('message', function(e) {
        // log('target: '+ e.target);
        // log("source: " + e.source);
        // log('target origin: '+ e.target.location.origin);
        // log("source origin: " + e.source.location.origin);
        // log("origin: " + e.origin);
        // log("msg: " + e.data);
        // log("contentWindow: " + this.contentWindow);

        // ensure message came from itself and not another window
        if(e.source == this.contentWindow) {
          this.log("got msg: " + e.data);
          this.receiveResponse(e.data);
        }
        else {
          this.logError("Message from incorrect origin: " + e.data);
        }
      }.bind(this), false, true);

    }.bind(this));
  },

  send: function idpChannel_send(message) {
    if (!this.contentWindow) {
      return this.logError("HostFrame or MessageChannel not open");
    }

    try {
      // dispatch CustomEvent to the sandboxed window with our message as evt.detail
      // evt.isTrusted will be true, which should be checked in content to ensure
      // that the messages are originating from the user agent and not other content
      this.log('Sending message to sandbox: ' + message);
      let evt = new this.contentWindow.CustomEvent('rtcmessage', { detail : message });
      this.contentWindow.dispatchEvent(evt);
    } catch (err) {
      this.log('Failed to send message: ' + message);
      this.logError(err);
    }
  }
};

this.IDPChannel = IDPChannel;
