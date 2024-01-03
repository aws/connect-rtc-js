(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
//===============================================
// By using these Developer Materials, you accept and agree to comply with
// the terms of the Cloud Software Group Developer Terms of Use found here
// (https://www.cloud.com/legal)
//===============================================



var $jscomp={scope:{},getGlobal:function(d){return"undefined"!=typeof window&&window===d?d:"undefined"!=typeof global?global:d}};$jscomp.global=$jscomp.getGlobal(this);$jscomp.initSymbol=function(){$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol);$jscomp.initSymbol=function(){}};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(d){return"jscomp_symbol_"+d+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();$jscomp.global.Symbol.iterator||($jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));$jscomp.initSymbolIterator=function(){}};$jscomp.makeIterator=function(d){$jscomp.initSymbolIterator();if(d[$jscomp.global.Symbol.iterator])return d[$jscomp.global.Symbol.iterator]();var e=0;return{next:function(){return e==d.length?{done:!0}:{done:!1,value:d[e++]}}}};
$jscomp.arrayFromIterator=function(d){for(var e,k=[];!(e=d.next()).done;)k.push(e.value);return k};$jscomp.arrayFromIterable=function(d){return d instanceof Array?d:$jscomp.arrayFromIterator($jscomp.makeIterator(d))};
$jscomp.inherits=function(d,e){function k(){}k.prototype=e.prototype;d.prototype=new k;d.prototype.constructor=d;for(var b in e)if($jscomp.global.Object.defineProperties){var a=$jscomp.global.Object.getOwnPropertyDescriptor(e,b);a&&$jscomp.global.Object.defineProperty(d,b,a)}else d[b]=e[b]};$jscomp.array=$jscomp.array||{};$jscomp.array.done_=function(){return{done:!0,value:void 0}};
$jscomp.array.arrayIterator_=function(d,e){d instanceof String&&(d=String(d));var k=0;$jscomp.initSymbol();$jscomp.initSymbolIterator();var b={},a=(b.next=function(){if(k<d.length){var b=k++;return{value:e(b,d[b]),done:!1}}a.next=$jscomp.array.done_;return $jscomp.array.done_()},b[Symbol.iterator]=function(){return a},b);return a};
$jscomp.array.findInternal_=function(d,e,k){d instanceof String&&(d=String(d));for(var b=d.length,a=0;a<b;a++){var c=d[a];if(e.call(k,c,a,d))return{i:a,v:c}}return{i:-1,v:void 0}};
$jscomp.array.from=function(d,e,k){e=void 0===e?function(a){return a}:e;var b=[];$jscomp.initSymbol();$jscomp.initSymbolIterator();if(d[Symbol.iterator]){$jscomp.initSymbol();$jscomp.initSymbolIterator();d=d[Symbol.iterator]();for(var a;!(a=d.next()).done;)b.push(e.call(k,a.value))}else{a=d.length;for(var c=0;c<a;c++)b.push(e.call(k,d[c]))}return b};$jscomp.array.of=function(d){for(var e=[],k=0;k<arguments.length;++k)e[k-0]=arguments[k];return $jscomp.array.from(e)};
$jscomp.array.entries=function(){return $jscomp.array.arrayIterator_(this,function(d,e){return[d,e]})};$jscomp.array.entries$install=function(){Array.prototype.entries||(Array.prototype.entries=$jscomp.array.entries)};$jscomp.array.keys=function(){return $jscomp.array.arrayIterator_(this,function(d){return d})};$jscomp.array.keys$install=function(){Array.prototype.keys||(Array.prototype.keys=$jscomp.array.keys)};$jscomp.array.values=function(){return $jscomp.array.arrayIterator_(this,function(d,e){return e})};
$jscomp.array.values$install=function(){Array.prototype.values||(Array.prototype.values=$jscomp.array.values)};$jscomp.array.copyWithin=function(d,e,k){var b=this.length;d=Number(d);e=Number(e);k=Number(null!=k?k:b);if(d<e)for(k=Math.min(k,b);e<k;)e in this?this[d++]=this[e++]:(delete this[d++],e++);else for(k=Math.min(k,b+e-d),d+=k-e;k>e;)--k in this?this[--d]=this[k]:delete this[d];return this};$jscomp.array.copyWithin$install=function(){Array.prototype.copyWithin||(Array.prototype.copyWithin=$jscomp.array.copyWithin)};
$jscomp.array.fill=function(d,e,k){null!=k&&d.length||(k=this.length||0);k=Number(k);for(e=Number((void 0===e?0:e)||0);e<k;e++)this[e]=d;return this};$jscomp.array.fill$install=function(){Array.prototype.fill||(Array.prototype.fill=$jscomp.array.fill)};$jscomp.array.find=function(d,e){return $jscomp.array.findInternal_(this,d,e).v};$jscomp.array.find$install=function(){Array.prototype.find||(Array.prototype.find=$jscomp.array.find)};
$jscomp.array.findIndex=function(d,e){return $jscomp.array.findInternal_(this,d,e).i};$jscomp.array.findIndex$install=function(){Array.prototype.findIndex||(Array.prototype.findIndex=$jscomp.array.findIndex)};$jscomp.Map=function(d){d=void 0===d?[]:d;this.data_={};this.head_=$jscomp.Map.createHead_();this.size=0;if(d){d=$jscomp.makeIterator(d);for(var e=d.next();!e.done;e=d.next())e=e.value,this.set(e[0],e[1])}};
$jscomp.Map.checkBrowserConformance_=function(){var d=$jscomp.global.Map;if(!d||!d.prototype.entries||!Object.seal)return!1;try{var e=Object.seal({x:4}),k=new d($jscomp.makeIterator([[e,"s"]]));if("s"!=k.get(e)||1!=k.size||k.get({x:4})||k.set({x:4},"t")!=k||2!=k.size)return!1;var b=k.entries(),a=b.next();if(a.done||a.value[0]!=e||"s"!=a.value[1])return!1;a=b.next();return a.done||4!=a.value[0].x||"t"!=a.value[1]||!b.next().done?!1:!0}catch(c){return!1}};
$jscomp.Map.createHead_=function(){var d={};return d.previous=d.next=d.head=d};$jscomp.Map.getId_=function(d){if(!(d instanceof Object))return String(d);$jscomp.Map.key_ in d||d instanceof Object&&Object.isExtensible&&Object.isExtensible(d)&&$jscomp.Map.defineProperty_(d,$jscomp.Map.key_,++$jscomp.Map.index_);return $jscomp.Map.key_ in d?d[$jscomp.Map.key_]:" "+d};
$jscomp.Map.prototype.set=function(d,e){var k=this.maybeGetEntry_(d),b=k.id,a=k.list,k=k.entry;a||(a=this.data_[b]=[]);k?k.value=e:(k={next:this.head_,previous:this.head_.previous,head:this.head_,key:d,value:e},a.push(k),this.head_.previous.next=k,this.head_.previous=k,this.size++);return this};
$jscomp.Map.prototype["delete"]=function(d){var e=this.maybeGetEntry_(d);d=e.id;var k=e.list,b=e.index;return(e=e.entry)&&k?(k.splice(b,1),k.length||delete this.data_[d],e.previous.next=e.next,e.next.previous=e.previous,e.head=null,this.size--,!0):!1};$jscomp.Map.prototype.clear=function(){this.data_={};this.head_=this.head_.previous=$jscomp.Map.createHead_();this.size=0};$jscomp.Map.prototype.has=function(d){return!!this.maybeGetEntry_(d).entry};
$jscomp.Map.prototype.get=function(d){return(d=this.maybeGetEntry_(d).entry)&&d.value};$jscomp.Map.prototype.maybeGetEntry_=function(d){var e=$jscomp.Map.getId_(d),k=this.data_[e];if(k)for(var b=0;b<k.length;b++){var a=k[b];if(d!==d&&a.key!==a.key||d===a.key)return{id:e,list:k,index:b,entry:a}}return{id:e,list:k,index:-1,entry:void 0}};$jscomp.Map.prototype.entries=function(){return this.iter_(function(d){return[d.key,d.value]})};$jscomp.Map.prototype.keys=function(){return this.iter_(function(d){return d.key})};
$jscomp.Map.prototype.values=function(){return this.iter_(function(d){return d.value})};$jscomp.Map.prototype.forEach=function(d,e){for(var k=$jscomp.makeIterator(this.entries()),b=k.next();!b.done;b=k.next())b=b.value,d.call(e,b[1],b[0],this)};
$jscomp.Map.prototype.iter_=function(d){var e=this,k=this.head_;$jscomp.initSymbol();$jscomp.initSymbolIterator();var b={};return b.next=function(){if(k){for(;k.head!=e.head_;)k=k.previous;for(;k.next!=k.head;)return k=k.next,{done:!1,value:d(k)};k=null}return{done:!0,value:void 0}},b[Symbol.iterator]=function(){return this},b};$jscomp.Map.index_=0;$jscomp.Map.defineProperty_=Object.defineProperty?function(d,e,k){Object.defineProperty(d,e,{value:String(k)})}:function(d,e,k){d[e]=String(k)};
$jscomp.Map.Entry_=function(){};$jscomp.Map.ASSUME_NO_NATIVE=!1;$jscomp.Map$install=function(){$jscomp.initSymbol();$jscomp.initSymbolIterator();!$jscomp.Map.ASSUME_NO_NATIVE&&$jscomp.Map.checkBrowserConformance_()?$jscomp.Map=$jscomp.global.Map:($jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Map.prototype[Symbol.iterator]=$jscomp.Map.prototype.entries,$jscomp.initSymbol(),$jscomp.Map.key_=Symbol("map-id-key"));$jscomp.Map$install=function(){}};$jscomp.math=$jscomp.math||{};
$jscomp.math.clz32=function(d){d=Number(d)>>>0;if(0===d)return 32;var e=0;0===(d&4294901760)&&(d<<=16,e+=16);0===(d&4278190080)&&(d<<=8,e+=8);0===(d&4026531840)&&(d<<=4,e+=4);0===(d&3221225472)&&(d<<=2,e+=2);0===(d&2147483648)&&e++;return e};$jscomp.math.imul=function(d,e){d=Number(d);e=Number(e);var k=d&65535,b=e&65535;return k*b+((d>>>16&65535)*b+k*(e>>>16&65535)<<16>>>0)|0};$jscomp.math.sign=function(d){d=Number(d);return 0===d||isNaN(d)?d:0<d?1:-1};
$jscomp.math.log10=function(d){return Math.log(d)/Math.LN10};$jscomp.math.log2=function(d){return Math.log(d)/Math.LN2};$jscomp.math.log1p=function(d){d=Number(d);if(.25>d&&-.25<d){for(var e=d,k=1,b=d,a=0,c=1;a!=b;)e*=d,c*=-1,b=(a=b)+c*e/++k;return b}return Math.log(1+d)};$jscomp.math.expm1=function(d){d=Number(d);if(.25>d&&-.25<d){for(var e=d,k=1,b=d,a=0;a!=b;)e*=d/++k,b=(a=b)+e;return b}return Math.exp(d)-1};$jscomp.math.cosh=function(d){d=Number(d);return(Math.exp(d)+Math.exp(-d))/2};
$jscomp.math.sinh=function(d){d=Number(d);return 0===d?d:(Math.exp(d)-Math.exp(-d))/2};$jscomp.math.tanh=function(d){d=Number(d);if(0===d)return d;var e=Math.exp(2*-Math.abs(d)),e=(1-e)/(1+e);return 0>d?-e:e};$jscomp.math.acosh=function(d){d=Number(d);return Math.log(d+Math.sqrt(d*d-1))};$jscomp.math.asinh=function(d){d=Number(d);if(0===d)return d;var e=Math.log(Math.abs(d)+Math.sqrt(d*d+1));return 0>d?-e:e};
$jscomp.math.atanh=function(d){d=Number(d);return($jscomp.math.log1p(d)-$jscomp.math.log1p(-d))/2};
$jscomp.math.hypot=function(d,e,k){for(var b=[],a=2;a<arguments.length;++a)b[a-2]=arguments[a];d=Number(d);e=Number(e);for(var c=Math.max(Math.abs(d),Math.abs(e)),I=$jscomp.makeIterator(b),a=I.next();!a.done;a=I.next())c=Math.max(c,Math.abs(a.value));if(1E100<c||1E-100>c){d/=c;e/=c;I=d*d+e*e;b=$jscomp.makeIterator(b);for(a=b.next();!a.done;a=b.next())a=a.value,a=Number(a)/c,I+=a*a;return Math.sqrt(I)*c}c=d*d+e*e;b=$jscomp.makeIterator(b);for(a=b.next();!a.done;a=b.next())a=a.value,a=Number(a),c+=
a*a;return Math.sqrt(c)};$jscomp.math.trunc=function(d){d=Number(d);if(isNaN(d)||Infinity===d||-Infinity===d||0===d)return d;var e=Math.floor(Math.abs(d));return 0>d?-e:e};$jscomp.math.cbrt=function(d){if(0===d)return d;d=Number(d);var e=Math.pow(Math.abs(d),1/3);return 0>d?-e:e};$jscomp.number=$jscomp.number||{};$jscomp.number.isFinite=function(d){return"number"!==typeof d?!1:!isNaN(d)&&Infinity!==d&&-Infinity!==d};
$jscomp.number.isInteger=function(d){return $jscomp.number.isFinite(d)?d===Math.floor(d):!1};$jscomp.number.isNaN=function(d){return"number"===typeof d&&isNaN(d)};$jscomp.number.isSafeInteger=function(d){return $jscomp.number.isInteger(d)&&Math.abs(d)<=$jscomp.number.MAX_SAFE_INTEGER};$jscomp.number.EPSILON=Math.pow(2,-52);$jscomp.number.MAX_SAFE_INTEGER=9007199254740991;$jscomp.number.MIN_SAFE_INTEGER=-9007199254740991;$jscomp.object=$jscomp.object||{};
$jscomp.object.assign=function(d,e){for(var k=[],b=1;b<arguments.length;++b)k[b-1]=arguments[b];k=$jscomp.makeIterator(k);for(b=k.next();!b.done;b=k.next())if(b=b.value)for(var a in b)Object.prototype.hasOwnProperty.call(b,a)&&(d[a]=b[a]);return d};$jscomp.object.is=function(d,e){return d===e?0!==d||1/d===1/e:d!==d&&e!==e};$jscomp.Set=function(d){d=void 0===d?[]:d;this.map_=new $jscomp.Map;if(d){d=$jscomp.makeIterator(d);for(var e=d.next();!e.done;e=d.next())this.add(e.value)}this.size=this.map_.size};
$jscomp.Set.checkBrowserConformance_=function(){var d=$jscomp.global.Set;if(!d||!d.prototype.entries||!Object.seal)return!1;var e=Object.seal({x:4}),d=new d($jscomp.makeIterator([e]));if(d.has(e)||1!=d.size||d.add(e)!=d||1!=d.size||d.add({x:4})!=d||2!=d.size)return!1;var d=d.entries(),k=d.next();if(k.done||k.value[0]!=e||k.value[1]!=e)return!1;k=d.next();return k.done||k.value[0]==e||4!=k.value[0].x||k.value[1]!=k.value[0]?!1:d.next().done};
$jscomp.Set.prototype.add=function(d){this.map_.set(d,d);this.size=this.map_.size;return this};$jscomp.Set.prototype["delete"]=function(d){d=this.map_["delete"](d);this.size=this.map_.size;return d};$jscomp.Set.prototype.clear=function(){this.map_.clear();this.size=0};$jscomp.Set.prototype.has=function(d){return this.map_.has(d)};$jscomp.Set.prototype.entries=function(){return this.map_.entries()};$jscomp.Set.prototype.values=function(){return this.map_.values()};
$jscomp.Set.prototype.forEach=function(d,e){var k=this;this.map_.forEach(function(b){return d.call(e,b,b,k)})};$jscomp.Set.ASSUME_NO_NATIVE=!1;$jscomp.Set$install=function(){!$jscomp.Set.ASSUME_NO_NATIVE&&$jscomp.Set.checkBrowserConformance_()?$jscomp.Set=$jscomp.global.Set:($jscomp.Map$install(),$jscomp.initSymbol(),$jscomp.initSymbolIterator(),$jscomp.Set.prototype[Symbol.iterator]=$jscomp.Set.prototype.values);$jscomp.Set$install=function(){}};$jscomp.string=$jscomp.string||{};
$jscomp.string.noRegExp_=function(d,e){if(d instanceof RegExp)throw new TypeError("First argument to String.prototype."+e+" must not be a regular expression");};
$jscomp.string.fromCodePoint=function(d){for(var e=[],k=0;k<arguments.length;++k)e[k-0]=arguments[k];for(var k="",e=$jscomp.makeIterator(e),b=e.next();!b.done;b=e.next()){b=b.value;b=+b;if(0>b||1114111<b||b!==Math.floor(b))throw new RangeError("invalid_code_point "+b);65535>=b?k+=String.fromCharCode(b):(b-=65536,k+=String.fromCharCode(b>>>10&1023|55296),k+=String.fromCharCode(b&1023|56320))}return k};
$jscomp.string.repeat=function(d){var e=this.toString();if(0>d||1342177279<d)throw new RangeError("Invalid count value");d|=0;for(var k="";d;)if(d&1&&(k+=e),d>>>=1)e+=e;return k};$jscomp.string.repeat$install=function(){String.prototype.repeat||(String.prototype.repeat=$jscomp.string.repeat)};
$jscomp.string.codePointAt=function(d){var e=this.toString(),k=e.length;d=Number(d)||0;if(0<=d&&d<k){d|=0;var b=e.charCodeAt(d);if(55296>b||56319<b||d+1===k)return b;d=e.charCodeAt(d+1);return 56320>d||57343<d?b:1024*(b-55296)+d+9216}};$jscomp.string.codePointAt$install=function(){String.prototype.codePointAt||(String.prototype.codePointAt=$jscomp.string.codePointAt)};
$jscomp.string.includes=function(d,e){e=void 0===e?0:e;$jscomp.string.noRegExp_(d,"includes");return-1!==this.toString().indexOf(d,e)};$jscomp.string.includes$install=function(){String.prototype.includes||(String.prototype.includes=$jscomp.string.includes)};
$jscomp.string.startsWith=function(d,e){e=void 0===e?0:e;$jscomp.string.noRegExp_(d,"startsWith");var k=this.toString();d+="";for(var b=k.length,a=d.length,c=Math.max(0,Math.min(e|0,k.length)),I=0;I<a&&c<b;)if(k[c++]!=d[I++])return!1;return I>=a};$jscomp.string.startsWith$install=function(){String.prototype.startsWith||(String.prototype.startsWith=$jscomp.string.startsWith)};
$jscomp.string.endsWith=function(d,e){$jscomp.string.noRegExp_(d,"endsWith");var k=this.toString();d+="";void 0===e&&(e=k.length);for(var b=Math.max(0,Math.min(e|0,k.length)),a=d.length;0<a&&0<b;)if(k[--b]!=d[--a])return!1;return 0>=a};$jscomp.string.endsWith$install=function(){String.prototype.endsWith||(String.prototype.endsWith=$jscomp.string.endsWith)};
(function(d,e){"object"===typeof exports&&"object"===typeof module?module.exports=e():"function"===typeof define&&define.amd?define([],e):"object"===typeof exports?exports.CitrixWebRTC=e():d.CitrixWebRTC=e()})(self,function(){return function(){function d(b){var a=k[b];if(void 0!==a)return a.exports;a=k[b]={exports:{}};e[b].call(a.exports,a,a.exports,d);return a.exports}var e={945:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof
Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();Object.defineProperty(a,"__esModule",{value:!0});var n=c(658),E=c(550),m=c(851),p=c(946);b=function(a){function b(){var c=a.call(this,null,E.class_id_t.AudioElement,0,n.ProxyMode.Local)||this;c.sinkId_="";c.srcObject_=null;return c}d(b,a);b.prototype.setSinkId=
function(a){var b=this;m.logger.log(this.user_friendly_id()+".setSinkId: set sinkId to "+a);return new Promise(function(c,d){b.waitUntilConnected("AudioElement.sinkId").then(function(){var d=b.remoteInvoke(!0,E.method_id_AudioElement_t.sinkId,a);p.getRedirector().getFeatureValue(E.FEATURE_ms_teams_pstn)||(b.sinkId_=a,c());return d}).then(function(){m.logger.log(b.user_friendly_id()+".setSinkId: success! resolving...");b.sinkId_=a;c()})["catch"](function(a){a=b.logRemoteInvokeError(a,".sinkId setter: failed to connect!");
d(a)})})};Object.defineProperty(b.prototype,"sinkId",{get:function(){return this.sinkId_},set:function(a){this.setSinkId(a)},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"srcObject",{get:function(){return this.srcObject_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".srcObject: set srcObject to "+JSON.stringify(a));if(a!==this.srcObject_){this.srcObject_=a;var c=null!==a&&void 0!==a?a.id:"null";this.waitUntilConnected("AudioElement.srcObject").then(function(){return b.remoteInvoke(!0,
E.method_id_AudioElement_t.srcObject,c)}).then(function(){m.logger.log(b.user_friendly_id()+".srcObject setter: remote success!")})["catch"](function(a){b.logRemoteInvokeError(a,".srcObject setter: failed to connect!")})}},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"src",{get:function(){return this.src_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".src: set src to "+a);this.src_=a;this.waitUntilConnected("AudioElement.src").then(function(){b.remoteInvoke(!0,
E.method_id_AudioElement_t.src,a)})["catch"](function(a){b.logRemoteInvokeError(a,".src setter: failed to connect!")})},enumerable:!0,configurable:!0});b.prototype.play=function(){var a=this;m.logger.log(this.user_friendly_id()+".play() called.");return new Promise(function(b,c){a.toggleAudio(!0);a.waitUntilConnected("AudioElement.play").then(function(){a.remoteInvoke(!1,E.method_id_AudioElement_t.play,[]).then(function(){b()})["catch"](function(b){a.logRemoteInvokeError(b,".play: failed to remote!");
c()})})["catch"](function(b){a.logRemoteInvokeError(b,".play: failed to connect!");c()})})};b.prototype.pause=function(){var a=this;m.logger.log(this.user_friendly_id()+".pause() called.");return new Promise(function(b,c){a.toggleAudio(!1);a.waitUntilConnected("AudioElement.pause").then(function(){a.remoteInvoke(!1,E.method_id_AudioElement_t.pause,[]).then(function(){b()})["catch"](function(b){a.logRemoteInvokeError(b,".pause: failed to remote!");c()})})["catch"](function(b){a.logRemoteInvokeError(b,
".pause: failed to connect!");c()})})};b.prototype.toggleAudio=function(a){this.srcObject_&&(m.logger.log(this.user_friendly_id()+".toggleAudio() toggle audio tracks:"+a),this.srcObject_.toggleAudio(a))};b.prototype.dispose=function(){m.logger.log(this.user_friendly_id()+".dispose()");this.src_=this.sinkId_="";this.srcObject_=null;this.release()};return b}(n.ProxyObject);a.AudioElement=b},9:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof
Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();Object.defineProperty(a,"__esModule",{value:!0});var n=c(550),E=c(946),m=c(658),p=c(851);(function(a){a[a.Webrpc=0]="Webrpc";a[a.WebrtcCodecs=1]="WebrtcCodecs";a[a.Receiver=2]="Receiver";a[a.Vda=3]="Vda";a[a.Endpoint=4]="Endpoint";a[a.TypeScript=5]="TypeScript";
a[a.Max=6]="Max"})(a.VersionType||(a.VersionType={}));b=function(a){function b(){return a.call(this,null,n.class_id_t.EngineControl,0,m.ProxyMode.Local)||this}d(b,a);b.prototype.bind=function(){p.logger.log(this.user_friendly_id()+".bind() called.");this.reconstructor(null,n.class_id_t.EngineControl,0)};b.prototype.syncBarrier=function(){var a=this;p.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("EngineControl.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,
n.method_id_EngineControl_t.version,{major:0,minor:0,revision:0,build:0}),a.remoteInvoke(!1,n.method_id_EngineControl_t.feature_flags,[])])}).then(function(b){p.logger.log(a.user_friendly_id()+"received webrpc version and supported feature list.");b=b.map(function(b){return a.param0(b)});a.version_=b[0];a.features_=b[1];E.getRedirector().setFeatures(a.features_);b=[];for(var c=0,f=a.features_;c<f.length;c++){var d=f[c];"ms_teams_desktop_sharing"===d.name&&d.value?b.push(a.remoteInvoke(!1,n.method_id_EngineControl_t.version_info,
[])):"ms_teams_osinfo"===d.name&&d.value?b.push(a.remoteInvoke(!1,n.method_id_EngineControl_t.osinfo,{family:"",version:"",architecture:"",distro:"",edition:""})):"ms_teams_endpoint_id"===d.name&&d.value&&b.push(a.remoteInvoke(!1,n.method_id_EngineControl_t.endpoint_id,{machine_id:"",user_id:""}))}if(0<b.length)return Promise.all(b)}).then(function(c){if(void 0===c)p.logger.log(a.user_friendly_id()+"release-1905 client.");else{p.logger.log(a.user_friendly_id()+"release-1906 or later client: received detailed client version list.");
for(var d=0;d<c.length;d++){var f=c[d];f.hdr.proc.iid==n.class_id_t.EngineControl&&f.hdr.proc.methodid==n.method_id_EngineControl_t.version_info?a.versions_=a.param0(f):f.hdr.proc.iid==n.class_id_t.EngineControl&&f.hdr.proc.methodid==n.method_id_EngineControl_t.osinfo?a.osinfo_=a.param0(f):f.hdr.proc.iid==n.class_id_t.EngineControl&&f.hdr.proc.methodid==n.method_id_EngineControl_t.endpoint_id&&(a.endpointid_=a.param0(f))}}b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,"failure to retrieve version/feature related client info.");
c(b)})})};return b}(m.ProxyObject);a.EngineControl=b},368:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(851),n=c(946);b=function(){function a(){var b=this;this.running_=!1;this.elements_=[];this.clipRects=new Set;this.wheelEventHandler=function(a){setTimeout(function(){b.updateAll()},10)};this.keyupEventHandler=function(a){"Tab"!=a.code&&"ArrowUp"!=a.code&&"ArrowDown"!=a.code&&"ArrowLeft"!=a.code&&"ArrowRight"!=a.code&&"PageUp"!=a.code&&"PageDown"!=a.code&&"Home"!=a.code&&
"End"!=a.code||b.updateAll()};a.sendOverlayInfo();this.observer_=new MutationObserver(function(a){b.updateAll()})}a.sendOverlayInfo=function(){var a=window.getWindowHandleAsHex;if(void 0===a||null===a)d.logger.log("FrameTracker.sendOverlayInfo: getWindowHandle method is undefined or null");else{var b=n.getRedirector();Promise.all([a(),b.startRedirection(!1,"sendOverlayInfo")]).then(function(a){d.logger.log("FrameTracker.sendOverlayInfo: set window handle: "+a[0]);b.WSSendObject({v:"overlay",command:"window",
windowHandle:a[0]})})}};a.prototype.rectanglesIntersect=function(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y?!0:!1};a.prototype.intersectingRect=function(a,b){var c=Math.max(a.left,b.left),d=Math.max(a.top,b.top);return new DOMRect(c,d,Math.min(a.right,b.right)-c,Math.min(a.bottom,b.bottom)-d)};a.prototype.pedigreeCount=function(a,b){for(var c=0,d=a.parentElement;null!=d&&d!=b;)c++,d=d.parentElement;return{isAncestor:null!=d,pedigree:c}};a.prototype.selectTopmost=
function(a,b){var c=a.getBoundingClientRect(),d=b.getBoundingClientRect(),c=this.intersectingRect(c,d),d=document.elementFromPoint(c.left+c.width/2,c.top+c.height/2);if(d==a)return a;if(d==b)return b;c=this.pedigreeCount(a,d);d=this.pedigreeCount(b,d);if(c.isAncestor&&d.isAncestor){if(c.pedigree<d.pedigree)return a;if(d.pedigree<c.pedigree)return b}else{if(c.isAncestor)return a;if(d.isAncestor)return b}};a.prototype.checkOverlappingVideos=function(a){var b=this,c=a.target.getBoundingClientRect();
a.overlaps.forEach(function(b){a.target.remoteVideoElement.removeClipRect(b.rect)});a.overlaps=[];this.elements_.forEach(function(d){if(d!=a){var n=d.overlaps.map(function(a){return a.element}).indexOf(a.target);-1!=n&&(n=d.overlaps.splice(n,1)[0],d.target.remoteVideoElement.removeClipRect(n.rect));n=d.target.getBoundingClientRect();if(b.rectanglesIntersect(c,n)){var v=b.selectTopmost(a.target,d.target);v==a.target?(d.overlaps.push({element:a.target,rect:c}),d.target.remoteVideoElement.addClipRect(c)):
v==d.target&&(a.overlaps.push({element:d.target,rect:n}),a.target.remoteVideoElement.addClipRect(n))}}})};a.prototype.updateAll=function(){var a=this;this.elements_.forEach(function(b){var c=b.target.getBoundingClientRect();if(void 0!==c){var d=b.clientRect;if(void 0===d||d.x!==c.x||d.y!==c.y||d.width!==c.width||d.height!==c.height)b.clientRect=c,b.callback(c),a.checkOverlappingVideos(b)}})};a.prototype.track=function(a,b){var c=this,g=a.getBoundingClientRect();d.logger.log("Track element frame",
a,JSON.stringify(g));console.log(a);this.elements_.push({target:a,clientRect:void 0,callback:b,overlaps:[]});try{d.logger.log("[HdxWebRTC.js] Initializing occlusion for new videoElement"),this.clipRects.forEach(function(b){c.applyOcclusion(a,JSON.parse(b))})}catch(n){d.logger.log("[HdxWebRTC.js] addOcclusionInit failed! "+n)}this.running_||(d.logger.log("Start FrameTracker observer..."),this.observer_.observe(document.body,{attributes:!0,childList:!0,subtree:!0}),window.addEventListener("wheel",this.wheelEventHandler),
window.addEventListener("keyup",this.keyupEventHandler),this.running_=!0);this.updateAll()};a.prototype.untrack=function(a){d.logger.log("Untrack element frame",a);var b=-1;this.elements_.forEach(function(c,d){c.target===a&&(b=d)});0<=b&&(this.elements_.splice(b,1),0===this.elements_.length&&(d.logger.log("Stop FrameTracker observer..."),this.observer_.disconnect(),window.removeEventListener("wheel",this.wheelEventHandler),window.removeEventListener("keyup",this.keyupEventHandler),this.running_=!1))};
a.prototype.applyOcclusion=function(a,b){var c=a.getBoundingClientRect();this.rectanglesIntersect(b,c)&&void 0!==a.remoteVideoElement&&a.remoteVideoElement.addClipRect(b)};a.prototype.addOcclusion=function(a){var b=this;d.logger.log("[HdxWebRTC.js] Adding occlusion "+JSON.stringify(a));d.logger.log("[HdxWebRTC.js] Tracking '"+this.elements_.length+"' elements.");this.clipRects.add(JSON.stringify(a));this.elements_.forEach(function(c){b.applyOcclusion(c.target,a)})};a.prototype.removeOcclusion=function(a){d.logger.log("[HdxWebRTC.js] Removing occlusion "+
JSON.stringify(a));d.logger.log("[HdxWebRTC.js] Tracking '"+this.elements_.length+"' elements.");this.clipRects["delete"](JSON.stringify(a));this.elements_.forEach(function(b){void 0!==b.target.remoteVideoElement&&b.target.remoteVideoElement.removeClipRect(a)})};return a}();a.FrameTracker=b},247:function(b,a){Object.defineProperty(a,"__esModule",{value:!0});var c=function(){function a(b){this.parent_=this.object_=null;this.children_=[];this.object_=b}a.prototype.addChild=function(a){a.parent_!=this&&
(a.parent_=this,this.children_.push(a))};a.prototype.removeChild=function(a){var b=this.children_.indexOf(a);this.children_.splice(b,1);a.parent_=null};return a}(),d=function(){function a(){this.root_=new c(null)}a.prototype.trackObject=function(a,b){void 0===b&&(b=null);if(null===this.findNode(a,this.root_)){var d=this.findNode(b,this.root_),n=new c(a);d?d.addChild(n):this.root_.addChild(n)}};a.prototype.releaseObject=function(a){a=this.findNode(a,this.root_);if(null===a||a===this.root_)return!1;
this.destroyNodeObjectRecurse(a);a.parent_.removeChild(a);return!0};a.prototype.destroyNodeObjectRecurse=function(a){for(var b=0,c=a.children_;b<c.length;b++)this.destroyNodeObjectRecurse(c[b]);a.object_.destroy()};a.prototype.setParent=function(a,b){var c=this.findNode(a,this.root_);if(null===c)return!1;var d=this.findNode(b,this.root_);if(null===d)return!1;if(c.parent_===d)return!0;c.parent_.removeChild(c);d.addChild(c);return!0};a.prototype.reset=function(){this.root_.children_=[]};a.prototype.findNode=
function(a,b){if(b.object_===a)return b;for(var c=null,d=0,g=b.children_;d<g.length&&(c=this.findNode(a,g[d]),null===c);d++);return c};return a}();a.GC=d;a.gc=new d},946:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(658),n=c(851),E=c(550),m=c(545),p=c(394),l=c(509),g=function(){return function(a,b,c,d,g,n,t){this.resolve=a;this.reject=b;this.iid=c;this.oid=d;this.cbid=g;this.oneShot=n;this.mid=t}}(),e;(function(a){a[a.rpc_status_success=0]="rpc_status_success";a[a.rpc_status_unspecified_error=
1]="rpc_status_unspecified_error";a[a.rpc_status_unexpected=2]="rpc_status_unexpected";a[a.rpc_status_index_out_of_bounds=3]="rpc_status_index_out_of_bounds";a[a.rpc_status_missing_parameter=4]="rpc_status_missing_parameter";a[a.rpc_status_missing_return_value=5]="rpc_status_missing_return_value";a[a.rpc_status_invalid_object=6]="rpc_status_invalid_object";a[a.rpc_status_user_exception=7]="rpc_status_user_exception";a[a.rpc_status_system_error=8]="rpc_status_system_error"})(e=a.WebrpcStatusCode||
(a.WebrpcStatusCode={}));var v;(function(a){a[a.NotRedirected=0]="NotRedirected";a[a.Connecting=1]="Connecting";a[a.Binding=2]="Binding";a[a.Redirected=3]="Redirected"})(v=a.RedirectionStatus||(a.RedirectionStatus={}));b=function(){function a(){this.pingactive=!1;this.status=v.NotRedirected;this.reqs=[];this.cbs=[];this.deferredActions=[];this.telemetry_=new p.Telemetry;this.screenshare_=new l.ScreenShareUtil;this.stateChangeNotifcations=[];this.vdafeatures_=[]}Object.defineProperty(a.prototype,"telemetry",
{get:function(){return this.telemetry_},enumerable:!0,configurable:!0});Object.defineProperty(a.prototype,"screenshare",{get:function(){return this.screenshare_},enumerable:!0,configurable:!0});a.prototype.stopAppshare=function(){var a=window.stopAppshare;a&&a()};a.prototype.setRemoteSessionInfoCb=function(a){this.remoteSessionInfoCb=a};a.prototype.setFeatures=function(a){this.features=a;this.screenshare.onInitComplete()};a.prototype.getFeatureValue=function(a){var b=this.features.find(function(b){return b.name===
a});return void 0!==b?b.value:!1};a.prototype.onRedirectionComplete=function(){for(;this.deferredActions&&0<this.deferredActions.length;)this.deferredActions.shift().post(this.status==v.Redirected)};a.prototype.connectToService=function(){n.logger.log("Redirection status: Connecting...");this.status=v.Connecting;return new Promise(function(a,b){var c=new WebSocket("wss://127.0.0.1:9002");c.onopen=function(){a(c)};c.onerror=function(a){n.logger.log("websocket connection error: "+a.type);b(a)}})};a.prototype.waitUntilRedirected=
function(a){var b=this;return new Promise(function(c,d){b.status==v.Redirected?c():0>=a?d():setTimeout(function(){n.logger.log("waitUntilRedirected() timeout. count="+a);b.status!=v.Redirected?b.waitUntilRedirected(--a).then(function(){c()})["catch"](function(){d()}):c()},2E3)})};a.prototype.handleRemoteSessionInfo=function(){var a=this;n.logger.log("handleRemoteSessionInfo called.");var b=this;b.remoteSessionInfoCb?b.remoteSessionInfoCb().then(function(c){n.logger.log("remoteSessionInfo success! info:"+
JSON.stringify(c));n.logger.log("Redirection status: Redirected");b.status=v.Redirected;b.pingConnectionEnd();(0,window.onVdiClientConnected)();a.telemetry.SendTelemetryInit();b.onRedirectionComplete()})["catch"](function(){n.logger.log("remoteSessionInfo failure!");b.suspendRedirection(!0);b.onRedirectionComplete()}):(n.logger.log("remoteSessionInfoCb is invalid!"),b.suspendRedirection(!0),b.onRedirectionComplete())};a.prototype.startRedirection=function(a,b){var c=this,g=window.onVdiClientDisconnected;
return new Promise(function(t,z){c.status!=v.Redirected?(n.logger.log("Attempting to start redirection: "+b),!1===a?c.deferredActions.push(new d.deferred_action(t,z,b)):c.connectToService().then(function(a){n.logger.log("Redirection status: Binding...");c.status=v.Binding;c.websocket=a;c.websocket.onmessage=function(a){c.onWSMessage(a)};c.websocket.onclose=function(a){c.onWSClose(a)};t();c.handleRemoteSessionInfo()})["catch"](function(a){n.logger.log("Unable to connect to websocket service!");z();
c.suspendRedirection(!0);c.onRedirectionComplete();g(!0)})):(n.logger.log("Redirection already started."),t())})};a.prototype.suspendRedirection=function(a){var b=this;n.logger.log("Suspending redirection.");(0,window.onVdiClientDisconnected)(!1);var c=!1;a=window.getCitrixMSTeamsRedir;var d=window.getCitrixWebrtcRedir,g;a?g=a:d&&(g=d);g&&g().then(function(a){n.logger.log("sucesss on disconnect"+a);"1"==a&&(c=!0,n.logger.log("Reg key exists while disconnecting"));b.status===v.Redirected&&1==c&&(n.logger.log("Calling ping not normal disconnect"),
b.pingConnectionBegin(!1));n.logger.log("Redirection status: NotRedirected");b.status=v.NotRedirected})["catch"](function(){n.logger.log("Failure to Read MS Teams redir Reg Key, not retrying...")});this.dispatchStateChangeNotifications()};a.prototype.onWSOpen=function(){};a.prototype.onWSClose=function(a){n.logger.log("disconnected from websocket service.");try{this.suspendRedirection(!0)}catch(b){n.logger.log("suspendRedirection(): exception closing WebSocket: "+b.message)}};a.prototype.onWSError=
function(){try{this.suspendRedirection(!0)}catch(a){n.logger.log("suspendRedirection(): exception on WebSocket error: "+a.message)}};a.prototype.WSSendObjectWrapper=function(a,b,c,d){var g=!0;b!=E.class_id_t.EngineControl||c!=E.method_id_EngineControl_t.ctor&&c!=E.method_id_EngineControl_t.version&&c!=E.method_id_EngineControl_t.feature_flags||(g=!1);var t=!0;if(g&&(t=!1,void 0!=this.features))for(var g=0,r=this.features;g<r.length;g++){var q=r[g];if(!0===q.value&&q.name==a){t=!0;break}}return 1==
t?this.WSSendObject(d):Promise.reject("Cannot invoke method that is not supported by webrpc: iid("+b+") mid("+c+")")};a.prototype.WSSendObject=function(a){var b=this;return new Promise(function(c,d){if("webrtc"==a.v){var t=a.hdr.proc.iid,z=a.hdr.proc.methodid,r=a.objref.oid;a.hdr.destroy||(t=new g(c,d,t,r,0,!0,z),b.reqs.push(t));t=JSON.stringify(a);n.logger.trace("WSSendObject: >>> "+E.WebrpcClassLibInfoUtil.composeClassInfoData(a)+" "+t);try{b.websocket.send(t)}catch(q){n.logger.log("WSSendObject(): exception: "+
q.message),d(q.message)}}else if("overlay"==a.v){t=JSON.stringify(a);n.logger.log("HDXMS: SendOverlayData: >>> "+t+"'");try{b.websocket.send(t)}catch(q){n.logger.log("WSSendObject(): exception: "+q.message),d(q.message)}}else if("telemetry"==a.v){t=JSON.stringify(a);n.logger.log("HDXMS: SendTelemetryData: >>> "+t+"'");try{b.websocket.send(t)}catch(q){n.logger.log("WSSendObject(): exception: "+q.message),d(q.message)}}else if("appsharing"==a.v){t=JSON.stringify(a);n.logger.log("HDXMS: SendScreenSharingData: >>> "+
t+"'");try{b.websocket.send(t)}catch(q){n.logger.log("WSSendObject(): exception: "+q.message),d(q.message)}}else n.logger.log("HDXMS: Unknown protocol: '"+JSON.stringify(a)+"'")})};a.prototype.webrpcStatusCodeToName=function(a){switch(a){case e.rpc_status_success:a="rpc_status_success";break;case e.rpc_status_unspecified_error:a="rpc_status_unspecified_error";break;case e.rpc_status_unexpected:a="rpc_status_unexpected";break;case e.rpc_status_index_out_of_bounds:a="rpc_status_index_out_of_bounds";
break;case e.rpc_status_missing_parameter:a="rpc_status_missing_parameter";break;case e.rpc_status_missing_return_value:a="rpc_status_missing_return_value";break;case e.rpc_status_invalid_object:a="rpc_status_invalid_object";break;case e.rpc_status_user_exception:a="rpc_status_user_exception";break;case e.rpc_status_system_error:a="rpc_status_system_error";break;default:a="unknown"}return a};a.prototype.parceWebrpcError=function(a,b){void 0===a&&(a=b&&0<b.length?b[0].category||b[0].code||b[0].message?
e.rpc_status_system_error:e.rpc_status_user_exception:e.rpc_status_unspecified_error);var c;switch(a){case e.rpc_status_unspecified_error:case e.rpc_status_unexpected:case e.rpc_status_index_out_of_bounds:case e.rpc_status_missing_parameter:case e.rpc_status_missing_return_value:case e.rpc_status_invalid_object:c=new DOMException(this.webrpcStatusCodeToName(a),this.webrpcStatusCodeToName(a));break;case e.rpc_status_user_exception:c=b&&0<b.length?new DOMException(b[0],this.webrpcStatusCodeToName(a)):
new DOMException(this.webrpcStatusCodeToName(a),this.webrpcStatusCodeToName(a));break;case e.rpc_status_system_error:if(b&&0<b.length){c=Object.create(DOMException);var d={value:null,writable:!0,enumerable:!1,Configurable:!0};d.value=b[0].category;Object.defineProperty(c,"name",d);d.value=b[0].code;Object.defineProperty(c,"code",d);d.value=b[0].message;Object.defineProperty(c,"message",d)}else c=new DOMException(this.webrpcStatusCodeToName(a),this.webrpcStatusCodeToName(a))}return c};a.prototype.onWSMessage=
function(a){var b=a.data,c;try{c=JSON.parse(b)}catch(q){console.log("invalid JSON!!!");console.log(q);console.log(b);return}if("webrtc"==c.v){n.logger.trace("onWSMessage: <<< "+E.WebrpcClassLibInfoUtil.composeClassInfoData(c)+" "+b);var d=c.hdr.proc.iid,g=c.hdr.proc.methodid,t=c.objref.oid;a=c.status;if(c.hdr.msg_type==m.WsJsonUtil.getMsgType(m.ws_msg_type_t.reply))b=this.reqs.findIndex(function(a){return a.iid==d&&a.oid==t&&a.mid==g}),0<=b?0==a?this.reqs.splice(b,1).shift().resolve(c):(c=this.parceWebrpcError(a,
c.params),this.reqs.splice(b,1).shift().reject(c)):(n.logger.log("HDXMS didnt find this one. (reqs)"),n.logger.log(this.reqs));else if(c.hdr.msg_type==m.WsJsonUtil.getMsgType(m.ws_msg_type_t.event_req)){var r=c.func.id,b=this.cbs.findIndex(function(a){return a.iid==d&&a.oid==t&&a.cbid==r>>16});0<=b?(0==(r&65535)?this.cbs[b].resolve(c):(c=this.parceWebrpcError(a,c.params),this.cbs[b].reject(c)),1==this.cbs[b].oneShot&&this.cbs.splice(b,1)):(n.logger.log("HDXMS didnt find this one. (cbs)"),n.logger.log(this.cbs))}else n.logger.log("HDXMS Received bogus message: "+
b+"'")}else if("telemetry"==c.v)0==c.status&&(a=c.hdr.command,2==(a&2147483647)&&(b=c.hdr.id,this.telemetry.onInitialized(b),n.logger.log("Telemetry init response received")));else if("features"==c.v){a=c.features;if("feature-support"==c.command)for(n.logger.log("features capabilities received, features:"+a),this.vdafeatures_=a,b=0;b<a.length;b++)if(a[b]===E.FEATURE_vda_app_sharing)this.screenshare.onInitialized(!0);this.clientViewportMode_=c.client_viewport_mode;n.logger.log("features client_viewport_mode value: "+
this.clientViewportMode_)}else"appsharing"==c.v?(a=c.status,0==a?(a=c.hdr.command,b=c.hdr.id,(a&2147483647)==l.sshare_cmd.GetSources?(n.logger.log("appsharing GetSources response received"),this.screenshare.onGetSources(b,c.data)):(a&2147483647)==l.sshare_cmd.SetActive?(n.logger.log("appsharing SetActive response received"),this.screenshare.onSetActive(b,c.data)):(a&2147483647)==l.sshare_cmd.TopologyChanged?(n.logger.log("appsharing Window topology changed cmd received"),this.screenshare.onToplogyChanged()):
(n.logger.log("invalid command reply:"+a),this.screenshare.onError(b))):(n.logger.log("invalid status reply:"+a),b=c.hdr.id,this.screenshare.onError(b))):n.logger.log("HDXMS: Unknown protocol: "+b+"'")};a.prototype.clearReqs=function(){n.logger.log("clearReqs()");this.reqs.forEach(function(a,b){a.reject()});this.reqs=[]};a.prototype.registerHandler=function(a,b,c){a=new g(c.resolve.bind(c),c.reject.bind(c),a,b,c.id,c.oneShot,0);this.cbs.push(a)};a.prototype.unregisterHandler=function(a,b,c){var d=
this.cbs.findIndex(function(d){return d.iid==a&&d.oid==b&&d.cbid==c});0<=d?this.cbs.splice(d,1):(n.logger.log("HDXMS Didnt find this callback in the list!"),console.log(this.cbs))};a.prototype.isRedirected=function(){return this.status===v.Redirected||this.status===v.Binding||this.status===v.Connecting};a.prototype.isConnected=function(){return this.status==v.Redirected};a.prototype.isPingActive=function(){return this.pingactive};a.prototype.pingConnectionBegin=function(a){n.logger.log("Started timer");
this.pingactive=!0;var b=window.onVdiClientDisconnectedTimer;1==a?(n.logger.log("checking if we are connected..."),b()):this.conntimer=setTimeout(function(){n.logger.log("checking if we are connected...");b()},15E3)};a.prototype.pingConnectionEnd=function(){this.pingactive=!1;clearTimeout(this.conntimer)};a.prototype.SendTelemetryData_Speaker=function(a){this.telemetry.SendTelemetryData(p.tel_cmd.Data,p.tel_key_SpeakerDeviceUsed,a,0)};a.prototype.registerStateChangeNotification=function(a){this.stateChangeNotifcations.push(a)};
a.prototype.unregisterStateChangeNotification=function(a){this.stateChangeNotifcations=this.stateChangeNotifcations.filter(function(b){return b!=a})};a.prototype.dispatchStateChangeNotifications=function(){this.stateChangeNotifcations.forEach(function(a){a()})};a.prototype.vdabufferNoLimit=function(){for(var a=!1,b=0,c=this.vdafeatures_;b<c.length;b++)if(c[b]===E.FEATURE_vda_service_no_buffer_limit){a=!0;break}return a};Object.defineProperty(a.prototype,"clientViewportMode",{get:function(){return this.clientViewportMode_||
"unknown"},enumerable:!0,configurable:!0});return a}();a.HdxMediaStream=b;var t=new b;a.getRedirector=function(){return t}},985:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();
Object.defineProperty(a,"__esModule",{value:!0});var n=c(658),e=c(550),m=c(851);b=function(a){function b(c,d,n){for(var t=[],z=3;z<arguments.length;z++)t[z-3]=arguments[z];return a.apply(this,[c,e.class_id_t.RTCIceCandidate,d,n,null].concat(t))||this}d(b,a);Object.defineProperty(b.prototype,"candidate",{get:function(){return this.candidate_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"sdpMid",{get:function(){return this.sdpMid_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"sdpMLineIndex",{get:function(){return this.sdpMLineIndex_},enumerable:!0,configurable:!0});b.prototype.syncBarrier=function(){var a=this;m.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("IceCandidate.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,e.method_id_RTCIceCandidate_t.candidate,""),a.remoteInvoke(!1,e.method_id_RTCIceCandidate_t.sdpMid,""),a.remoteInvoke(!1,e.method_id_RTCIceCandidate_t.sdpMLineIndex,
0)])}).then(function(c){c=c.map(function(b){return a.param0(b)});a.candidate_=c[0];a.sdpMid_=c[1];a.sdpMLineIndex_=c[2];b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier failed!");c(b)})})};return b}(n.ProxyObject);a.IceCandidate=b;b=function(a){function b(c,d){return a.call(this,c,e.class_id_t.RTCIceCandidatePair,d,n.ProxyMode.Remote)||this}d(b,a);Object.defineProperty(b.prototype,"local",{get:function(){return this.local_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"remote",{get:function(){return this.remote_},enumerable:!0,configurable:!0});b.prototype.syncBarrier=function(){var a=this;m.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("IceCandidatePair.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,e.method_id_RTCIceCandidatePair_t.local,{}),a.remoteInvoke(!1,e.method_id_RTCIceCandidatePair_t.remote,{})])}).then(function(c){c=c.map(function(b){return a.param0(b)});a.local_=
c[0];a.remote_=c[1];b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier failed!");c(b)})})};return b}(n.ProxyObject);a.IceCandidatePair=b},851:function(b,a){Object.defineProperty(a,"__esModule",{value:!0});var c=function(){function a(b){this.tracing=!1;this.mslogger_=void 0;this.tag=b;this.enabled=!0}a.prototype.setMSLogger=function(a){this.mslogger_=a};a.prototype.log=function(){for(var a=[],b=0;b<arguments.length;b++)a[b]=arguments[b];this.enabled&&(void 0!=this.mslogger_?this.mslogger_.info(this.tag+
" "+a):console.log(this.tag+" "+a))};a.prototype.trace=function(){for(var a=[],b=0;b<arguments.length;b++)a[b]=arguments[b];this.tracing&&this.log.apply(this,a)};return a}();a.Logger=c;a.logger=new c("[HdxWebRTC.js]");a.logger.enabled=!0},360:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var h in b)b.hasOwnProperty(h)&&(a[h]=b[h])};return a(b,c)};return function(b,
c){function q(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(q.prototype=c.prototype,new q)}}(),n=this&&this.__awaiter||function(a,b,c,q){return new (c||(c=Promise))(function(d,f){function w(a){try{y(q.next(a))}catch(b){f(b)}}function r(a){try{y(q["throw"](a))}catch(b){f(b)}}function y(a){a.done?d(a.value):(new c(function(b){b(a.value)})).then(w,r)}y((q=q.apply(a,b||[])).next())})},e=this&&this.__generator||function(a,b){function c(a){return function(b){return q([a,b])}}function q(c){if(f)throw new TypeError("Generator is already executing.");
for(;d;)try{if(f=1,w&&(r=c[0]&2?w["return"]:c[0]?w["throw"]||((r=w["return"])&&r.call(w),0):w.next)&&!(r=r.call(w,c[1])).done)return r;if(w=0,r)c=[c[0]&2,r.value];switch(c[0]){case 0:case 1:r=c;break;case 4:return d.label++,{value:c[1],done:!1};case 5:d.label++;w=c[1];c=[0];continue;case 7:c=d.ops.pop();d.trys.pop();continue;default:if(!(r=d.trys,r=0<r.length&&r[r.length-1])&&(6===c[0]||2===c[0])){d=0;continue}if(3===c[0]&&(!r||c[1]>r[0]&&c[1]<r[3]))d.label=c[1];else if(6===c[0]&&d.label<r[1])d.label=
r[1],r=c;else if(r&&d.label<r[2])d.label=r[2],d.ops.push(c);else{r[2]&&d.ops.pop();d.trys.pop();continue}}c=b.call(a,d)}catch(J){c=[6,J],w=0}finally{f=r=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}var d={label:0,sent:function(){if(r[0]&1)throw r[1];return r[1]},trys:[],ops:[]},f,w,r,y;$jscomp.initSymbol();$jscomp.initSymbol();$jscomp.initSymbolIterator();return y={next:c(0),"throw":c(1),"return":c(2)},"function"===typeof Symbol&&(y[Symbol.iterator]=function(){return this}),y};Object.defineProperty(a,
"__esModule",{value:!0});var m=c(946),p=c(144),l=c(589),g=c(658),k=c(985),v=c(377),t=c(650),z=c(24),u=c(550),f=c(851),A=c(517),x=c(394),D=function(a){function b(h,c,q){h=a.call(this,h,u.class_id_t.RTCIceCandidateEvent,c,g.ProxyMode.Remote)||this;h.target=q;h.type="icecandidate";return h}d(b,a);Object.defineProperty(b.prototype,"candidate",{get:function(){return this.candidate_},enumerable:!0,configurable:!0});b.prototype.syncBarrier=function(){var a=this;f.logger.log(this.user_friendly_id()+".syncBarrier() called.");
return new Promise(function(b,h){a.waitUntilConnected(a.user_friendly_id()+".syncBarrier").then(function(){return a.remoteInvoke(!1,u.method_id_RTCIceCandidateEvent_t.candidate,{oid:0})}).then(function(b){b=a.param0(b);return!1===b.is_null?(new k.IceCandidate(a,b.oid,g.ProxyMode.Remote)).syncBarrier():Promise.resolve(null)}).then(function(h){f.logger.log(a.user_friendly_id()+".onicecandidate: icecandidate available!");a.candidate_=h;b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".onicecandidate() failed!");
h(b)})})};return b}(g.ProxyObject);a.IceCandidateEvent=D;var C=function(){function a(b){this.state_="new";this.candidates_=[];this.pc_=b}a.prototype.pushState=function(a){f.logger.log(this.pc_.user_friendly_id()+".onicegatheringstatechange: new state is "+a);this.state_=a;"gathering"==this.state_?(this.candidates_=[],this.postUpdate()):this.processRemaining()};a.prototype.addIceCandidate=function(a){var b=this;this.candidates_.push(a);a.syncBarrier().then(function(a){f.logger.log(b.pc_.user_friendly_id()+
".onicecandidate: icecandidate available!");return Promise.all([b.pc_.updateSdpDescription(!0),Promise.resolve(a)])}).then(function(a){b.postIceCandidate(a[1])})};a.prototype.postIceCandidate=function(a){f.logger.log(this.pc_.user_friendly_id()+".onicecandidate: posting ice candidate now!");if(null!=this.pc_.onicecandidate)this.pc_.onicecandidate(a);else f.logger.log(this.pc_.user_friendly_id()+"onicecandidate is NULL!!!");this.candidates_.shift();this.processRemaining()};a.prototype.postUpdate=function(){f.logger.log(this.pc_.user_friendly_id()+
".onicegatheringstatechange: posting event now!");var a=new w("onicegatheringstatechange",this.pc_);this.pc_.onicegatheringstatechange(a)};a.prototype.processRemaining=function(){0==this.candidates_.length&&"complete"==this.state_?(this.pc_.onicecandidate({candidate:null,target:this}),this.postUpdate()):f.logger.log(this.pc_.user_friendly_id()+".onicecandidate: candidates remaining=["+this.candidates_.map(function(a){return a.object_id()})+"], state="+this.state_)};return a}(),r=function(){return function(a,
b){this.sdp=b;this.type=a}}();a.SessionDescriptionInit=r;var q=function(a){function b(h,c,q){for(var d=[],w=3;w<arguments.length;w++)d[w-3]=arguments[w];return a.apply(this,[h,u.class_id_t.RTCSessionDescription,c,q,null].concat(d))||this}d(b,a);b.prototype.toJSON=function(){return{type:this.type_,sdp:this.sdp_}};Object.defineProperty(b.prototype,"sdp",{get:function(){return this.sdp_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"type",{get:function(){return this.type_},enumerable:!0,
configurable:!0});b.prototype.syncBarrier=function(){var a=this;f.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,h){a.waitUntilConnected(a.user_friendly_id()+".syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,u.method_id_RTCSessionDescription_t.type,0),a.remoteInvoke(!1,u.method_id_RTCSessionDescription_t.sdp,"")])}).then(function(h){a.type_=a.convertType(a.param0(h[0]));a.sdp_=a.param0(h[1]);b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,
".syncBarrier() failed!");h(b)})})};b.prototype.convertType=function(a){return 0==a?"offer":1==a?"pranswer":2==a?"answer":"rollback"};b.convertC2H=function(a){return"offer"==a?0:"pranswer"==a?1:"answer"==a?2:3};return b}(g.ProxyObject);a.SessionDescription=q;var w=function(){return function(a,b){this.type=a;this.target=b}}(),B=function(){return function(){}}(),y=function(){function a(b,c){this.local=b;this.remote=c}Object.defineProperty(a.prototype,"active",{get:function(){var a=!1;if(1==this.local||
1==this.remote)a=!0;return a},enumerable:!0,configurable:!0});return a}();b=function(a){function b(c){var h=a.call(this,null,u.class_id_t.RTCPeerConnection,0,g.ProxyMode.Local,null,void 0!=c?c:{},{})||this;h.timeerstarted_=!1;h.firsttimeremoteoffer_=!1;h.firststable_=!1;h.firsttimelocaloffer_=!1;h.audiocall_=new y(!1,!1);h.videocall_=new y(!1,!1);h.screensharingcall_=new y(!1,!1);h.conferencecall_=!1;h.incomingcall_=!1;h.outgoingcall_=!1;c&&c.sdpSemantics&&(h.sdpSemantics_=c.sdpSemantics);f.logger.log(h.user_friendly_id()+
".constructor sdpSemantics="+h.sdpSemantics_);if(!u.BUILD_TYPE_SDK&&h.isUnified()&&!m.getRedirector().getFeatureValue(u.FEATURE_ms_teams_webrtc_1dot0))throw new DOMException("CWA client does not support unified sdpSemantic","createPeerConnection");h.pendingtransceiver_=!1;h.deferredOfferAnswers=[];h.localStreams=[];h.remoteStreams=[];h.onaddstream_=null;h.signalingState_="stable";h.iceConnectionState_="new";h.iceGatheringState_="new";h.iceQ_=new C(h);h.receivers_=[];h.senders_=[];h.transceivers_=
[];h.registerStateChangeNotification(h.onStateChange);h.localdatachannel_=null;h.remotedatachannel_=null;return h}d(b,a);b.prototype.dumpSdp=function(a){f.logger.log(this.user_friendly_id()+".dumpSdp");a&&(f.logger.log(this.user_friendly_id()+"  -- type: "+a.type),f.logger.log(this.user_friendly_id()+"  -- sdp: "+a.sdp))};Object.defineProperty(b.prototype,"localDescription",{get:function(){f.logger.log(this.user_friendly_id()+".get_localDescription() called.");return this.localDescription_},set:function(a){f.logger.log(this.user_friendly_id()+
".set_localDescription() called.");this.localDescription_=a},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"remoteDescription",{get:function(){f.logger.log(this.user_friendly_id()+".get_remoteDescription() called.");return this.remoteDescription_},set:function(a){f.logger.log(this.user_friendly_id()+".get_remoteDescription() called.");this.remoteDescription_=a},enumerable:!0,configurable:!0});b.prototype.isUnified=function(){return"unified"==this.sdpSemantics_||"unified-plan"==
this.sdpSemantics_};b.prototype.onStateChange=function(){var a=new w("iceconnectionstatechange",this);if(this.oniceconnectionstatechange_)this.oniceconnectionstatechange_(a)};b.prototype.addIceCandidate=function(a){var b=this;f.logger.log(this.user_friendly_id()+".addIceCandidate() called.");this.waitUntilConnected(this.user_friendly_id()+".addIceCandidate").then(function(){var c={candidate:a.candidate,sdpMid:a.sdpMid,sdpMLineIndex:a.sdpMLineIndex};if(void 0==c.candidate||null==c.candidate)c.candidate=
"";void 0==c.sdpMid&&(c.sdpMid=null);void 0==c.sdpMLineIndex&&(c.sdpMLineIndex=null);return(new k.IceCandidate(b,0,g.ProxyMode.Local,c)).syncBarrier()}).then(function(a){return b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.addIceCandidate,{oid:a.object_id()},{})}).then(function(){f.logger.log(b.user_friendly_id()+".addIceCandidate() success.");return b.updateSdpDescription(!1)}).then(function(){f.logger.log(b.user_friendly_id()+".addIceCandidate() - sync remote sdp success.")})["catch"](function(a){b.logRemoteInvokeError(a,
".addIceCandidate() failed!")})};Object.defineProperty(b.prototype,"onicecandidate",{get:function(){return this.onicecandidate_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onicecandidate() called.");this.onicecandidate_=a;this.waitUntilConnected(this.user_friendly_id()+".onicecandidate").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onicecandidate);c.then(function(a){f.logger.log(b.user_friendly_id()+".onicecandidate callback received!!!");
a=new D(b,b.param0(a).oid,b);null!=b.iceQ_&&b.iceQ_.addIceCandidate(a)});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onicecandidate,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onicecandidate() failed!")})},enumerable:!0,configurable:!0});b.prototype.convertIceConnectionState=function(a){return 0==a?"new":1==a?"checking":2==a?"connected":3==a?"completed":4==a?"failed":5==a?"disconnected":"closed"};b.prototype.convertConnectionState=function(a){if(0!=a){if(1==a)return"connecting";
if(2==a)return"connected";if(3==a)return"disconnected";if(4==a)return"failed";if(5==a)return"closed"}return"new"};Object.defineProperty(b.prototype,"onconnectionstatechange",{get:function(){return this.onconnectionstatechange_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onconnectionstatechange() called.");this.onconnectionstatechange_=a;this.waitUntilConnected(this.user_friendly_id()+".onconnectionstatechange").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),
u.method_id_RTCPeerConnection_t.onconnectionstatechange);c.then(function(a){f.logger.log(b.user_friendly_id()+".onconnectionstatechange(): success callback received!!!");b.connectionState_=b.convertConnectionState(b.param0(a));f.logger.log(b.user_friendly_id()+" connectionState=:"+b.connectionState_);a=new w("connectionstatechange",b);b.onconnectionstatechange_(a)});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onconnectionstatechange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,
".set_onconnectionstatechange() failed!")})},enumerable:!0,configurable:!0});b.prototype.get_connectionState=function(){f.logger.log(this.user_friendly_id()+".get_connectionState() called, value = "+this.connectionState_);return this.isRedirected()?this.connectionState_:"failed"};Object.defineProperty(b.prototype,"oniceconnectionstatechange",{get:function(){return this.oniceconnectionstatechange_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_oniceconnectionstatechange() called.");
this.oniceconnectionstatechange_=a;this.waitUntilConnected(this.user_friendly_id()+".oniceconnectionstatechange").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.oniceconnectionstatechange);c.then(function(a){f.logger.log(b.user_friendly_id()+".oniceconnectionstatechange(): success callback received!!!");b.iceConnectionState_=b.convertIceConnectionState(b.param0(a));a=new w("iceconnectionstatechange",b);b.oniceconnectionstatechange_(a)});return b.remoteInvoke(!0,
u.method_id_RTCPeerConnection_t.oniceconnectionstatechange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_oniceconnectionstatechange() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"iceConnectionState",{get:function(){f.logger.log(this.user_friendly_id()+".get_iceConnectionState() called, value = "+this.iceConnectionState_);return this.isRedirected()?this.iceConnectionState_:"failed"},enumerable:!0,configurable:!0});b.prototype.convertIceGatheringState=
function(a){return 0==a?"new":1==a?"gathering":"complete"};Object.defineProperty(b.prototype,"onicegatheringstatechange",{get:function(){return this.onicegatheringstatechange_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onicegatheringstatechange() called.");this.onicegatheringstatechange_=a;this.waitUntilConnected(this.user_friendly_id()+".onicegatheringstatechange").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onicegatheringstatechange);
c.then(function(a){f.logger.log(b.user_friendly_id()+".onicegatheringstatechange(): callback received!!!");b.iceGatheringState_=b.convertIceGatheringState(b.param0(a));null!=b.iceQ_&&b.iceQ_.pushState(b.iceGatheringState_)});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onicegatheringstatechange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onicegatheringstatechange() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"iceGatheringState",{get:function(){f.logger.log(this.user_friendly_id()+
".get_iceGatheringState() called, value = "+this.iceGatheringState_);return this.iceGatheringState_},enumerable:!0,configurable:!0});b.prototype.convertSignalState=function(a){return 0==a?"stable":1==a?"have-local-offer":2==a?"have-local-pranswer":3==a?"have-remote-offer":4==a?"have-remote-pranswer":"closed"};b.prototype.TelemtryReadings_=function(){"have-local-offer"==this.signalingState_&&0==this.firsttimelocaloffer_&&0==this.firsttimeremoteoffer_&&(this.outgoingcallstart_=(new Date).getTime(),
0==this.outgoingcall_&&(this.SendTelemetryData(x.tel_key_PerfCallState,x.tel_CallState.active,1),this.SendTelemetryData(x.tel_key_PerfCallDirection,x.tel_CallDirection.outgoing,1),this.outgoingcall_=!0),this.firsttimelocaloffer_=!0);"have-remote-offer"==this.signalingState_&&0==this.firsttimeremoteoffer_&&0==this.firsttimelocaloffer_&&(this.incomingcallstart_=(new Date).getTime(),0==this.incomingcall_&&(this.SendTelemetryData(x.tel_key_PerfCallState,x.tel_CallState.active,1),this.SendTelemetryData(x.tel_key_PerfCallDirection,
x.tel_CallDirection.incoming,1),this.incomingcall_=!0),this.firsttimeremoteoffer_=!0);"stable"==this.signalingState_&&0==this.firststable_&&(this.callstartTime_=(new Date).getTime(),this.firststable_=this.timeerstarted_=!0);if("stable"==this.signalingState_){for(var a=0,b=this.localStreams;a<b.length;a++){var c=b[a];1<=c.getAudioTracks().length&&0==this.audiocall_.local&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.audio,1),this.audiocall_.local=!0);c=c.getVideoTracks();if(1<=c.length)for(var h=
0,q=c;h<q.length;h++)c=q[h],1==c.getSettings().deviceId.includes("display")?0==this.screensharingcall_.local&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.dshare,1),this.screensharingcall_.local=!0):0==this.videocall_.local&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.video,1),this.videocall_.local=!0)}a=0;for(b=this.remoteStreams;a<b.length;a++)if(c=b[a],1<=c.getAudioTracks().length&&0==this.audiocall_.remote&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.audio,
1),this.audiocall_.remote=!0),h=c.getVideoTracks(),1<=h.length)for(c=0;c<h.length;c++)1==h[c].id.includes("applicationsharingVideo")?0==this.screensharingcall_.remote&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.dshare,1),this.screensharingcall_.remote=!0):0==this.videocall_.remote&&(this.SendTelemetryData(x.tel_key_PerfCallType,x.tel_CallType.video,1),this.videocall_.remote=!0);2<this.getReceivers().length&&0==this.conferencecall_&&(this.SendTelemetryData(x.tel_key_PerfCallType,
x.tel_CallType.multi,1),this.conferencecall_=!0)}};Object.defineProperty(b.prototype,"onsignalingstatechange",{set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onsignalingstatechange() called.");this.onsignalingstatechange_=a;this.waitUntilConnected(this.user_friendly_id()+".onsignalingstatechanged").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onsignalingstatechange);c.then(function(a){f.logger.log(b.user_friendly_id()+".onsignalingstatechange(): callback received!!!");
b.signalingState_=b.convertSignalState(b.param0(a));a=new w("onsignalingstatechange",b);b.onsignalingstatechange_(a);b.TelemtryReadings_()});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onsignalingstatechange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onsignalingstatechange() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onsignalingstatechanged",{get:function(){return this.onsignalingstatechange_},enumerable:!0,configurable:!0});
Object.defineProperty(b.prototype,"ontrack",{get:function(){return this.ontrack_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_ontrack() called.");this.ontrack_=a;this.waitUntilConnected(this.user_friendly_id()+".ontrack").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.ontrack);c.then(function(a){return n(b,void 0,void 0,function(){var b,c,h,q,d,w,J,F,r,K,y,z=this;return e(this,function(n){f.logger.log(this.user_friendly_id()+
".ontrack(): callback received!!!");b=new B;c=[];h=this.param0(a);void 0!=h.track&&!1===h.track.is_null&&(f.logger.log(this.user_friendly_id()+" adding a RemoteMediaTrack with oid:"+h.track.oid),q=new p.RemoteMediaTrack(this,h.track.oid),c.push(q.syncBarrier()));b.track=q;void 0!=h.receiver&&!1===h.receiver.is_null&&(d=this.receivers_.find(function(a){return a.object_id()===h.receiver.oid}),void 0===d&&(f.logger.log(this.user_friendly_id()+" adding a RtpReceiver with oid:"+h.receiver.oid),d=new l.RtpReceiver(this,
h.receiver.oid,g.ProxyMode.Remote,this.isUnified(),q)),c.push(d.syncBarrier()));b.receiver=d;t.RemoteSession.isFeatureWebrtc1dot0Supported()&&void 0!=h.transceiver&&!1===h.transceiver.is_null&&(w=this.transceivers_.find(function(a){return a.object_id()===h.transceiver.oid}),void 0===w&&(f.logger.log(this.user_friendly_id()+" adding a RtpTransceiver with oid:"+h.transceiver.oid),w=new v.RtpTransceiver(this,h.transceiver.oid,g.ProxyMode.Remote,this.isUnified(),"inactive",d),this.transceivers_.push(w)),
c.push(w.syncBarrier()));b.transceiver=w;b.streams=[];if(void 0!=h.streams)for(J=function(a){var h=F.remoteStreams.find(function(b){return!1===a.is_null&&b.object_id()===a.oid});void 0===h&&(f.logger.log(F.user_friendly_id()+" adding a RemoteStream with oid:"+a.oid),h=new p.RemoteStream(F,a.oid,g.ProxyMode.Remote),F.remoteStreams.push(h));c.push(h.syncBarrier());b.streams.push(h)},F=this,r=0,K=h.streams;r<K.length;r++)y=K[r],J(y);f.logger.log(this.user_friendly_id()+".ontrack(): .prop.syncBarrier start");
Promise.all(c).then(function(){f.logger.log(z.user_friendly_id()+".ontrack(): notified!!! with evt: "+b);for(var a=0,c=b.streams;a<c.length;a++)c[a].toggleAudio(!1);z.ontrack_(b)})["catch"](function(a){z.logRemoteInvokeError(a,".ontrack(): .prop.syncBarrier failed.")});return[2]})})});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.ontrack,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_ontrack(): failed.")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"signalingState",{get:function(){f.logger.log(this.user_friendly_id()+".get_signalingState() called, value = "+this.signalingState_);return this.signalingState_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onnegotiationneeded",{get:function(){return this.onnegotiationneeded_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onnegotiationneeded() called.");this.onnegotiationneeded_=a;this.waitUntilConnected(this.user_friendly_id()+".onnegotiationneeded").then(function(){var c=
b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onnegotiationneeded);c.then(function(){f.logger.log(b.user_friendly_id()+".onnegotiationneeded(): callback received!!!");var a=new w("negotiationneeded",b);b.onnegotiationneeded_(a)});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onnegotiationneeded,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onnegotiationneeded(): failed.")})},enumerable:!0,configurable:!0});b.prototype.dumpConstraints=function(a){f.logger.log(this.user_friendly_id()+
"constraints: "+a);void 0!==a&&0!==Object.keys(a).length||f.logger.log(this.user_friendly_id()+"constraints either undefined or empty!");a&&(f.logger.log(this.user_friendly_id()+"  -- video: "+a.offerToReceiveVideo),f.logger.log(this.user_friendly_id()+"  -- audio: "+a.offerToReceiveAudio),f.logger.log(this.user_friendly_id()+"  -- iceRestart: "+a.iceRestart),f.logger.log(this.user_friendly_id()+"  -- voiceActivityDetection: "+a.voiceActivityDetection))};b.prototype.fix_constraints=function(a){this.dumpConstraints(a);
var b={};this.isUnified()||(b={audio:!0,video:!0});a&&(void 0!==a.video&&(b.video=a.offerToReceiveVideo),void 0!==a.audio&&(b.audio=a.offerToReceiveAudio),void 0!==a.iceRestart&&(b.iceRestart=a.iceRestart),void 0!==a.voiceActivityDetection&&(b.voiceActivityDetection=a.voiceActivityDetection));return b};b.prototype.createOffer=function(a,b,c){f.logger.log(this.user_friendly_id()+".createOffer() called.",JSON.stringify(a));return this.isUnified()?void 0==a?this.createOffer_v2():a?this.createOffer_v2(a):
this.createOffer_v1(a,b,c):this.createOffer_v1(a,b,c)};b.prototype.createOffer_v2=function(a){var b=this;f.logger.log(this.user_friendly_id()+".createOffer_v2() called.",JSON.stringify(a));return new Promise(function(c,h){b.createOffer_v1(function(a){f.logger.log(b.user_friendly_id()+".createOffer_v2(): got sdp!!!");a=new r(a.type,a.sdp);c(a)},function(a){void 0!=a&&(a=b.logRemoteInvokeError(a,".createOffer_v2() failed."),h(a))},a)})};b.prototype.createOffer_v1=function(a,b,c){var h=this;f.logger.log(this.user_friendly_id()+
".createOffer_v1().",JSON.stringify(c));var d=[this.waitUntilConnected(this.user_friendly_id()+".createOffer_v1"),this.waitTransceiverReady(this.user_friendly_id()+".createOffer_v1")];Promise.all(d).then(function(){var a=h.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.createOffer);h.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.createOffer,a.success,a.fail,h.fix_constraints(c));return a.prom()}).then(function(a){f.logger.log(h.user_friendly_id()+".createOffer_v1(): success callback received!!!");
return(new q(h,h.param0(a).oid,g.ProxyMode.Remote)).syncBarrier()}).then(function(b){a&&a(b)})["catch"](function(a){void 0!=a&&(a=h.logRemoteInvokeError(a,".createOffer_v1() failed."),b&&b(a))})};b.prototype.createAnswer=function(a,b,c){f.logger.log(this.user_friendly_id()+".createAnswer() called.",JSON.stringify(a));return this.isUnified()?void 0==a?this.createAnswer_v2():a?this.createAnswer_v2(a):this.createAnswer_v1(a,b,c):this.createAnswer_v1(a,b,c)};b.prototype.createAnswer_v2=function(a){var b=
this;f.logger.log(this.user_friendly_id()+".createAnswer_v2() called.",JSON.stringify(a));return new Promise(function(c,h){b.createAnswer_v1(function(a){f.logger.log(b.user_friendly_id()+".createAnswer_v2(): got sdp!!!");a=new r(a.type,a.sdp);c(a)},function(a){void 0!=a&&(a=b.logRemoteInvokeError(a,".createAnswer_v2() failed."),h(a))},a)})};b.prototype.createAnswer_v1=function(a,b,c){var h=this;f.logger.log(this.user_friendly_id()+".createAnswer_v1() called.",JSON.stringify(c));var d=[this.waitUntilConnected(this.user_friendly_id()+
".createAnswer_v1"),this.waitTransceiverReady(this.user_friendly_id()+".createAnswer_v1")];Promise.all(d).then(function(){var a=h.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.createAnswer);h.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.createAnswer,a.success,a.fail,h.fix_constraints(c),{});return a.prom()}).then(function(a){f.logger.log(h.user_friendly_id()+".createAnswer_v1(): success callback received!!!");return(new q(h,h.param0(a).oid,g.ProxyMode.Remote)).syncBarrier()}).then(function(b){a&&
a(b)})["catch"](function(a){a=h.logRemoteInvokeError(a,".createAnswer_v1() failed.");b&&b(a.message)})};b.prototype.updateSdpDescription=function(a){return n(this,void 0,void 0,function(){var b,c,h,d=this;return e(this,function(w){switch(w.label){case 0:return f.logger.log(this.user_friendly_id()+".updateSdpDescription() called."),1!=a?[3,2]:[4,this.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.localDescription,{oid:this.object_id()})];case 1:return b=w.sent(),[3,4];case 2:return[4,this.remoteInvoke(!1,
u.method_id_RTCPeerConnection_t.remoteDescription,{oid:this.object_id()})];case 3:b=w.sent(),w.label=4;case 4:return c=new q(this,this.param0(b).oid,g.ProxyMode.Remote),[4,c.syncBarrier()["catch"](function(a){d.logRemoteInvokeError(a,"sdp.syncBarrier() failed!");return null})];case 5:return h=w.sent(),1==a?this.localDescription_=h:this.remoteDescription_=h,[2]}})})};b.prototype.setLocalDescription=function(a,b,c){f.logger.log(this.user_friendly_id()+".setLocalDescription() called.",JSON.stringify(a));
if(a instanceof r)return this.setLocalDescription_v2(a);if(a instanceof RTCSessionDescription&&b)return this.setLocalDescription_v1(a,b,c);b=void 0;a?b=new r(a.type,a.sdp):(f.logger.log(this.user_friendly_id()+".setLocalDescription() empty param1, setting sdp type to rollback"),a=void 0,a="have-remote-offer"==this.signalingState_?"answer":"have-local-pranswer"==this.signalingState_||"have-remote-pranswer"==this.signalingState_?"pranswer":"offer",b=new r(a,""));return this.setLocalDescription_v2(b)};
b.prototype.setLocalDescription_v2=function(a){var b=this;f.logger.log(this.user_friendly_id()+".setLocalDescription_v2() called.",JSON.stringify(a));return new Promise(function(c,h){b.waitUntilConnected(b.user_friendly_id()+".setLocalDescription_v2").then(function(){return(new q(b,0,g.ProxyMode.Local,{type:q.convertC2H(a.type),sdp:a.sdp})).syncBarrier()}).then(function(d){var w=b.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.setLocalDescription_v2),r={type:q.convertC2H(a.type),sdp:a.sdp};
b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.setLocalDescription_v2,r,w.success,w.fail);w.prom().then(function(){f.logger.log(b.user_friendly_id()+".setLocalDescription_v2(): success callback received!!!");b.localDescription_=d;f.logger.log(b.user_friendly_id()+".setLocalDescription_v2(): updated localDescription_");b.isUnified();Promise.all([]).then(function(){f.logger.log(b.user_friendly_id()+".setLocalDescription_v2() success.");c()})["catch"](function(a){a=b.logRemoteInvokeError(a,".prop.setLocalDescription_v2() failed!");
h(a)})})["catch"](function(a){a=b.logRemoteInvokeError(a,"setLocalDescription_v2() error callback received!");h(a)})})["catch"](function(a){a=b.logRemoteInvokeError(a,".setLocalDescription_v2() failed.");h(a)})})};b.prototype.setLocalDescription_v1=function(a,b,c){var h=this;f.logger.log(this.user_friendly_id()+".setLocalDescription_v1() called.");this.waitUntilConnected(this.user_friendly_id()+".setLocalDescription_v1").then(function(){return(new q(h,0,g.ProxyMode.Local,{type:q.convertC2H(a.type),
sdp:a.sdp})).syncBarrier()}).then(function(a){var q=h.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.setLocalDescription);h.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.setLocalDescription,{oid:a.object_id()},q.success,q.fail);q.prom().then(function(){f.logger.log(h.user_friendly_id()+".setLocalDescription_v1(): success callback received!!!");h.localDescription_=a;f.logger.log(h.user_friendly_id()+".setLocalDescription_v1(): updated localDescription_");h.isUnified();Promise.all([]).then(function(){f.logger.log(h.user_friendly_id()+
".setLocalDescription_v1() success.");b&&b()})["catch"](function(a){a=h.logRemoteInvokeError(a,".prop.setLocalDescription_v1() failed.");c&&c(a.message)})})["catch"](function(a){a=h.logRemoteInvokeError(a,".setLocalDescription_v1() error callback received.");c&&c(a.message)})})["catch"](function(a){a=h.logRemoteInvokeError(a,".setLocalDescription_v1() failed.");c&&c(a.message)})};b.prototype.setRemoteDescription=function(a,b,c){f.logger.log(this.user_friendly_id()+".setRemoteDescription() called.",
JSON.stringify(a));if(a instanceof r)return this.setRemoteDescription_v2(a);if(a instanceof RTCSessionDescription&&b)return this.setRemoteDescription_v1(a,b,c);b=void 0;a?b=new r(a.type,a.sdp):(f.logger.log(this.user_friendly_id()+".setRemoteDescription() empty param1, setting sdp type to rollback"),a=void 0,a="have-remote-offer"==this.signalingState_?"answer":"have-local-pranswer"==this.signalingState_||"have-remote-pranswer"==this.signalingState_?"pranswer":"offer",b=new r(a,""));return this.setRemoteDescription_v2(b)};
b.prototype.setRemoteDescription_v2=function(a){var b=this;f.logger.log(this.user_friendly_id()+".setRemoteDescription_v2() called.",JSON.stringify(a));return new Promise(function(c,h){b.waitUntilConnected(b.user_friendly_id()+".setRemoteDescription_v2").then(function(){return(new q(b,0,g.ProxyMode.Local,{type:q.convertC2H(a.type),sdp:a.sdp})).syncBarrier()}).then(function(d){var w=b.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.setRemoteDescription_v2),r={type:q.convertC2H(a.type),sdp:a.sdp};
b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.setRemoteDescription_v2,r,w.success,w.fail);w.prom().then(function(){f.logger.log(b.user_friendly_id()+".setRemoteDescription_v2(): success callback received!!!");b.remoteDescription_=d;f.logger.log(b.user_friendly_id()+".setRemoteDescription_v2(): updated remoteDescription_");var a=[];b.isUnified()?a.push(b.getTransceiversAsync()):a.push(b.getSendersAsync());Promise.all(a).then(function(){f.logger.log(b.user_friendly_id()+".setRemoteDescription_v2(): success.");
c()})["catch"](function(a){a=b.logRemoteInvokeError(a,".prop.setRemoteDescription_v2() failed.");h(a)})})["catch"](function(a){a=b.logRemoteInvokeError(a,".setRemoteDescription_v2() error callback received.");h(a)})})["catch"](function(a){a=b.logRemoteInvokeError(a,".setRemoteDescription_v2() failed.");h(a)})})};b.prototype.setRemoteDescription_v1=function(a,b,c){var h=this;f.logger.log(this.user_friendly_id()+".setRemoteDescription_v1() called.");this.waitUntilConnected(this.user_friendly_id()+".setRemoteDescription_v1").then(function(){return(new q(h,
0,g.ProxyMode.Local,{type:q.convertC2H(a.type),sdp:a.sdp})).syncBarrier()}).then(function(a){var q=h.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.setRemoteDescription);h.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.setRemoteDescription,{oid:a.object_id()},q.success,q.fail);q.prom().then(function(){f.logger.log(h.user_friendly_id()+".setRemoteDescription_v1(): success callback received!!!");h.remoteDescription_=a;f.logger.log(h.user_friendly_id()+".setRemoteDescription_v1(): updated remoteDescription_");
var q=[];h.isUnified()?q.push(h.getTransceiversAsync()):q.push(h.getSendersAsync());Promise.all(q).then(function(){f.logger.log(h.user_friendly_id()+".setRemoteDescription_v1(): success.");b&&b()})["catch"](function(a){a=h.logRemoteInvokeError(a,".prop.setRemoteDescription_v1() failed.");c&&c(a.message)})})})["catch"](function(a){a=h.logRemoteInvokeError(a,".setRemoteDescription_v1() failed.");c&&c(a.message)})};b.prototype.getLocalStreams=function(){f.logger.log("PeerConnection.getLocalStreams() called. [oid="+
this.object_id()+"]");for(var a=0,b=this.localStreams;a<b.length;a++)f.logger.log(JSON.stringify(b[a]));return this.localStreams};b.prototype.getRemoteStreams=function(){f.logger.log(this.user_friendly_id()+".getRemoteStreams() called.");for(var a=0,b=this.remoteStreams;a<b.length;a++)f.logger.log(JSON.stringify(b[a]));return this.remoteStreams};b.prototype.addTrack=function(a,b){var c=this;f.logger.log(this.user_friendly_id()+".addTrack() called: "+JSON.stringify(b));var h=[];if(b instanceof p.RemoteStream)h.push(b.id),
this.localStreams.push(b);else for(var q=0;q<b.length;q++)h.push(b[q].id),this.localStreams.push(b[q]);var d=new l.RtpSender(this,0,g.ProxyMode.Pseudo,this.isUnified());this.senders_.push(d);this.waitUntilConnected(this.user_friendly_id()+".addTrack").then(function(){return c.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.addTrack,{oid:a.object_id()},h)}).then(function(a){f.logger.log(c.user_friendly_id()+".addTrack() success with oid: "+c.param0(a).oid);d.bind(c,c.param0(a).oid);d.syncBarrier().then(function(){f.logger.log(c.user_friendly_id()+
"sender.syncBarrier(): success");c.isUnified()&&c.getTransceiversAsync()})["catch"](function(a){c.logRemoteInvokeError(a,"sender.syncBarrier() failed!")})})["catch"](function(a){c.logRemoteInvokeError(a,"addTrack() failed!")});f.logger.log(this.user_friendly_id()+".addTrack() returning: "+d);return d};b.prototype.removeTrack=function(a){var b=this;f.logger.log(this.user_friendly_id()+".removeTrack() called.");for(var c=0;c<this.senders_.length;c++)this.senders_[c]==a&&this.senders_.splice(c,1);this.waitUntilConnected(this.user_friendly_id()+
".removeTrack").then(function(){return b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.removeTrack,{oid:a.object_id()})}).then(function(){f.logger.log(b.user_friendly_id()+".removeTrack() success.");b.isUnified()&&b.getTransceiversAsync()})["catch"](function(a){b.logRemoteInvokeError(a,"removeTrack() failed!")})};b.prototype.addStream=function(a){var b=this;f.logger.log(this.user_friendly_id()+".addStream() called: "+JSON.stringify(a));this.localStreams.push(a);this.waitUntilConnected(this.user_friendly_id()+
".addStream").then(function(){return b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.addStream,{oid:a.object_id()},{})}).then(function(){f.logger.log(b.user_friendly_id()+".addStream() success.")})["catch"](function(a){b.logRemoteInvokeError(a,"addStream() failed.")})};b.prototype.removeStream=function(a){var b=this;f.logger.log(this.user_friendly_id()+".removeStream() called: "+JSON.stringify(a));for(var c=0;c<this.localStreams.length;c++)this.localStreams[c]==a&&this.localStreams.splice(c,1);
this.waitUntilConnected(this.user_friendly_id()+".removeStream").then(function(){return b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.removeStream,{oid:a.object_id()})}).then(function(){f.logger.log(b.user_friendly_id()+".removeStream() success.")})["catch"](function(a){b.logRemoteInvokeError(a,"removeStream() failed.")})};Object.defineProperty(b.prototype,"onaddstream",{get:function(){return this.onaddstream_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onaddstream() called.");
this.onaddstream_=a;this.waitUntilConnected(this.user_friendly_id()+".onaddstream").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onaddstream);c.then(function(a){(new p.RemoteStreamEvent(b,b.param0(a).oid)).syncBarrier().then(function(a){f.logger.log(b.user_friendly_id()+".onaddstream callback received!");void 0===b.remoteStreams.find(function(b){return void 0!=a.stream&&b.object_id()===a.stream.object_id()})&&b.remoteStreams.push(a.stream);void 0!=
b.onaddstream_&&(f.logger.log(b.user_friendly_id()+".onaddstream notified!!! "+a.stream.id),b.onaddstream_(a))})});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.onaddstream,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,"set_onaddstream() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onremovestream",{get:function(){return this.onremovestream_},set:function(a){var b=this;f.logger.log(this.user_friendly_id()+".set_onremovestream() called.");this.onremovestream_=
a;this.waitUntilConnected(this.user_friendly_id()+".onremovestream").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.onremovestream);c.then(function(a){(new p.RemoteStreamEvent(b,b.param0(a).oid)).syncBarrier().then(function(a){f.logger.log(b.user_friendly_id()+".onremovestream callback received! "+a.stream.id);var c=b.remoteStreams.findIndex(function(b){return b.id==a.stream.id});0<=c&&b.remoteStreams.splice(c,1);b.onremovestream_(a)})});return b.remoteInvoke(!0,
u.method_id_RTCPeerConnection_t.onremovestream,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,"set_onremovestream() failed!")})},enumerable:!0,configurable:!0});b.prototype.getStats=function(a){var b=this;return new Promise(function(c,h){var q=this;b.isRedirected()?b.waitUntilConnected(b.user_friendly_id()+".getStats").then(function(){var h=b.registerCallbacks(!0,!1,u.method_id_RTCPeerConnection_t.getStats);h.then(function(b){void 0!==b.params&&0!==b.params.length&&(a?(a(A.StatsReport.fromJSON(JSON.parse(b.params[0]))),
c()):c(A.StatsReport.toRTCStatsReport(JSON.parse(b.params[0]))))});return a?b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.getStats,h.success):b.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.getStats_v2,h.success)})["catch"](function(a){q&&(a=q.logRemoteInvokeError(a,".getStats() failed!"),h(a))}):(a({}),c())})};b.prototype.SendTelemetryData=function(a,b,c){m.getRedirector().telemetry.SendTelemetryData(x.tel_cmd.Data,a,b,c)};b.prototype.MillisecondstoDisplayformat_=function(a){var b,c;c=Math.floor(a/
1E3);b=Math.floor(c/60);a=Math.floor(b/60);f.logger.log(Math.floor(a/24)+":"+a%24+":"+b%60+":"+c%60)};b.prototype.CalculateCallDurationandType_=function(){if(1==this.timeerstarted_){this.timeerstarted_=!1;this.callendTime_=(new Date).getTime();var a=this.callendTime_-this.callstartTime_;this.MillisecondstoDisplayformat_(a);a=Math.round(a/1E3);f.logger.log("Call Duration "+a);1==this.conferencecall_?this.SendTelemetryData(x.tel_key_ConferenceCallDuration,a,1):(1==this.audiocall_.active&&this.SendTelemetryData(x.tel_key_AudioCallDuration,
a,1),1==this.videocall_.active&&this.SendTelemetryData(x.tel_key_VideoCallDuration,a,1),1==this.screensharingcall_.active&&this.SendTelemetryData(x.tel_key_ScreensharingCallDuration,a,1));var b;1==this.firsttimelocaloffer_&&(b=this.callstartTime_-this.outgoingcallstart_);1==this.firsttimeremoteoffer_&&(b=this.callstartTime_-this.incomingcallstart_);this.MillisecondstoDisplayformat_(b);b=Math.round(b/1E3);f.logger.log("Call Establish Time "+b);1==this.incomingcall_?this.SendTelemetryData(x.tel_key_CallEstIncoming,
b,1):1==this.outgoingcall_&&this.SendTelemetryData(x.tel_key_CallEstOutgoing,b,1);this.SendTelemetryData(x.tel_key_PerfCallState,x.tel_CallState.idle,1)}};b.prototype.close=function(){var a=this;f.logger.log(this.user_friendly_id()+".close() called.");this.CalculateCallDurationandType_();this.unregisterStateChangeNotification(this.onStateChange);this.onnegotiationneeded=this.onsignalingstatechange=this.onicegatheringstatechange=this.oniceconnectionstatechange=this.onicecandidate=this.onaddstream=
null;this.waitUntilConnected(this.user_friendly_id()+".close").then(function(){return a.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.close)}).then(function(){a.iceQ_=null;a.release();f.logger.log(a.user_friendly_id()+".close() success.")})["catch"](function(b){a.logRemoteInvokeError(b,".close() failed.");a.iceQ_=null;a.release()})};b.prototype.createDTMFSender=function(a){f.logger.log(this.user_friendly_id()+".createDTMFSender() called.");var b,c=this.senders_;if(void 0===c||0===c.length)c=this.getSenders();
void 0!=c&&(c=c.find(function(b){return b.track.id===a.id}),void 0!=c&&(f.logger.log(this.user_friendly_id()+" returning RtpSender with oid:"+c.object_id()),b=c.dtmf));return b};b.prototype.getSenders=function(){var a=this;f.logger.log(this.user_friendly_id()+".getSenders() called. ");if(this.isUnified()){for(var b=[],c=0,h=this.transceivers_;c<h.length;c++)b.push(h[c].sender);this.senders_=b}else this.getSendersAsync().then(function(){f.logger.log(a.user_friendly_id()+".getSenders() success.")})["catch"](function(b){a.logRemoteInvokeError(b,
".getSenders() failed!")});f.logger.log(this.user_friendly_id()+".getSenders() returning:"+this.senders_.length+" items");return this.senders_};b.prototype.getSendersAsync=function(){var a=this;f.logger.log(this.user_friendly_id()+".getSendersAsync() called. "+this.senders_);return new Promise(function(b,c){a.waitUntilConnected(a.user_friendly_id()+".getSendersAsync").then(function(){f.logger.log(a.user_friendly_id()+".getSendersAsync invoking remote");return a.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.getSenders,
[])}).then(function(c){f.logger.log(a.user_friendly_id()+".getSendersAsync remote success");var h=[],q=[];c.params[0].forEach(function(b){var c=a.senders_.find(function(a){return a.object_id()===b.oid});void 0===c&&(f.logger.log(a.user_friendly_id()+" adding a RtpSender with oid:"+b.oid),c=new l.RtpSender(a,b.oid,g.ProxyMode.Remote,a.isUnified()),q.push(c.syncBarrier()));h.push(c)});Promise.all(q).then(function(){a.senders_=h;f.logger.log(a.user_friendly_id()+".getSendersAsync: returning senders with ids ["+
a.senders_.map(function(a){return a.object_id()})+"]");b(a.senders_)})["catch"](function(c){a.logRemoteInvokeError(c,".prop.getSendersAsync() failed.");a.senders_=[];b(a.senders_)})})["catch"](function(c){a.logRemoteInvokeError(c,".getSendersAsync() failed.");a.senders_=[];b(a.senders_)})})};b.prototype.getReceivers=function(){var a=this;f.logger.log(this.user_friendly_id()+".getReceivers() called. ");if(this.isUnified()){for(var b=[],c=0,h=this.transceivers_;c<h.length;c++)b.push(h[c].receiver);
this.receivers_=b}else this.getReceiversAsync().then(function(){f.logger.log(a.user_friendly_id()+".getReceivers() success.")})["catch"](function(b){a.logRemoteInvokeError(b,".getReceivers() failed!")});f.logger.log(this.user_friendly_id()+".getReceivers() returning:"+this.receivers_.length+" items");return this.receivers_};b.prototype.getReceiversAsync=function(){var a=this;f.logger.log(this.user_friendly_id()+".getReceiversAsync() called. "+this.receivers_);return new Promise(function(b,c){a.waitUntilConnected(a.user_friendly_id()+
".getReceiversAsync").then(function(){return a.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.getReceivers,[])}).then(function(c){f.logger.log(a.user_friendly_id()+".getReceiversAsync: remote success.");var h=[],q=[];c.params[0].forEach(function(b){var c=a.receivers_.find(function(a){return a.object_id()===b.oid});void 0===c&&(f.logger.log(a.user_friendly_id()+" adding a RtpReceiver with oid:"+b.oid),c=new l.RtpReceiver(a,b.oid,g.ProxyMode.Remote,a.isUnified()),q.push(c.syncBarrier()));h.push(c)});
Promise.all(q).then(function(){a.receivers_=h;f.logger.log(a.user_friendly_id()+".getReceiversAsync: returning receiver with ids ["+a.receivers_.map(function(a){return a.object_id()})+"]");b(a.receivers_)})["catch"](function(c){a.logRemoteInvokeError(c,".prop.getReceiversAsync() failed!");a.receivers_=[];b(a.receivers_)})})["catch"](function(c){a.logRemoteInvokeError(c,".getReceiversAsync() failed!");a.receivers_=[];b(a.receivers_)})})};b.prototype.addTransceiver=function(a,b){var c=this;f.logger.log(this.user_friendly_id()+
".addTransceiver() called: "+JSON.stringify(a)+" init="+JSON.stringify(b));this.pendingtransceiver_=!0;var h="sendrecv";b&&b.direction&&(h=b.direction);var q=new v.RtpTransceiver(this,0,g.ProxyMode.Pseudo,this.isUnified(),h);this.transceivers_.push(q);this.waitUntilConnected(this.user_friendly_id()+".addTransceiver").then(function(){return"string"===typeof a?c.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.addTransceiverWithKind,a,b):c.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.addTransceiverWithTrack,
{oid:a.object_id()},b)}).then(function(a){f.logger.log(c.user_friendly_id()+".addTransceiver() success with oid: "+c.param0(a).oid);q.bind(c,c.param0(a).oid);q.syncBarrier().then(function(){f.logger.log(c.user_friendly_id()+".addTransceiver(): success");c.pendingtransceiver_=!1})["catch"](function(a){c.logRemoteInvokeError(a,".prop.addTransceiver() failed!");c.pendingtransceiver_=!1})})["catch"](function(a){c.logRemoteInvokeError(a,"addTransceiver() failed!");c.pendingtransceiver_=!1});f.logger.log(this.user_friendly_id()+
".addTransceiver() returning:");return q};b.prototype.waitTransceiverReady=function(a){var b=this;return new Promise(function(c,h){f.logger.trace(b.user_friendly_id()+".waitTransceiverReady(): pendingtransceiver_="+b.pendingtransceiver_);if(0==b.pendingtransceiver_){for(;b.deferredOfferAnswers&&0<b.deferredOfferAnswers.length;)b.deferredOfferAnswers.shift().post(!0);c()}else b.deferredOfferAnswers.push(new g.deferred_action(c,h,a)),b.checkTransceiver(15,1E3)})};b.prototype.checkTransceiver=function(a,
b){var c=this;if(0>=a)for(f.logger.log(".checkTransceiver() timeout waiting for transceiver ready!");this.deferredOfferAnswers&&0<this.deferredOfferAnswers.length;)this.deferredOfferAnswers.shift().post(!1);else setTimeout(function(){if(0==c.pendingtransceiver_)for(;c.deferredOfferAnswers&&0<c.deferredOfferAnswers.length;)c.deferredOfferAnswers.shift().post(!0);else f.logger.log('.checkTransceiver(): count= "'+a),c.checkTransceiver(--a,b)},b)};b.prototype.getTransceivers=function(){f.logger.log(this.user_friendly_id()+
".getTransceivers() called. ");f.logger.log(this.user_friendly_id()+".getTransceivers() returning:"+this.transceivers_.length+" items");return this.transceivers_};b.prototype.getTransceiversAsync=function(){var a=this;f.logger.log(this.user_friendly_id()+".getTransceiversAsync() called. ");return new Promise(function(b,c){a.waitUntilConnected(a.user_friendly_id()+".getTransceiversAsync").then(function(){return a.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.getTransceivers,[])}).then(function(c){f.logger.log(a.user_friendly_id()+
".getTransceiversAsync() remote success.");var h=[],q=[];c.params[0].forEach(function(b){var c=a.transceivers_.find(function(a){return a.object_id()===b.oid});void 0===c&&(f.logger.log(a.user_friendly_id()+" adding a RtpTransceiver with oid:"+b.oid),c=new v.RtpTransceiver(a,b.oid,g.ProxyMode.Remote,a.isUnified()),q.push(c.syncBarrier()));h.push(c)});Promise.all(q).then(function(){a.transceivers_=h;f.logger.log(a.user_friendly_id()+".prop.getTransceiversAsync: returning transceiver with ids ["+a.transceivers_.map(function(a){return a.object_id()})+
"]");b(a.transceivers_)})["catch"](function(c){a.logRemoteInvokeError(c,".prop.getTransceiversAsync() failed!");a.transceivers_=[];b(a.transceivers_)})})["catch"](function(c){a.logRemoteInvokeError(c,".getTransceiversAsync() failed!");a.transceivers_=[];b(a.transceivers_)})})};Object.defineProperty(b.prototype,"sctp",{get:function(){return this.sctp_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"ondatachannel",{get:function(){return this.ondatachannel_},set:function(a){var b=
this;f.logger.log(this.user_friendly_id()+".set_ondatachannel() called.");this.ondatachannel_=a;this.waitUntilConnected(this.user_friendly_id()+".ondatachannel").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),u.method_id_RTCPeerConnection_t.ondatachannel);c.then(function(a){f.logger.log(b.user_friendly_id()+".ondatachannel callback received!!!");if(null===b.remotedatachannel_||b.remotedatachannel_.object_id()!=b.param0(a).oid)b.remotedatachannel_=new z.RtcDataChannel(b,b.param0(a).oid,
g.ProxyMode.Remote),b.remotedatachannel_.syncBarrier().then(function(){f.logger.log(b.user_friendly_id()+"remotedatachannel_.syncBarrier(): success");var a=new Event("ondatachannel");a.channel=b.remotedatachannel_;if(b.localdatachannel_&&!b.localdatachannel_.isdestroyed())b.localdatachannel_.syncBarrier().then(function(){f.logger.log(b.user_friendly_id()+"ondatachannel(): notifying...");if(b.ondatachannel_)b.ondatachannel_(a)})["catch"](function(){f.logger.log(b.user_friendly_id()+"localdatachannel_.syncBarrier(): failed!")});
else if(f.logger.log(b.user_friendly_id()+"ondatachannel(): notifying..."),b.ondatachannel_)b.ondatachannel_(a)})["catch"](function(){f.logger.log(b.user_friendly_id()+"remotedatachannel_.syncBarrier(): failed!")})});return b.remoteInvoke(!0,u.method_id_RTCPeerConnection_t.ondatachannel,c.success)})["catch"](function(){f.logger.log(b.user_friendly_id()+".ondatachannel() failed.")})},enumerable:!0,configurable:!0});b.prototype.fixDataChannelConfig=function(a){f.logger.log(this.user_friendly_id()+".fixDataChannelConfig() called: "+
a);void 0==a&&(a={});void 0==a.negotiated&&void 0==a.id&&(a.negotiated=!1,a.id=-1);return a};b.prototype.createDataChannel=function(a,b){var c=this;f.logger.log(this.user_friendly_id()+".createDataChannel() called. label:"+a);this.localdatachannel_=new z.RtcDataChannel(this,0,g.ProxyMode.Pseudo);this.waitUntilConnected(this.user_friendly_id()+".createDataChannel").then(function(){return c.remoteInvoke(!1,u.method_id_RTCPeerConnection_t.createDataChannel,a,c.fixDataChannelConfig(b))}).then(function(a){f.logger.log(c.user_friendly_id()+
".createDataChannel() success with oid: "+c.param0(a).oid);c.localdatachannel_.bind(c,c.param0(a).oid);c.localdatachannel_.syncBarrier().then(function(){f.logger.log(c.user_friendly_id()+"channel.syncBarrier(): success")})["catch"](function(){f.logger.log(c.user_friendly_id()+"channel.syncBarrier(): failed!")})})["catch"](function(a){a=c.param0(a);f.logger.log(c.user_friendly_id()+".createDataChannel() failed with error: "+a)});f.logger.log(this.user_friendly_id()+".createDataChannel() returning: "+
this.localdatachannel_);return this.localdatachannel_};return b}(g.ProxyObject);a.PeerConnection=b},658:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(946),n=c(851),e=c(545),m=c(247),p=c(550),l=function(){function a(b,c,d){this.resolve=b;this.reject=c;this.name_=d}Object.defineProperty(a.prototype,"name",{get:function(){return this.name_},enumerable:!0,configurable:!0});a.prototype.post=function(a){1==a?(n.logger.log('deferred_action.post(): resolving "'+this.name_+'"'),
this.resolve()):(n.logger.log('deferred_action.post(): rejecting "'+this.name_+'"'),this.reject())};a.prototype.postWithResult=function(a,b){1==a?(n.logger.log('deferred_action.post(): resolving "'+this.name_+'"'),this.resolve(b)):(n.logger.log('deferred_action.post(): rejecting "'+this.name_+'"'),this.reject())};return a}();a.deferred_action=l;var g=function(){return function(a,b){this.id=a;this.is_null=b}}();a.rpc_callback=g;var k=function(){function a(b,c,d){this.success=new g(b<<16,c);this.fail=
new g(b<<16|1,c);this.id=b;this.oneShot=d}a.prototype.resolve=function(a){n.logger.trace("callback.resolve() called. [id="+this.id+"]");null!=this.handler&&this.handler(a)};a.prototype.reject=function(a){null!=this.err_handler&&this.err_handler(a)};a.prototype.then=function(a){this.handler=a};a.prototype.prom=function(){var a=this;return new Promise(function(b,c){a.handler=b;a.err_handler=c})};return a}();a.callback=k;var v;(function(a){a[a.NotConfigured=0]="NotConfigured";a[a.Configured=1]="Configured";
a[a.Error=2]="Error";a[a.Destroyed=3]="Destroyed"})(v||(v={}));var t;(function(a){a[a.Local=0]="Local";a[a.Remote=1]="Remote";a[a.Pseudo=2]="Pseudo"})(t=a.ProxyMode||(a.ProxyMode={}));b=function(){function a(b,c,g,l,k){void 0===k&&(k=null);for(var C=[],r=5;r<arguments.length;r++)C[r-5]=arguments[r];var q=this;this.hdxms=d.getRedirector();this.iid=c;this.oid=g;this.mode=l;this.proxystate=v.NotConfigured;this.deferredActions=[];this.cbs=new Map;l===t.Local?(r=!1,this.iid===p.class_id_t.EngineControl&&
(r=!0),this.hdxms.startRedirection(r,this.user_friendly_id()).then(function(){q.oid=a.nextId++;n.logger.log(q.user_friendly_id()+" assigned local oid:"+q.oid);var b=p.WebrpcClassLibInfoUtil.getMethodFeatureByid(c,0);return q.hdxms.WSSendObjectWrapper(b,c,0,e.WsJsonUtil.createMessageByid.apply(e.WsJsonUtil,[!1,!1,e.ws_msg_type_t.req,c,0,q.oid].concat(C)))}).then(function(a){n.logger.trace("ProxyObject: setting state to configured. (iid: "+q.iid+" oid: "+q.oid+")");var c=q.oid;q.proxystate=v.Configured;
q.oid=q.param0(a);n.logger.log(q.user_friendly_id()+" assigned remote oid for local oid:"+c);q.onConnected();k&&k();m.gc.trackObject(q,b)})["catch"](function(){q.proxystate=v.Error;q.onConnected()})):l===t.Remote&&(this.proxystate=v.Configured,m.gc.trackObject(this,b))}a.prototype.bind=function(a,b){n.logger.trace("ProxyObject: binding object. (iid: "+this.iid+" oid: "+b+" mode: "+this.mode+")");if(this.mode===t.Pseudo){this.proxystate=v.Configured;var c=this.oid;this.oid=b;n.logger.log(this.user_friendly_id()+
" assigned remote oid for local oid:"+c);this.onConnected();m.gc.trackObject(this,a);this.mode=t.Remote}else this.mode===t.Remote?n.logger.log("ProxyObject: binding already complete."):n.logger.log("ProxyObject: binding failure. incorrect mode!")};a.prototype.reconstructor=function(a,b,c){for(var d=this,t=[],g=3;g<arguments.length;g++)t[g-3]=arguments[g];this.proxystate=v.NotConfigured;this.deferredActions=[];g=p.WebrpcClassLibInfoUtil.getMethodFeatureByid(b,0);this.hdxms.WSSendObjectWrapper(g,b,
0,e.WsJsonUtil.createMessageByid.apply(e.WsJsonUtil,[!1,!1,e.ws_msg_type_t.req,b,0,this.oid].concat(t))).then(function(b){n.logger.trace("ProxyObject: setting state to configured. (iid: "+d.iid+" oid: "+d.oid+")");var c=d.oid;d.proxystate=v.Configured;d.oid=d.param0(b);n.logger.log(d.user_friendly_id()+" assigned remote oid for local oid:"+c);d.onConnected();m.gc.trackObject(d,a)})["catch"](function(){d.proxystate=v.Error;d.onConnected()})};a.prototype.setParent=function(a){m.gc.setParent(this,a)};
a.prototype.release=function(){n.logger.log(this.user_friendly_id()+".release() called.");m.gc.releaseObject(this)};a.prototype.destroy=function(){n.logger.log(this.user_friendly_id()+".destroy() called.");this.proxystate=v.Destroyed;var a=p.WebrpcClassLibInfoUtil.getMethodFeatureByid(this.iid,0);this.hdxms.WSSendObjectWrapper(a,this.iid,0,e.WsJsonUtil.createMessageByid(!1,!0,e.ws_msg_type_t.req,this.iid,0,this.oid))};a.prototype.isdestroyed=function(){return this.proxystate==v.Destroyed};a.prototype.onConnected=
function(){for(;this.deferredActions&&0<this.deferredActions.length;)this.deferredActions.shift().post(this.proxystate==v.Configured)};a.prototype.isPseudo=function(){return this.mode==t.Pseudo};a.prototype.checkState=function(a,b){var c=this;0>=a?(n.logger.log("ProxyObject.checkState() timeout waiting for connection response! failed. (iid: "+c.iid+" oid: "+c.oid+")"),c.onConnected()):setTimeout(function(){if(c.proxystate==v.Configured)c.onConnected();else if(c.proxystate==v.Error)c.onConnected();
else if(c.proxystate==v.Destroyed)c.onConnected();else n.logger.log('ProxyObject.checkState(): count= "'+a+'". (iid: '+c.iid+" oid: "+c.oid+")"),c.checkState(--a,b)},b)};a.prototype.waitUntilConnected=function(a){var b=this;return new Promise(function(c,d){b?(n.logger.trace("ProxyObject.waitUntilConnected(): readyState="+b.proxystate+". (iid: "+b.iid+" oid: "+b.oid+")"),b.proxystate==v.Destroyed?(b.onConnected(),n.logger.trace("rejecting already destroyed Object:"+b.user_friendly_id()),d("Object already destroyed :"+
b.user_friendly_id())):b.proxystate==v.Configured?(b.onConnected(),c()):b.proxystate==v.Error?(n.logger.trace("ProxyObject.waitUntilConnected(): readyState="+b.proxystate+". (iid: "+b.iid+" oid: "+b.oid+")"),b.onConnected(),d()):(n.logger.log('ProxyObject.waitUntilConnected(): deferring action "'+a+'". (iid: '+b.iid+" oid: "+b.oid+")"),b.deferredActions.push(new l(c,d,a)),b.checkState(15,1E3))):d("Invalid Object")})};a.prototype.remoteInvoke=function(a,b){for(var c=[],d=2;d<arguments.length;d++)c[d-
2]=arguments[d];if(this.proxystate==v.Destroyed)return n.logger.trace("rejecting already destroyed Object:"+this.user_friendly_id()),Promise.reject("Cannot invoke destroyed object :"+this.user_friendly_id());if(this.proxystate==v.Error)return n.logger.trace("rejecting already error state Object:"+this.user_friendly_id()),Promise.reject("Cannot invoke object in Error state:"+this.user_friendly_id());d=p.WebrpcClassLibInfoUtil.getMethodFeatureByid(this.iid,b);return this.hdxms.WSSendObjectWrapper(d,
this.iid,b,e.WsJsonUtil.createMessageByid.apply(e.WsJsonUtil,[a,!1,e.ws_msg_type_t.req,this.iid,b,this.oid].concat(c)))};a.prototype.logRemoteInvokeError=function(a,b){var c=a;c?n.logger.log(this.user_friendly_id()+b+" with error: "+c.message):this.param0?(n.logger.log(this.user_friendly_id()+b+" with error: "+this.param0(a)),c=new DOMException(b+" with error: "+this.param0(a),this.user_friendly_id())):(n.logger.log(this.user_friendly_id()+b),c=new DOMException(b,this.user_friendly_id()));return c};
a.prototype.registerCallbacks=function(b,c,d){this.unregisterCallbacks(d);var g=a.nextcbid++,t=new k(g,c,b);c||(b||this.cbs.set(d,g),this.hdxms.registerHandler(this.iid,this.oid,t));return t};a.prototype.unregisterCallbacks=function(a){this.cbs.has(a)?(this.hdxms.unregisterHandler(this.iid,this.oid,this.cbs.get(a)),this.cbs["delete"](a)):n.logger.trace(this.cbs)};a.prototype.object_id=function(){return this.oid};a.prototype.param0=function(a){var b={};a&&a.params&&(b=a.params[0]);return b};a.prototype.isNullCallback=
function(a){return void 0==a||null==a};a.prototype.user_friendly_id=function(){return this.constructor.name+"["+this.oid+"]"};a.prototype.isRedirected=function(){return this.hdxms.isRedirected()};a.prototype.isValid=function(){return!(this.proxystate===v.Error||this.proxystate===v.Destroyed)};a.prototype.registerStateChangeNotification=function(a){this.hdxms.registerStateChangeNotification(a)};a.prototype.unregisterStateChangeNotification=function(a){this.hdxms.unregisterStateChangeNotification(a)};
a.nextId=0;a.nextcbid=0;return a}();a.ProxyObject=b},144:function(b,a,c){function d(a){for(var b=[],c=0;c<a.length;c++)b.push({oid:a[c].object_id()});return b}var n=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,
new d)}}(),e=this&&this.__awaiter||function(a,b,c,d){return new (c||(c=Promise))(function(f,y){function g(a){try{t(d.next(a))}catch(b){y(b)}}function h(a){try{t(d["throw"](a))}catch(b){y(b)}}function t(a){a.done?f(a.value):(new c(function(b){b(a.value)})).then(g,h)}t((d=d.apply(a,b||[])).next())})},m=this&&this.__generator||function(a,b){function c(a){return function(b){return d([a,b])}}function d(c){if(y)throw new TypeError("Generator is already executing.");for(;f;)try{if(y=1,g&&(h=c[0]&2?g["return"]:
c[0]?g["throw"]||((h=g["return"])&&h.call(g),0):g.next)&&!(h=h.call(g,c[1])).done)return h;if(g=0,h)c=[c[0]&2,h.value];switch(c[0]){case 0:case 1:h=c;break;case 4:return f.label++,{value:c[1],done:!1};case 5:f.label++;g=c[1];c=[0];continue;case 7:c=f.ops.pop();f.trys.pop();continue;default:if(!(h=f.trys,h=0<h.length&&h[h.length-1])&&(6===c[0]||2===c[0])){f=0;continue}if(3===c[0]&&(!h||c[1]>h[0]&&c[1]<h[3]))f.label=c[1];else if(6===c[0]&&f.label<h[1])f.label=h[1],h=c;else if(h&&f.label<h[2])f.label=
h[2],f.ops.push(c);else{h[2]&&f.ops.pop();f.trys.pop();continue}}c=b.call(a,f)}catch(q){c=[6,q],g=0}finally{y=h=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}var f={label:0,sent:function(){if(h[0]&1)throw h[1];return h[1]},trys:[],ops:[]},y,g,h,t;$jscomp.initSymbol();$jscomp.initSymbol();$jscomp.initSymbolIterator();return t={next:c(0),"throw":c(1),"return":c(2)},"function"===typeof Symbol&&(t[Symbol.iterator]=function(){return this}),t};Object.defineProperty(a,"__esModule",{value:!0});
var p=c(550),l=c(658),g=c(851),k=c(946),v=c(394),t;a.enumerateddecices=t;var z=function(){return function(a,b){this.type=a;this.target=b}}(),u=function(){function a(){this.is_local_clone=!1;this.clone_id=this.clone_count=0}a.prototype.clone=function(){this.clone_count++;var b=new a;b.is_local_clone=!0;b.clone_id=this.clone_count;return b};a.prototype.synchronize=function(a){return e(this,void 0,void 0,function(){return m(this,function(b){return this.is_local_clone?[2,a.asyncClone()]:[2,a]})})};return a}(),
f=function(a){function b(c,d){var f=a.call(this,c,p.class_id_t.MediaStreamTrack,d,l.ProxyMode.Remote)||this;f.refCount_=0;f.refCount_++;f.clone_state=new u;return f}n(b,a);b.prototype.dumpInfo=function(){g.logger.log(this.user_friendly_id()+".dumpInfo() [id="+this.id+"] kind="+this.kind+" label="+this.label+" refcount="+this.refcount)};Object.defineProperty(b.prototype,"refcount",{get:function(){return this.refCount_},enumerable:!0,configurable:!0});b.prototype.addRef=function(){this.refCount_++;
g.logger.log(this.user_friendly_id()+".addRef() called. [id="+this.id+"] refcount="+this.refCount_)};Object.defineProperty(b.prototype,"onended",{get:function(){g.logger.log(this.user_friendly_id()+".get_onended() called. [id="+this.id+"]");return this.onended_},set:function(a){var b=this;g.logger.log(this.user_friendly_id()+".set_onended() called. [id="+this.id+"]");this.onended_=a;this.waitUntilConnected("MediaStreamTrack.onended").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),
p.method_id_MediaStreamTrack_t.onended);c.then(function(a){g.logger.log(b.user_friendly_id()+"onended event received!!!");a=new z("ended",b);b.readyState_="ended";b.onended_(a)});return b.remoteInvoke(!0,p.method_id_MediaStreamTrack_t.onended,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".onended failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onmute",{get:function(){g.logger.log(this.user_friendly_id()+".get_onmute() called. [id="+this.id+"]");return this.onmute_},
set:function(a){var b=this;g.logger.log(this.user_friendly_id()+".set_onmute() called. [id="+this.id+"]");this.onmute_=a;this.waitUntilConnected("MediaStreamTrack.onmute").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),p.method_id_MediaStreamTrack_t.onmute);c.then(function(a){g.logger.log(b.user_friendly_id()+"onmute event received!!!");a=new z("mute",b);b.muted=!0;b.onmute_(a)});return b.remoteInvoke(!0,p.method_id_MediaStreamTrack_t.onmute,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,
".onmute failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onunmute",{get:function(){g.logger.log(this.user_friendly_id()+".get_onunmute() called. [id="+this.id+"]");return this.onunmute_},set:function(a){var b=this;g.logger.log(this.user_friendly_id()+".set_onunmute() called. [id="+this.id+"]");this.onunmute_=a;this.waitUntilConnected("MediaStreamTrack.onunmute").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),p.method_id_MediaStreamTrack_t.onunmute);
c.then(function(a){g.logger.log("onunmute event received!!!");a=new z("unmute",b);b.muted=!1;b.onunmute_(a)});return b.remoteInvoke(!0,p.method_id_MediaStreamTrack_t.onunmute,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".onunmute failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onstop",{set:function(a){this.onstop_=a},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"enabled",{get:function(){g.logger.log(this.user_friendly_id()+".get_enabled() called. [id="+
this.id+", value="+this.enabled_+"]");return this.enabled_},set:function(a){g.logger.log(this.user_friendly_id()+".set_enabled() called. [id="+this.id+", value="+a+"]");this.enabled_=a;this.remoteInvoke(!0,p.method_id_MediaStreamTrack_t.enabled,a)},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"readyState",{get:function(){g.logger.log(this.user_friendly_id()+".get_readyState() called. [id="+this.id+"]");return this.readyState_},enumerable:!0,configurable:!0});b.prototype.asyncClone=
function(){return e(this,void 0,void 0,function(){var a,c,d;return m(this,function(f){switch(f.label){case 0:return[4,this.waitUntilConnected("RemoteMediaTrack.asyncClone")];case 1:return f.sent(),[4,this.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.clone,[])];case 2:return a=f.sent(),c=this.param0(a),d=new b(this,c.oid),[2,d.syncBarrier()]}})})};b.prototype.clone=function(){g.logger.log(this.user_friendly_id()+".clone() called. [id="+this.id+"]");var a=this.clone_state.clone(),c=new b(this,this.object_id());
c.id=this.id+"."+a.clone_id.toString();c.label=this.label;c.kind=this.kind;c.enabled_=this.enabled_;c.muted=this.muted;c.readyState_=this.readyState_;c.trackSettings_=this.trackSettings_;c.clone_state=a;c.constraints_=this.constraints_;c.capabilities_=this.capabilities_;return c};b.prototype.stop=function(){var a=this;g.logger.log(this.user_friendly_id()+".stop() called. [id="+this.id+"] refcount="+this.refCount_);this.readyState_="ended";if(0<this.refCount_&&(this.refCount_--,0===this.refCount_&&
(g.logger.log(this.user_friendly_id()+".stop() called. [id="+this.id+"] remote invoking..."),this.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.stop)["catch"](function(b){a.logRemoteInvokeError(b,".stop failed!")}),"video"==this.kind&&"remoteapp-track"==this.label&&k.getRedirector().stopAppshare(),null!==this.onstop_&&void 0!=this.onstop_)))this.onstop_()};b.prototype.getCapabilities=function(){return this.capabilities_};b.prototype.getConstraints=function(){return this.constraints_};b.prototype.getSettings=
function(){return"audio"==this.kind?function(a){return{deviceId:a.deviceId,echoCancellation:a.echoCancellation}}(this.trackSettings_):function(a){return{aspectRatio:a.aspectRatio,deviceId:a.deviceId,frameRate:a.frameRate,height:a.height,width:a.width}}(this.trackSettings_)};b.prototype.applyConstraints=function(a){var b=this;g.logger.log(this.user_friendly_id()+".applyConstraints() called.");return new Promise(function(c,d){b.waitUntilConnected("MediaStreamTrack.applyConstraints").then(function(){return Promise.all([b.remoteInvoke(!1,
p.method_id_MediaStreamTrack_t.applyConstraints,a),b.syncBarrier()])})["catch"](function(){d({name:"OverconstrainedError",message:"Failed to apply constraints."})}).then(function(){b.constraints_=a;return b.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.getConstraints)}).then(function(a){b.constraints_=b.param0(a)})["catch"](function(a){b.logRemoteInvokeError(a,".syncBarrier() remote client does not support getConstraints method. Ignore it")}).then(function(){return c()})})};b.convertReadyState=function(a){return 0==
a?"live":"ended"};b.prototype.syncBarrier=function(){var a=this;g.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(c,d){a.waitUntilConnected("MediaStreamTrack.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.kind,""),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.id,""),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.label,""),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.enabled,!1),a.remoteInvoke(!1,
p.method_id_MediaStreamTrack_t.muted,!1),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.readyState,0),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.getSettings),a.remoteInvoke(!1,p.method_id_MediaStreamTrack_t.getCapabilities)])}).then(function(d){var f=0;d=d.map(function(b){return a.param0(b)});a.kind=d[0];a.id=d[1];a.label=d[2];a.enabled_=d[3];a.muted=d[4];f=d[5];a.trackSettings_=d[6];a.capabilities_=d[7];a.readyState_=b.convertReadyState(f);c(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,
".syncBarrier() failed!");d(b)})})};return b}(l.ProxyObject);a.RemoteMediaTrack=f;var A=function(){return function(){}}(),x=function(a){function b(c,f,g,t){void 0===g&&(g=l.ProxyMode.Local);void 0===t&&(t=[]);c=a.call(this,c,p.class_id_t.MediaStream,f,g,null,d(t))||this;c.clone_state=new u;c.tracks_=t;return c}n(b,a);b.prototype.dumpInfo=function(){g.logger.log(this.user_friendly_id()+".dumpInfo() [id="+this.id+"] active="+this.active_+" num tracks="+this.tracks_.length);for(var a=0,b=this.tracks_;a<
b.length;a++){var c=b[a];c&&c.dumpInfo()}};b.prototype.toggleAudio=function(a){g.logger.log(this.user_friendly_id()+".toggleAudio() called: "+a);for(var b=0,c=this.getAudioTracks();b<c.length;b++)c[b].enabled=a};b.prototype.toJSON=function(){var a=new A;a.id=this.id;a.active=this.active_;a.oid=this.object_id();return"RemoteStream:"+JSON.stringify(a)};Object.defineProperty(b.prototype,"active",{get:function(){g.logger.log(this.user_friendly_id()+".get active() called. [id="+this.id+"] active="+this.active_);
return this.active_},enumerable:!0,configurable:!0});b.prototype.getAudioTracks=function(){g.logger.log(this.user_friendly_id()+".getAudioTracks() called. [id="+this.id+"]");for(var a=[],b=0,c=this.tracks_;b<c.length;b++){var d=c[b];"audio"==d.kind&&a.push(d)}return a};b.prototype.getVideoTracks=function(){g.logger.log(this.user_friendly_id()+".getVideoTracks() called. [id="+this.id+"]");for(var a=[],b=0,c=this.tracks_;b<c.length;b++){var d=c[b];"video"==d.kind&&a.push(d)}return a};b.prototype.getTracks=
function(){g.logger.log(this.user_friendly_id()+".getTracks() called. [id="+this.id+"]");return this.tracks_};b.prototype.getTrackById=function(a){g.logger.log(this.user_friendly_id()+".getTrackById() called. [id="+this.id+"]");for(var b=0,c=this.tracks_;b<c.length;b++){var d=c[b];if(d.id==a)return d}};b.prototype.addTrack=function(a){var b=this;g.logger.log(this.user_friendly_id()+".addTrack() called. [id="+this.id+"]");this.tracks_.push(a);a&&a.dumpInfo();var c=this;this.waitUntilConnected("MediaStream.addTrack").then(function(){g.logger.log(c.user_friendly_id()+
".addTrack remote invoking");return c.remoteInvoke(!1,p.method_id_MediaStream_t.addTrack,{oid:a.object_id()})}).then(function(){g.logger.log(c.user_friendly_id()+".addTrack success")})["catch"](function(a){b.logRemoteInvokeError(a,".addTrack failed!")})};b.prototype.removeTrack=function(a){var b=this;g.logger.log(this.user_friendly_id()+".removeTrack() called. [id="+this.id+"]");var c=this.tracks_.indexOf(a);this.tracks_.splice(c,1);var d=this;this.waitUntilConnected("MediaStream.removeTrack").then(function(){g.logger.log(d.user_friendly_id()+
".removeTrack remote invoking");return d.remoteInvoke(!1,p.method_id_MediaStream_t.removeTrack,{oid:a.object_id()})}).then(function(){g.logger.log(d.user_friendly_id()+".removeTrack success")})["catch"](function(a){b.logRemoteInvokeError(a,".removeTrack failed!")})};b.prototype.asyncClone=function(){return e(this,void 0,void 0,function(){var a,c,d;return m(this,function(f){switch(f.label){case 0:return g.logger.log(this.user_friendly_id()+".asyncClone() called. [id="+this.id+"]"),[4,this.waitUntilConnected("asyncClone")];
case 1:return f.sent(),[4,this.remoteInvoke(!1,p.method_id_MediaStream_t.clone,[])];case 2:return a=f.sent(),console.log(a),c=this.param0(a),d=new b(this,c.oid,l.ProxyMode.Remote),[2,d.syncBarrier()]}})})};b.prototype.clone=function(){g.logger.log(this.user_friendly_id()+".clone() called. [id="+this.id+"]");var a=this.clone_state.clone(),c=new b(this,this.object_id(),l.ProxyMode.Remote);c.id=this.id+"."+a.clone_id.toString();this.tracks_.forEach(function(a){a.addRef()});c.tracks_=this.tracks_;c.clone_state=
a;return c};b.prototype.syncBarrier=function(){var a=this;g.logger.log(this.user_friendly_id()+".syncBarrier() called. [id="+this.id+"]");return new Promise(function(b,c){a.waitUntilConnected("MediaStream.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_MediaStream_t.id,""),a.remoteInvoke(!1,p.method_id_MediaStream_t.active,!1),a.remoteInvoke(!1,p.method_id_MediaStream_t.getTracks,[])])}).then(function(b){g.logger.log(a.user_friendly_id()+".syncBarrier() remote success");
b=b.map(function(b){return a.param0(b)});a.id=b[0];a.active_=b[1];b=b[2];for(var c=[],h=function(b){var h=a.tracks_.find(function(a){return a.object_id()===b.oid});void 0===h&&(g.logger.log(a.user_friendly_id()+" adding a RemoteMediaTrack with oid:"+b.oid),h=new f(a,b.oid));c.push(h.syncBarrier())},d=0;d<b.length;d++)h(b[d]);return Promise.all(c)}).then(function(c){a.tracks_=[];c.forEach(function(b){b.onstop=function(){var b=!0;a.tracks_.forEach(function(a){"ended"!=a.readyState&&(b=!1)});b&&a.release()};
a.tracks_.push(b)});b(a)})["catch"](function(b){a.logRemoteInvokeError(b,".syncBarrier failed!");c()})})};return b}(l.ProxyObject);a.RemoteStream=x;b=function(a){function b(c,d){return a.call(this,c,p.class_id_t.MediaStreamEvent,d,l.ProxyMode.Remote)||this}n(b,a);b.prototype.syncBarrier=function(){var a=this;g.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("MediaStreamEvent.syncBarrier").then(function(){return a.remoteInvoke(!1,p.method_id_MediaStreamEvent_t.stream,
{oid:0})}).then(function(b){return(new x(a,b.params[0].oid,l.ProxyMode.Remote)).syncBarrier()}).then(function(c){a.stream=c;b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");c(b)})})};return b}(l.ProxyObject);a.RemoteStreamEvent=b;var D=function(a){function b(c){return a.call(this,null,p.class_id_t.MediaDeviceInfo,c,l.ProxyMode.Remote)||this}n(b,a);b.prototype.convertKind=function(a){return 0==a?"audioinput":1==a?"audiooutput":"videoinput"};b.prototype.syncBarrier=function(){var a=
this;g.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("RemoteDeviceInfo.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_MediaDeviceInfo_t.deviceId,""),a.remoteInvoke(!1,p.method_id_MediaDeviceInfo_t.kind,0),a.remoteInvoke(!1,p.method_id_MediaDeviceInfo_t.label,""),a.remoteInvoke(!1,p.method_id_MediaDeviceInfo_t.groupId,"")])}).then(function(c){a.kind=a.convertKind(a.param0(c.splice(1,1)[0]));c=c.map(function(b){return a.param0(b)});
a.deviceId=c[0];a.label=c[1];a.groupId=c[2];b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");c(b)})})};return b}(l.ProxyObject);a.RemoteDeviceInfo=D;b=function(b){function c(){var a=b.call(this,null,p.class_id_t.MediaDevices,0,l.ProxyMode.Local,function(){a.setDeviceChangeCallback()})||this;a.devices_=[];a.pendingEnumerateDevice_=[];return a}n(c,b);Object.defineProperty(c.prototype,"panelid",{set:function(a){this.panelid_=a},enumerable:!0,configurable:!0});c.prototype.clearPanelId=
function(){this.panelid_=-1};c.prototype.enumerateDevices=function(){var a=this;return 0<this.devices_.length&&0==this.pendingEnumerateDevice_.length?new Promise(function(b,c){g.logger.log(a.user_friendly_id()+".enumerateDevices: returning cached devices with ids ["+a.devices_.map(function(a){return a.object_id()})+"]");b(a.devices_)}):this.enumerateDevicesPrivate(!1)};c.prototype.postEnumerateDevicesResult=function(){for(var a=!0,b=0,c=0,d=this.pendingEnumerateDevice_;c<d.length;c++){var f=d[c];
if(0==a&&"enumerateDevicesPrivate-remote"==f.name)break;f.postWithResult(!0,this.devices_);b++;a=!1}0<b&&this.pendingEnumerateDevice_.splice(0,b)};c.prototype.enumerateDevicesPrivate=function(b){var c=this;g.logger.log(this.user_friendly_id()+".enumerateDevicesPrivate() called. refresh:"+b+" pending:"+this.pendingEnumerateDevice_.length);return new Promise(function(d,f){1==b||0==c.pendingEnumerateDevice_.length?(c.pendingEnumerateDevice_.push(new l.deferred_action(d,f,"enumerateDevicesPrivate-remote")),
c.waitUntilConnected("RemoteDevices.enumerateDevicesPrivate").then(function(){g.logger.log(c.user_friendly_id()+".enumerateDevicesPrivate() remote invoking...");return c.remoteInvoke(!1,p.method_id_MediaDevices_t.enumerateDevices,[])}).then(function(a){var b=[];a.params[0].forEach(function(a){var d=c.devices_.find(function(b){return b.object_id()===a.oid});void 0===d?(d=new D(a.oid),b.push(d.syncBarrier())):b.push(d)});return Promise.all(b)}).then(function(b){c.devices_.forEach(function(a){for(var c=
!0,d=0;d<b.length;d++){var q=b[d];if(a.object_id()===q.object_id()){c=!1;break}}c&&a.release()});c.devices_=b;a.enumerateddecices=t=b;g.logger.log(c.user_friendly_id()+".enumerateDevicesPrivate: resolving enumerated devices with ids ["+b.map(function(a){return a.object_id()})+"]");c.postEnumerateDevicesResult()})["catch"](function(b){c.devices_=[];a.enumerateddecices=t=[];c.logRemoteInvokeError(b,".enumerateDevicesPrivate() failed, resolving with empty list.");c.postEnumerateDevicesResult()})):(c.pendingEnumerateDevice_.push(new l.deferred_action(d,
f,"enumerateDevicesPrivate")),g.logger.log(c.user_friendly_id()+".enumerateDevicesPrivate() not remoting this call..."))})};c.prototype.getDisplayMedia=function(a){var b=this;return new Promise(function(c,d){b.waitUntilConnected("RemoteDevices.getDisplayMedia").then(function(){return b.IsPanelIdValid()}).then(function(){void 0!==a.video&&null!==a.video&&void 0!==b.panelid_&&(a.video.deviceId=b.panelid_);var c=b.prepareDisplayConstraints(a);return b.remoteInvoke(!1,p.method_id_MediaDevices_t.getDisplayMedia,
c)}).then(function(a){return(new x(null,a.params[0].oid,l.ProxyMode.Remote)).syncBarrier()}).then(function(a){c(a)})["catch"](function(a){a=b.logRemoteInvokeError(a,".getDisplayMedia() failed!");d(a)})})};c.prototype.setDeviceChangeCallback=function(){var a=this;g.logger.log(this.user_friendly_id()+".set_DeviceChangeCallback() called.");this.waitUntilConnected("MediaDevices.ondevicechange").then(function(){var b=a.registerCallbacks(!1,!1,p.method_id_MediaDevices_t.ondevicechange);b.then(function(){g.logger.log(a.user_friendly_id()+
".ondevicechange(): callback received!!!");a.enumerateDevicesPrivate(!0).then(function(){navigator.mediaDevices.dispatchEvent(new CustomEvent("devicechange"))})["catch"](function(){navigator.mediaDevices.dispatchEvent(new CustomEvent("devicechange"))})});return a.remoteInvoke(!0,p.method_id_MediaDevices_t.ondevicechange,b.success)})["catch"](function(b){a.logRemoteInvokeError(b,".set_ondevicechange() failed!")})};c.prototype.prepareDisplayConstraints=function(a){if(k.getRedirector().getFeatureValue(p.FEATURE_ms_teams_common_media_constraints))return a;
var b={frameRate:15,width:{max:1920},height:{max:1080}};void 0!==a.video&&null!==a.video&&(a=a.video,void 0!==a.frameRate&&void 0!==a.width&&void 0!==a.height&&(b.frameRate=a.frameRate,b.width.max=a.width.max||a.width,b.height.max=a.height.max||a.height));return{video:b}};c.prototype.IsPanelIdValid=function(){var a=this;return new Promise(function(b,c){if(-1!==a.panelid_)g.logger.log(a.user_friendly_id()+".IsPanelIdValid() resolving with panelid_:"+a.panelid_),b();else var d=0,f=setInterval(function(){g.logger.log(a.user_friendly_id()+
".IsPanelIdValid() waiting panelid_:"+a.panelid_);50<=d?(c(),clearInterval(f),g.logger.log(a.user_friendly_id()+".IsPanelIdValid(): PanelId is invalid.")):(++d,-1!=a.panelid_&&(b(),clearInterval(f),g.logger.log(a.user_friendly_id()+".IsPanelIdValid(): PanelId is valid.")))},10)})};return c}(l.ProxyObject);a.RemoteDevices=b;b=function(a){function b(){return a.call(this,null,p.class_id_t.NavigatorUserMedia,0,l.ProxyMode.Local)||this}n(b,a);b.getCapabilities=function(a){g.logger.log(this.constructor.name+
".getCapabilities() called:"+a+" caps:"+b.caps_);return b.caps_[a]};b.resetcaps=function(){b.caps_={}};b.prototype.getCapabilities=function(){var a=this;g.logger.log(this.user_friendly_id()+".getCapabilities() called: ");return new Promise(function(c,d){a.waitUntilConnected(a.user_friendly_id()+".getCapabilities").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_NavigatorUserMedia_t.getCapabilities,"audio"),a.remoteInvoke(!1,p.method_id_NavigatorUserMedia_t.getCapabilities,"video")])}).then(function(d){b.caps_.audio=
a.param0(d[0]);b.caps_.video=a.param0(d[1]);c(b.caps_)})["catch"](function(b){b=a.logRemoteInvokeError(b,".getCapabilities() failed!");d(b)})})};b.prototype.setCodecCapabilities=function(a){var b=this;g.logger.log(this.user_friendly_id()+".setCodecCapabilities : set codecCapabilities to "+JSON.stringify(a));return new Promise(function(c,d){b.waitUntilConnected("NavigatorUserMedia.setCodecCapabilities").then(function(){return b.remoteInvoke(!1,p.method_id_NavigatorUserMedia_t.setCodecCapabilities,
a)}).then(function(){g.logger.log(b.user_friendly_id()+".setCodecCapabilities() success.");c(!0);b.getCapabilities()})["catch"](function(a){a=b.logRemoteInvokeError(a,".setCodecCapabilities() failed!");d(a)})})};b.prototype.webkitGetUserMedia=function(a,b,c){return this.getUserMedia(a,b,c)};b.prototype.LogTelemetryDevice_=function(a){try{if("undefined"!==typeof a.audio){var b=a.audio.deviceId,c;t.forEach(function(a){b==a.deviceId&&(c=a.label)});g.logger.log(c);this.SendTelemetryData(v.tel_key_AudioDeviceUsed,
c,0)}if("undefined"!==typeof a.video){var d=a.video.mandatory.sourceId,f;t.forEach(function(a){d==a.deviceId&&(f=a.label)});g.logger.log(f);this.SendTelemetryData(v.tel_key_VideoDeviceUsed,f,0)}}catch(h){g.logger.log(h)}};b.prototype.getUserMedia=function(a,b,c){g.logger.log(this.user_friendly_id()+".getUserMedia() called: "+JSON.stringify(a));return b&&c?this.getUserMedia_v1(a,b,c):this.getUserMedia_v2(a)};b.prototype.getUserMedia_v2=function(a){var b=this;g.logger.log(this.user_friendly_id()+".getUserMedia_v2() called: "+
JSON.stringify(a));return new Promise(function(c,d){b.getUserMediaPrivate(a,function(a){g.logger.log(b.user_friendly_id()+"getUserMedia_v2: resolving stream");c(a)},function(a){g.logger.log(b.user_friendly_id()+"getUserMedia_v2: rejecting stream");d(a)})})};b.prototype.getUserMedia_v1=function(a,b,c){g.logger.log(this.user_friendly_id()+".getUserMedia_v1() called: "+JSON.stringify(a));return this.getUserMediaPrivate(a,b,c)};b.prototype.getUserMediaPrivate=function(a,b,c){var d=this;this.waitUntilConnected("NavigatorUserMedia.getUserMediaPrivate").then(function(){var b=
d.registerCallbacks(!0,!1,p.method_id_NavigatorUserMedia_t.getUserMedia);a&&"undefined"!==typeof a.audio&&0==Object.keys(a.audio).length&&(a.audio={dummy:1});if(a&&"undefined"!==typeof a.video){var c=a.video;void 0==c.mandatory.maxFrameRate&&(c.mandatory.maxFrameRate=30);void 0==c.mandatory.minWidth&&(c.mandatory.minWidth=360);void 0==c.mandatory.maxWidth&&(c.mandatory.maxWidth=1920);void 0==c.mandatory.minHeight&&(c.mandatory.minHeight=180);void 0==c.mandatory.maxHeight&&(c.mandatory.maxHeight=1080)}d.remoteInvoke(!1,
p.method_id_NavigatorUserMedia_t.getUserMedia,a,b.success,b.fail);return b.prom()}).then(function(a){g.logger.log(d.user_friendly_id()+".getUserMediaPrivate: received success callback!");return(new x(null,d.param0(a).oid,l.ProxyMode.Remote)).syncBarrier()}).then(function(f){g.logger.log(d.user_friendly_id()+".getUserMediaPrivate: MediaStream ready to deliver",JSON.stringify(f));0==f.getTracks().length?(g.logger.log(d.user_friendly_id()+".getUserMediaPrivate: reporting no tracks as error."),c({constraintName:"",
name:"OverconstrainedError",message:""})):(d.LogTelemetryDevice_(a),b(f))})["catch"](function(a){d.logRemoteInvokeError(a,".getUserMediaPrivate() failed!");k.getRedirector().getFeatureValue(p.FEATURE_ms_teams_1912)?d.param0&&a?c(d.param0(a)):c({constraintName:"",name:"OverconstrainedError",message:""}):c({constraintName:"",name:"OverconstrainedError",message:""})})};b.prototype.SendTelemetryData=function(a,b,c){k.getRedirector().telemetry.SendTelemetryData(v.tel_cmd.Data,a,b,c)};b.caps_={};return b}(l.ProxyObject);
a.NavigatorUserMedia=b},650:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(946),n=c(550),e=c(9),m=c(851),p=c(550),l=c(394),g;(function(a){a[a.Unknown=0]="Unknown";a[a.Windows=1]="Windows";a[a.Linux=2]="Linux"})(g=a.RemoteType||(a.RemoteType={}));var k=function(){return function(){}}();a.SessionInfo=k;b=function(){function a(){var b=this;this.isremote_=!1;this.isremote_=!0;this.type_=g.Windows;this.address_="0.0.0.0";this.sessioninfo_=null;d.getRedirector().setRemoteSessionInfoCb(function(){return b.remoteSessionInfo()});
this.enginecontrol_=new e.EngineControl}a.prototype.release=function(){d.getRedirector().setRemoteSessionInfoCb(null)};a.prototype.user_friendly_id=function(){return"[RemoteSession]"};a.prototype.getFeatureFlags=function(){var a={};null!==this.enginecontrol_&&null!==this.enginecontrol_.features_&&void 0!==this.enginecontrol_.features_&&this.enginecontrol_.features_.forEach(function(b){a[b.name]=b.value});return a};a.prototype.isFeatureSupported=function(a){if("video"===a)return!0;if(!(a in p.featureNameMap))return!1;
a=p.featureNameMap[a];for(var b=this.getFeatureFlags(),c=0;c<a.length;c++)if(!(a[c]in b)||!0!==b[a[c]])return!1;return!0};a.isFeaturePstnSupported=function(){return a.pstn_};a.isFeatureDtmfSupported=function(){return a.dtmfswitch_};a.isFeaturAppshareSupported=function(){return a.appshare_};a.isFeatureWebrtc1dot0Supported=function(){return a.webrtc1dot0_};a.isFeatureDataChannelSupported=function(){return a.datachannel_};a.isFeatureVdNoBufferLimitSupported=function(){return a.vdnobuflimit_};a.prototype.getSessionInfo=
function(){m.logger.log(this.user_friendly_id()+".getSessionInfo() called.");return null!=this.sessioninfo_?Promise.resolve(this.sessioninfo_):Promise.reject()};a.prototype.remoteSessionInfo=function(){var b=this,c=this;m.logger.log(c.user_friendly_id()+".remoteSessionInfo() called.");return new Promise(function(g,f){c.enginecontrol_.syncBarrier().then(function(d){m.logger.log(c.user_friendly_id()+"enginecontrol info received!");c.sessioninfo_=new k;c.sessioninfo_.type_script=n.HDXMS_VERSION;c.sessioninfo_.webrpc=
d.version_.major.toString()+"."+d.version_.minor.toString()+"."+d.version_.revision.toString()+"."+d.version_.build.toString();if(void 0!=d.versions_&&null!=d.versions_){c.SendTelemetryData(l.tel_key_VerTypeScript,n.HDXMS_VERSION,0);for(var f=0,p=0,C=d.versions_;p<C.length;p++){var r=C[p],r=r.major.toString()+"."+r.minor.toString()+"."+r.revision.toString()+"."+r.build.toString();switch(f){case e.VersionType.Webrpc:c.sessioninfo_.webrpc=r;c.SendTelemetryData(l.tel_key_VerWebrpc,r,0);break;case e.VersionType.WebrtcCodecs:c.sessioninfo_.webrtc_codecs=
r;c.SendTelemetryData(l.tel_key_VerWebrtcCodecs,r,0);break;case e.VersionType.Receiver:c.sessioninfo_.receiver=r;c.SendTelemetryData(l.tel_key_VerReceiver,r,0);break;case e.VersionType.Vda:c.sessioninfo_.vda=r;c.SendTelemetryData(l.tel_key_VerVda,r,0);break;case e.VersionType.Endpoint:c.sessioninfo_.endpoint=r;c.SendTelemetryData(l.tel_key_VerEndpoint,r,0);break;default:m.logger.log(c.user_friendly_id()+"Unknown version type!")}f++}}void 0!=d.osinfo_&&null!=d.osinfo_&&(c.sessioninfo_.osinfo=d.osinfo_,
d.osinfo_.family.includes("Darwin")&&d.osinfo_.edition.includes("Mac")?c.sessioninfo_.clientPlatform="Mac":c.sessioninfo_.clientPlatform=d.osinfo_.family,c.SendTelemetryData(l.tel_key_OSFamily,d.osinfo_.family,0),c.SendTelemetryData(l.tel_key_OSVersion,d.osinfo_.version,0),c.SendTelemetryData(l.tel_key_OSArchitecture,d.osinfo_.architecture,0),c.SendTelemetryData(l.tel_key_OSDistro,d.osinfo_.distro,0),c.SendTelemetryData(l.tel_key_OSEdition,d.osinfo_.edition,0));void 0!=d.endpointid_&&null!=d.endpointid_&&
(c.sessioninfo_.endpointId=d.endpointid_.machine_id);a.pstn_=b.isFeatureSupported(n.Features.FEATURE_public_pstn);a.dtmfswitch_=b.isFeatureSupported(n.Features.FEATURE_public_dtmf);a.appshare_=b.isFeatureSupported(n.Features.FEATURE_public_app_sharing);a.webrtc1dot0_=b.isFeatureSupported(n.Features.FEATURE_public_webrtc1dot0);a.datachannel_=b.isFeatureSupported(n.Features.FEATURE_public_data_channel);a.vdnobuflimit_=b.isFeatureSupported(n.Features.FEATURE_public_vdnobuflimit);g(c.sessioninfo_);c.enginecontrol_.release()})["catch"](function(){d.getRedirector().isPingActive()?
c.retrySessionInfo():(f(),c.enginecontrol_.release(),c.enginecontrol_=null)})})};a.prototype.retrySessionInfo=function(){var a=this;setTimeout(function(){m.logger.log("checking if we are connected...");a.enginecontrol_.bind();d.getRedirector().handleRemoteSessionInfo()},15E3)};a.prototype.SendTelemetryData=function(a,b,c){d.getRedirector().telemetry.SendTelemetryData(l.tel_cmd.Data,a,b,c)};a.pstn_=!1;a.dtmfswitch_=!1;a.appshare_=!1;a.webrtc1dot0_=!1;a.datachannel_=!1;a.vdnobuflimit_=!1;return a}();
a.RemoteSession=b},24:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();Object.defineProperty(a,"__esModule",{value:!0});var n=c(658),e=c(550),m=c(851),p=c(589),l;(function(a){a[a["new"]=
0]="new";a[a.connecting=1]="connecting";a[a.connected=2]="connected";a[a.closed=3]="closed";a[a.max=4]="max"})(l||(l={}));b=function(a){function b(c,d){var g=a.call(this,c,e.class_id_t.RTCSctpTransport,d,n.ProxyMode.Remote)||this;m.logger.log(g.user_friendly_id()+".constructor");return g}d(b,a);b.prototype.syncBarrier=function(){var a=this;m.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("RTCSctpTransport.syncBarrier").then(function(){m.logger.log(a.user_friendly_id()+
".syncBarrierBase success.");return Promise.all([a.remoteInvoke(!1,e.method_id_RTCSctpTransport_t.transport,{}),a.remoteInvoke(!1,e.method_id_RTCSctpTransport_t.state,""),a.remoteInvoke(!1,e.method_id_RTCSctpTransport_t.maxMessageSize,0),a.remoteInvoke(!1,e.method_id_RTCSctpTransport_t.maxChannels,0)])}).then(function(c){var d;d=c.map(function(b){return a.param0(b)});c=d[0];a.sctpstate_=d[1];a.maxMessageSize_=d[2];a.maxChannels_=d[3];d=a.transport_;void 0==c||!1!==c.is_null||null!==a.transport_&&
a.transport_.object_id()==c.oid||(d=new p.DtlsTransport(a,c.oid));d.syncBarrier().then(function(c){m.logger.log(a.user_friendly_id()+"transport.syncBarrier(): success");a.transport_=c;b(a)})["catch"](function(){m.logger.log(a.user_friendly_id()+"transport.syncBarrier(): failed!");a.transport_=null;b(a)})})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");c(b)})})};Object.defineProperty(b.prototype,"transport",{get:function(){m.logger.log(this.user_friendly_id()+".get_transport() called: "+
this.transport_);return this.transport_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"state",{get:function(){m.logger.log(this.user_friendly_id()+".get_state() called: "+this.sctpstate_);return this.sctpstate_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"maxMessageSize",{get:function(){m.logger.log(this.user_friendly_id()+".get_maxMessageSize() called: "+this.maxMessageSize_);return this.maxMessageSize_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"maxChannels",{get:function(){m.logger.log(this.user_friendly_id()+".get_maxChannels() called: "+this.maxChannels_);return this.maxChannels_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onstatechange",{get:function(){m.logger.log(this.user_friendly_id()+".get_onstatechange() called: "+this.onstatechange_);return this.onstatechange_},set:function(a){var c=this;m.logger.log(this.user_friendly_id()+".set_onstatechange() called.");this.onstatechange_=a;this.waitUntilConnected(this.user_friendly_id()+
".onstatechange").then(function(){var d=c.registerCallbacks(!1,c.isNullCallback(a),e.method_id_RTCSctpTransport_t.onstatechange);d.then(function(a){m.logger.log(c.user_friendly_id()+".onstatechange callback received!!!");c.sctpstate_=b.convertState(c.param0(a));m.logger.log(c.user_friendly_id()+"sctpstate_: "+c.sctpstate_);a=new Event("onstatechange");c.onstatechange_(a)});return c.remoteInvoke(!0,e.method_id_RTCSctpTransport_t.onstatechange,d.success)})["catch"](function(){m.logger.log(c.user_friendly_id()+
".onstatechange() failed.")})},enumerable:!0,configurable:!0});b.convertState=function(a){return a==l["new"]?"closed":a==l.connecting?"connecting":a==l.connected?"connected":"closed"};return b}(n.ProxyObject);a.RTCSctpTransport=b;var g;(function(a){a[a.connecting=0]="connecting";a[a.open=1]="open";a[a.closing=2]="closing";a[a.closed=3]="closed"})(g||(g={}));b=function(a){function b(c,d,g){c=a.call(this,c,e.class_id_t.RTCDataChannel,d,g)||this;c.binaryType_="blob";m.logger.log(c.user_friendly_id()+
".constructor");return c}d(b,a);b.prototype.syncBarrier=function(){var a=this;m.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("RtcDataChannel.syncBarrier").then(function(){m.logger.log(a.user_friendly_id()+".syncBarrier remote invoking.");return Promise.all([a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.label,""),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.ordered,!0),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.maxPacketLifeTime,
0),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.maxRetransmits,0),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.protocol,""),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.negotiated,!1),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.id,0),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.readyState,""),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.bufferedAmount,0),a.remoteInvoke(!1,e.method_id_RTCDataChannel_t.bufferedAmountLowThreshold,0)])}).then(function(c){m.logger.log(a.user_friendly_id()+
".syncBarrier success.");var d;c=c.map(function(b){return a.param0(b)});a.label_=c[0];a.ordered_=c[1];a.maxPacketLifeTime_=c[2];a.maxRetransmits_=c[3];a.protocol_=c[4];a.negotiated_=c[5];a.id_=c[6];d=c[7];a.bufferedAmount_=c[8];a.bufferedAmountLowThreshold_=c[9];a.readyState_=a.toRTCDataChannelState(d);b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");c(b)})})};Object.defineProperty(b.prototype,"label",{get:function(){m.logger.log(this.user_friendly_id()+".get_label() called: "+
this.label_);return this.label_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"ordered",{get:function(){m.logger.log(this.user_friendly_id()+".get_ordered() called: "+this.ordered_);return this.ordered_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"maxPacketLifeTime",{get:function(){m.logger.log(this.user_friendly_id()+".get_maxPacketLifeTime() called: "+this.maxPacketLifeTime_);return this.maxPacketLifeTime_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"maxRetransmits",{get:function(){m.logger.log(this.user_friendly_id()+".get_maxRetransmits() called: "+this.maxRetransmits_);return this.maxRetransmits_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"protocol",{get:function(){m.logger.log(this.user_friendly_id()+".get_protocol() called: "+this.protocol_);return this.protocol_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"negotiated",{get:function(){m.logger.log(this.user_friendly_id()+".get_negotiated() called: "+
this.negotiated_);return this.negotiated_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"id",{get:function(){m.logger.log(this.user_friendly_id()+".get_id() called: "+this.id_);return this.id_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"readyState",{get:function(){m.logger.log(this.user_friendly_id()+".get_readyState() called: "+this.readyState_);return this.readyState_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"bufferedAmount",
{get:function(){m.logger.log(this.user_friendly_id()+".get_bufferedAmount() called: "+this.bufferedAmount_);return this.bufferedAmount_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"bufferedAmountLowThreshold",{get:function(){m.logger.log(this.user_friendly_id()+".get_bufferedAmountLowThreshold() called: "+this.bufferedAmountLowThreshold_);return this.bufferedAmountLowThreshold_},set:function(a){m.logger.log(this.user_friendly_id()+".get_bufferedAmountLowThreshold() called: "+
a);this.bufferedAmountLowThreshold_=a},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"binaryType",{get:function(){m.logger.log(this.user_friendly_id()+".get_binaryType() called: "+this.binaryType_);return this.binaryType_},set:function(a){m.logger.log(this.user_friendly_id()+".set_binaryType() called: "+a);this.binaryType_="blob"==a||"arraybuffer"==a?a:"blob"},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onopen",{get:function(){m.logger.log(this.user_friendly_id()+
".get_onopen() called.");return this.onopen_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_onopen() called.");this.onopen_=a;this.waitUntilConnected(this.user_friendly_id()+".onopen").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onopen);c.then(function(a){m.logger.log(b.user_friendly_id()+".onopen callback received!!!");b.syncBarrier().then(function(){m.logger.log(b.user_friendly_id()+".onopen notifying...");var a=new Event("open",
{});Object.defineProperty(a,"target",{writable:!1,value:b});b.onopen_(a)})["catch"](function(){m.logger.log(b.user_friendly_id()+".syncBarrier(): failed!")})});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onopen,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+".onopen() failed.")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onbufferedamountlow",{get:function(){m.logger.log(this.user_friendly_id()+".get_onbufferedamountlow() called.");return this.onbufferedamountlow_},
set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_onbufferedamountlow() called.");this.onbufferedamountlow_=a;this.waitUntilConnected(this.user_friendly_id()+".onbufferedamountlow").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onbufferedamountlow);c.then(function(a){m.logger.log(b.user_friendly_id()+".onbufferedamountlow callback received!!!");a=new Event("onbufferedamountlow");Object.defineProperty(a,"target",{writable:!1,value:b});
b.onbufferedamountlow_(a)});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onbufferedamountlow,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+".onbufferedamountlows() failed.")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onerror",{get:function(){m.logger.log(this.user_friendly_id()+".get_onerror() called.");return this.onerror_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_onerror() called.");this.onerror_=a;this.waitUntilConnected(this.user_friendly_id()+
".onerror").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onerror);c.then(function(a){m.logger.log(b.user_friendly_id()+".onerror callback received!");a=b.param0(a);m.logger.log(b.user_friendly_id()+"error: "+a);a=new Event("onerror");Object.defineProperty(a,"target",{writable:!1,value:b});b.onerror_(a)});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onerror,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+".onerror() failed.")})},
enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onclosing",{get:function(){m.logger.log(this.user_friendly_id()+".get_onclosing() called.");return this.onclosing_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_onclosing() called.");this.onclosing_=a;this.waitUntilConnected(this.user_friendly_id()+".onclosing").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onclosing);c.then(function(a){m.logger.log(b.user_friendly_id()+
".onclosing callback received!!!");a=new Event("onclosing");Object.defineProperty(a,"target",{writable:!1,value:b});b.onclosing_(a)});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onclosing,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+".onclosing() failed.")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onclose",{get:function(){m.logger.log(this.user_friendly_id()+".get_onclose() called.");return this.onclose_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+
".set_onclose() called.");this.onclose_=a;this.waitUntilConnected(this.user_friendly_id()+".onclose").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onclose);c.then(function(a){m.logger.log(b.user_friendly_id()+".onclose callback received!!!");a=new Event("onclose");Object.defineProperty(a,"target",{writable:!1,value:b});b.onclose_(a)});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onclose,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+
".onclose() failed.")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onmessage",{get:function(){m.logger.log(this.user_friendly_id()+".get_onmessage() called.");return this.onmessage_},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_onmessage() called.");this.onmessage_=a;this.waitUntilConnected(this.user_friendly_id()+".onmessage").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),e.method_id_RTCDataChannel_t.onmessage);c.then(function(a){m.logger.log(b.user_friendly_id()+
".onmessage callback received!!!");var c=b.param0(a);a=new Event("onmessage");c.binary?a.data=c.data_ab:(c=atob(c.data_sz),a.data=c);b.onmessage_(a)});return b.remoteInvoke(!0,e.method_id_RTCDataChannel_t.onmessage,c.success)})["catch"](function(){m.logger.log(b.user_friendly_id()+".onmessage() failed.")})},enumerable:!0,configurable:!0});b.prototype.close=function(){var a=this;m.logger.log(this.user_friendly_id()+".close() called.");this.waitUntilConnected("RTCDataChannel.close").then(function(){return a.remoteInvoke(!1,
e.method_id_RTCDataChannel_t.close)}).then(function(){m.logger.log(a.user_friendly_id()+".close: success.")})["catch"](function(){m.logger.log(a.user_friendly_id()+".close: failed.")})};b.prototype.toByteArray=function(a){var b=[];a=new Uint8Array(a instanceof ArrayBuffer?a:a.buffer);for(var c in a)b.push(a[c]);return b};b.prototype.send=function(a){var b=this;m.logger.log(this.user_friendly_id()+".send() called.");this.waitUntilConnected("RTCDataChannel.send").then(function(){if("string"===typeof a)return m.logger.log(b.user_friendly_id()+
"data(string): "+a),b.remoteInvoke(!1,e.method_id_RTCDataChannel_t.send_text,a);if(a instanceof Blob)a.arrayBuffer().then(function(a){a=b.toByteArray(a);return b.remoteInvoke(!1,e.method_id_RTCDataChannel_t.send_binary,a)})["catch"](function(){m.logger.log(b.user_friendly_id()+".arrayBuffer(): failed.")});else{var c=b.toByteArray(a);return b.remoteInvoke(!1,e.method_id_RTCDataChannel_t.send_binary,c)}}).then(function(){m.logger.log(b.user_friendly_id()+".send: success.")})["catch"](function(){m.logger.log(b.user_friendly_id()+
".send: failed.")})};b.prototype.toRTCDataChannelState=function(a){var b="closed";a==g.connecting?b="connecting":a==g.open?b="open":a==g.closing?b="closing":a==g.closed&&(b="closed");return b};return b}(n.ProxyObject);a.RtcDataChannel=b},589:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=
b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}(),e=this&&this.__awaiter||function(a,b,c,d){return new (c||(c=Promise))(function(f,g){function e(a){try{n(d.next(a))}catch(b){g(b)}}function h(a){try{n(d["throw"](a))}catch(b){g(b)}}function n(a){a.done?f(a.value):(new c(function(b){b(a.value)})).then(e,h)}n((d=d.apply(a,b||[])).next())})},k=this&&this.__generator||function(a,b){function c(a){return function(b){return d([a,b])}}function d(c){if(g)throw new TypeError("Generator is already executing.");
for(;f;)try{if(g=1,e&&(h=c[0]&2?e["return"]:c[0]?e["throw"]||((h=e["return"])&&h.call(e),0):e.next)&&!(h=h.call(e,c[1])).done)return h;if(e=0,h)c=[c[0]&2,h.value];switch(c[0]){case 0:case 1:h=c;break;case 4:return f.label++,{value:c[1],done:!1};case 5:f.label++;e=c[1];c=[0];continue;case 7:c=f.ops.pop();f.trys.pop();continue;default:if(!(h=f.trys,h=0<h.length&&h[h.length-1])&&(6===c[0]||2===c[0])){f=0;continue}if(3===c[0]&&(!h||c[1]>h[0]&&c[1]<h[3]))f.label=c[1];else if(6===c[0]&&f.label<h[1])f.label=
h[1],h=c;else if(h&&f.label<h[2])f.label=h[2],f.ops.push(c);else{h[2]&&f.ops.pop();f.trys.pop();continue}}c=b.call(a,f)}catch(q){c=[6,q],e=0}finally{g=h=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}var f={label:0,sent:function(){if(h[0]&1)throw h[1];return h[1]},trys:[],ops:[]},g,e,h,n;$jscomp.initSymbol();$jscomp.initSymbol();$jscomp.initSymbolIterator();return n={next:c(0),"throw":c(1),"return":c(2)},"function"===typeof Symbol&&(n[Symbol.iterator]=function(){return this}),n};Object.defineProperty(a,
"__esModule",{value:!0});var m=c(658),p=c(550),l=c(851),g=c(144),G=c(517),v=c(650),t=function(a){function b(c,d){var f=a.call(this,c,p.class_id_t.RTCDTMFToneChangeEvent,d,m.ProxyMode.Remote)||this;l.logger.log(f.user_friendly_id()+".constructor");return f}d(b,a);b.prototype.syncBarrier=function(){return e(this,void 0,void 0,function(){var a,b,c=this;return k(this,function(d){switch(d.label){case 0:return l.logger.log(this.user_friendly_id()+".syncBarrier() called."),[4,this.waitUntilConnected("DTMFToneChangeEvent.syncBarrier")];
case 1:return d.sent(),[4,Promise.all([this.remoteInvoke(!1,p.method_id_RTCDTMFToneChangeEvent_t.tone,""),this.remoteInvoke(!1,p.method_id_RTCDTMFToneChangeEvent_t.tone_buffer,"")])];case 2:return b=d.sent(),a=b.map(function(a){return c.param0(a)}),this.tone=a[0],this.tone_buffer_=a[1],[2,this]}})})};Object.defineProperty(b.prototype,"tone_buffer",{get:function(){return this.tone_buffer_},enumerable:!0,configurable:!0});return b}(m.ProxyObject);a.DTMFToneChangeEvent=t;var z=function(a){function b(c,
d){var f=a.call(this,c,p.class_id_t.RTCDTMFSender,d,m.ProxyMode.Remote)||this;l.logger.log(f.user_friendly_id()+".constructor");f.canInsertDTMF=!0;f.toneBuffer_="";return f}d(b,a);b.prototype.insertDTMF=function(a,b,c){var d=this;void 0===b&&(b=100);void 0===c&&(c=70);l.logger.log(this.user_friendly_id()+".insertDTMF() called, tones: "+a);this.waitUntilConnected("DtmfSender.insertDTMF").then(function(){return d.remoteInvoke(!1,p.method_id_RTCDTMFSender_t.insertDTMF,a,b,c)}).then(function(){l.logger.log(d.user_friendly_id()+
".insertDTMF() success, tones: "+a)})["catch"](function(a){d.logRemoteInvokeError(a,".insertDTMF() failed!")})};Object.defineProperty(b.prototype,"ontonechange",{get:function(){return this.ontonechange_},set:function(a){var b=this;l.logger.log(this.user_friendly_id()+".set_ontonechange() called.");this.ontonechange_=a;this.waitUntilConnected("DtmfSender.ontonechange").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),p.method_id_RTCDTMFSender_t.ontonechange);c.then(function(a){l.logger.log(b.user_friendly_id()+
".ontonechange callback received!");(new t(b,b.param0(a).oid)).syncBarrier().then(function(a){l.logger.log(b.user_friendly_id()+"tone: "+a.tone+" tone_buffer: "+a.tone_buffer);b.toneBuffer_=a.tone_buffer;b.ontonechange_(a)})["catch"](function(a){b.logRemoteInvokeError(a,".toneEvt.syncBarrier() failed!")})});return b.remoteInvoke(!0,p.method_id_RTCDTMFSender_t.ontonechange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_ontonechange() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,
"toneBuffer",{get:function(){l.logger.log(this.user_friendly_id()+".toneBuffer() called.");return this.toneBuffer_},enumerable:!0,configurable:!0});return b}(m.ProxyObject);a.DtmfSender=z;var u=function(a){function b(c,d){var f=a.call(this,c,p.class_id_t.RTCIceTransport,d,m.ProxyMode.Remote)||this;l.logger.log(f.user_friendly_id()+".constructor");f.selectedPair=null;f.localCandidates_=[];f.remoteCandidates_=[];return f}d(b,a);b.prototype.syncBarrier=function(){var a=this;l.logger.log(this.user_friendly_id()+
".syncBarrier() called.");return new Promise(function(c,d){a.waitUntilConnected("IceTransport.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.role,0),a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.component,0),a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.state,0),a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.gatheringState,0)])}).then(function(d){l.logger.log(a.user_friendly_id()+".syncBarrier success.");var f=0,h=0;d=d.map(function(b){return a.param0(b)});
a.role_=d[0];a.component_=d[1];f=d[2];h=d[3];a.state_=b.convertState(f);a.gatheringState_=b.convertGatheringState(h);c(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");d(b)})})};b.prototype.syncCandidates=function(){var a=this;l.logger.log(this.user_friendly_id()+".syncCandidates() called.");return new Promise(function(b,c){a.waitUntilConnected("IceTransport.syncCandidates").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.localcandidates,
[]),a.remoteInvoke(!1,p.method_id_RTCIceTransport_t.remotecandidates,[])])}).then(function(c){l.logger.log(a.user_friendly_id()+".syncCandidates success.");c=c.map(function(b){return a.param0(b)});a.localCandidates_=c[0];a.remoteCandidates_=c[1];b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncCandidates() failed!");c(b)})})};Object.defineProperty(b.prototype,"role",{get:function(){return this.role_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"component",{get:function(){return this.component_},
enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"State",{get:function(){return this.state_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"gatheringState",{get:function(){return this.gatheringState_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onstatechange",{get:function(){return this.onstatechange_},set:function(a){var c=this;l.logger.log(this.user_friendly_id()+".set_onstatechange() called.");this.onstatechange_=a;this.waitUntilConnected("IceTransport.onstatechange").then(function(){var d=
c.registerCallbacks(!1,c.isNullCallback(a),p.method_id_RTCIceTransport_t.onstatechange);d.then(function(a){l.logger.log(c.user_friendly_id()+".onstatechange callback received!");c.syncCandidates().then(function(a){l.logger.log(c.user_friendly_id()+"received updated ice candidates!")});c.state_=b.convertState(c.param0(a));l.logger.log(c.user_friendly_id()+"state: "+c.state_);c.onstatechange_()});return c.remoteInvoke(!0,p.method_id_RTCIceTransport_t.onstatechange,d.success)})["catch"](function(a){c.logRemoteInvokeError(a,
".set_onstatechange failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"ongatheringstatechange",{get:function(){return this.ongatheringstatechange_},set:function(a){var c=this;l.logger.log(this.user_friendly_id()+".set_ongatheringstatechange() called.");this.ongatheringstatechange_=a;this.waitUntilConnected("IceTransport.ongatheringstatechange").then(function(){var d=c.registerCallbacks(!1,c.isNullCallback(a),p.method_id_RTCIceTransport_t.ongatheringstatechange);d.then(function(a){l.logger.log(c.user_friendly_id()+
".ongatheringstatechange callback received!");c.syncCandidates().then(function(a){l.logger.log(c.user_friendly_id()+"received updated ice candidates!")});c.gatheringState_=b.convertGatheringState(c.param0(a));l.logger.log(c.user_friendly_id()+"gatheringState: "+c.gatheringState_);c.ongatheringstatechange_()});return c.remoteInvoke(!0,p.method_id_RTCIceTransport_t.ongatheringstatechange,d.success)})["catch"](function(a){c.logRemoteInvokeError(a,".set_ongatheringstatechange failed!")})},enumerable:!0,
configurable:!0});Object.defineProperty(b.prototype,"onselectedcandidatepairchange",{get:function(){return this.onselectedcandidatepairchange_},set:function(a){var b=this;l.logger.log(this.user_friendly_id()+".set_onselectedcandidatepairchange() called.");this.onselectedcandidatepairchange_=a;this.waitUntilConnected("IceTransport.onselectedcandidatepairchange").then(function(){var c=b.registerCallbacks(!1,b.isNullCallback(a),p.method_id_RTCIceTransport_t.onselectedcandidatepairchange);c.then(function(a){l.logger.log(b.user_friendly_id()+
".onselectedcandidatepairchange callback received!");b.syncCandidates().then(function(a){l.logger.log(b.user_friendly_id()+"received updated ice candidates!")});b.selectedPair=b.param0(a);l.logger.log(b.user_friendly_id()+"selectedPair: "+b.selectedPair);b.onselectedcandidatepairchange_()});return b.remoteInvoke(!0,p.method_id_RTCIceTransport_t.onselectedcandidatepairchange,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onselectedcandidatepairchange failed!")})},enumerable:!0,configurable:!0});
b.prototype.getLocalCandidates=function(){return this.localCandidates_};b.prototype.getRemoteCandidates=function(){return this.remoteCandidates_};b.prototype.getLocalParameters=function(){return null};b.prototype.getRemoteParameters=function(){return null};b.prototype.getSelectedCandidatePair=function(){return this.selectedPair};b.convertState=function(a){return 0==a?"new":1==a?"checking":2==a?"connected":3==a?"completed":4==a?"failed":5==a?"disconnected":"closed"};b.convertGatheringState=function(a){return 0==
a?"new":1==a?"gathering":"complete"};return b}(m.ProxyObject);a.IceTransport=u;var f;(function(a){a[a["new"]=0]="new";a[a.connecting=1]="connecting";a[a.connected=2]="connected";a[a.closed=3]="closed";a[a.failed=4]="failed";a[a.max=5]="max"})(f||(f={}));var A=function(a){function b(c,d){var f=a.call(this,c,p.class_id_t.RTCDtlsTransport,d,m.ProxyMode.Remote)||this;l.logger.log(f.user_friendly_id()+".constructor");f.state_="new";f.transport_=null;f.remoteCertificates_=[];return f}d(b,a);b.prototype.dumpInfo=
function(){l.logger.log("DtlsTransport["+this.object_id()+"].dumpInfo():");l.logger.log("    - state:"+this.state_);l.logger.log("    - transport:"+this.transport_)};b.prototype.syncBarrier=function(){var a=this;l.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(c,d){a.waitUntilConnected("DtlsTransport.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_RTCDtlsTransport_t.transport,{}),a.remoteInvoke(!1,p.method_id_RTCDtlsTransport_t.state,
0),a.remoteInvoke(!1,p.method_id_RTCDtlsTransport_t.getRemoteCertificates,[])])}).then(function(f){var g;l.logger.log(a.user_friendly_id()+".syncBarrier remote success.");var h;g=f.map(function(b){return a.param0(b)});f=g[0];h=g[1];a.remoteCertificates_=g[2];a.state_=b.convertState(h);g=[];void 0==f||0!=f.is_null||null!==a.transport_&&a.transport_.object_id()==f.oid||(a.transport_=new u(a,f.oid),g.push(a.transport_.syncBarrier()));Promise.all(g).then(function(){l.logger.log(a.user_friendly_id()+".syncBarrier success");
c(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".prop.syncBarrier failed!");d(b)})})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier failed!");d(b)})})};Object.defineProperty(b.prototype,"transport",{get:function(){return this.transport_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"state",{get:function(){l.logger.log(this.user_friendly_id()+".get_state() called: "+this.state_);return this.state_},enumerable:!0,configurable:!0});b.prototype.getRemoteCertificates=
function(){return this.remoteCertificates_};Object.defineProperty(b.prototype,"onstatechange",{get:function(){return this.onstatechange_},set:function(a){var c=this;l.logger.log(this.user_friendly_id()+".set_onstatechange() called.");this.onstatechange_=a;this.waitUntilConnected("DtlsTransport.onstatechange").then(function(){var d=c.registerCallbacks(!1,c.isNullCallback(a),p.method_id_RTCDtlsTransport_t.onstatechange);d.then(function(a){l.logger.log(c.user_friendly_id()+".onstatechange callback received!");
c.state_=b.convertState(c.param0(a));l.logger.log(c.user_friendly_id()+"state_: "+c.state_);c.onstatechange_()});return c.remoteInvoke(!0,p.method_id_RTCDtlsTransport_t.onstatechange,d.success)})["catch"](function(a){c.logRemoteInvokeError(a,".set_onstatechange failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onerror",{get:function(){return this.onerror_},set:function(a){var b=this;l.logger.log(this.user_friendly_id()+".set_onerror() called.");this.onerror_=a;this.waitUntilConnected("DtlsTransport.onerror").then(function(){var c=
b.registerCallbacks(!1,b.isNullCallback(a),p.method_id_RTCDtlsTransport_t.onerror);c.then(function(a){l.logger.log(b.user_friendly_id()+".onerror callback received!");a=b.param0(a);l.logger.log(b.user_friendly_id()+"error: "+a);b.onerror_(a)});return b.remoteInvoke(!0,p.method_id_RTCDtlsTransport_t.onerror,c.success)})["catch"](function(a){b.logRemoteInvokeError(a,".set_onerror failed!")})},enumerable:!0,configurable:!0});b.convertState=function(a){return a==f["new"]?"new":a==f.connecting?"connecting":
a==f.connected?"connected":a==f.closed?"closed":"failed"};return b}(m.ProxyObject);a.DtlsTransport=A;b=function(a){function b(c,d,f,g){c=a.call(this,c,d,f,g)||this;l.logger.log(c.user_friendly_id()+".constructor base");c.track_=null;c.transport_=null;c.rtcpTransport_=null;return c}d(b,a);b.prototype.syncBarrierBase=function(){var a=this;l.logger.log(this.user_friendly_id()+".syncBarrierBase() called.");return new Promise(function(b,c){var d,f,h;a instanceof x?(d=p.method_id_RTCRtpSender_t.track,f=
p.method_id_RTCRtpSender_t.transport,h=p.method_id_RTCRtpSender_t.rtcpTransport):a instanceof D&&(d=p.method_id_RTCRtpReceiver_t.track,f=p.method_id_RTCRtpReceiver_t.transport,h=p.method_id_RTCRtpReceiver_t.rtcpTransport);a.waitUntilConnected("RtpSenderReceiver.syncBarrierBase").then(function(){return v.RemoteSession.isFeaturePstnSupported()&&v.RemoteSession.isFeatureDtmfSupported()?Promise.all([a.remoteInvoke(!1,d,{oid:a.object_id()}),a.remoteInvoke(!1,f,{oid:a.object_id()}),a.remoteInvoke(!1,h,
{oid:a.object_id()})]):Promise.all([a.remoteInvoke(!1,d,{oid:a.object_id()})])}).then(function(d){var h;l.logger.log(a.user_friendly_id()+".syncBarrierBase remote success.");var f;h=d.map(function(b){return a.param0(b)});d=h[0];f=h[1];h=h[2];var e=[];void 0!=d&&!1===d.is_null&&(null===a.track_||a.track_.object_id()!=d.oid?a.track_=new g.RemoteMediaTrack(a,d.oid):a.track_.bind(a,d.oid),e.push(a.track.syncBarrier()));void 0==f||!1!==f.is_null||null!==a.transport_&&a.transport_.object_id()==f.oid||(a.transport_=
new A(a,f.oid),e.push(a.transport_.syncBarrier()));void 0==h||!1!==h.is_null||null!==a.rtcpTransport_&&a.rtcpTransport_.object_id()==h.oid||(a.rtcpTransport_=new A(a,h.oid),e.push(a.rtcpTransport_.syncBarrier()));Promise.all(e).then(function(){l.logger.log(a.user_friendly_id()+".prop.syncBarrierBase success");b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".prop.syncBarrierBase failed!");c(b)})})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrierBase() failed!");c(b)})})};Object.defineProperty(b.prototype,
"transport",{get:function(){l.logger.log(this.user_friendly_id()+".get transport() called.");return this.transport_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"rtcpTransport",{get:function(){l.logger.log(this.user_friendly_id()+".get rtcpTransport() called.");return this.rtcpTransport_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"track",{get:function(){return this.track_},enumerable:!0,configurable:!0});b.prototype.reinitTrack=function(a){this.track_=
a};b.prototype.getStats=function(){l.logger.log(this.user_friendly_id()+".getStats() called.");var a=this;return new Promise(function(b,c){var d=this;a.isRedirected()?a.waitUntilConnected("RtpReceiver.getStats").then(function(){var c;d instanceof x?c=p.method_id_RTCRtpSender_t.getStats:d instanceof D&&(c=p.method_id_RTCRtpReceiver_t.getStats);var h=a.registerCallbacks(!0,!1,c);h.then(function(a){void 0!==a.params&&0!==a.params.length&&b(G.StatsReport.fromJSON(JSON.parse(a.params[0])))});return a.remoteInvoke(!1,
c,h.success)})["catch"](function(a){a=d.logRemoteInvokeError(a,".getStats() failed!");c(a)}):(l.logger.log(a.user_friendly_id()+".getStats(): not in active redirection!"),b())})};return b}(m.ProxyObject);a.RtpSenderReceiver=b;var x=function(a){function b(c,d,f,g){c=a.call(this,c,p.class_id_t.RTCRtpSender,d,f)||this;l.logger.log(c.user_friendly_id()+".constructor");c.dtmf_=null;c.params_=null;c.unified_=g;return c}d(b,a);b.prototype.dumpInfo=function(){l.logger.log("RtpSender["+this.object_id()+"].dumpInfo():");
this.track&&this.track.dumpInfo()};b.prototype.syncBarrier=function(){var b=this;l.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(c,d){b.waitUntilConnected("RtpSender.syncBarrier").then(function(){return a.prototype.syncBarrierBase.call(b)}).then(function(){l.logger.log(b.user_friendly_id()+".syncBarrierBase success.");return v.RemoteSession.isFeaturePstnSupported()&&v.RemoteSession.isFeatureDtmfSupported()?Promise.all([b.remoteInvoke(!1,p.method_id_RTCRtpSender_t.dtmf,
{oid:b.object_id()}),b.remoteInvoke(!1,p.method_id_RTCRtpSender_t.getParameters,{oid:b.object_id()})]):Promise.all([])}).then(function(a){l.logger.log(b.user_friendly_id()+".syncBarrier success.");var d;a=a.map(function(a){return b.param0(a)});d=a[0];b.params_=a[1];void 0==d||!1!==d.is_null||null!==b.dtmf_&&b.dtmf_.object_id()==d.oid||(b.dtmf_=new z(b,d.oid));c(b)})["catch"](function(a){a=b.logRemoteInvokeError(a,".syncBarrier failed!");d(a)})})};b.getCapabilities=function(a){l.logger.log(this.constructor.name+
".getCapabilities() called.");return g.NavigatorUserMedia.getCapabilities(a)};Object.defineProperty(b.prototype,"dtmf",{get:function(){l.logger.log(this.user_friendly_id()+".get dtmf() called.");return this.dtmf_},enumerable:!0,configurable:!0});b.prototype.setParameters=function(a){var b=this;l.logger.log(this.user_friendly_id()+".setParameters() called.");return new Promise(function(c,d){b.waitUntilConnected("RtpSender.setParameters").then(function(){return Promise.all([b.remoteInvoke(!1,p.method_id_RTCRtpSender_t.setParameters,
a)])}).then(function(d){l.logger.log(b.user_friendly_id()+".setParameters(): success.");c();b.params_=a})["catch"](function(a){a=b.logRemoteInvokeError(a,".setParameters() failed!");d(a)})})};b.prototype.getParameters=function(){var a=this;l.logger.log(this.user_friendly_id()+".getParameters() called.");this.waitUntilConnected(this.user_friendly_id()+".getParameters").then(function(){l.logger.log(a.user_friendly_id()+".getParameters() remote invoking");return a.remoteInvoke(!1,p.method_id_RTCRtpSender_t.getParameters,
{oid:a.object_id()})}).then(function(b){l.logger.log(a.user_friendly_id()+".getParameters() success");a.params_=a.param0(b)})["catch"](function(b){a.logRemoteInvokeError(b,".getParameters() failed!")});l.logger.log(this.user_friendly_id()+".getParameters() returning: "+this.params_);return this.params_};b.prototype.replaceTrack=function(a){var b=this;l.logger.log(this.user_friendly_id()+".replaceTrack() called. track_:"+this.track_+", withTrack:"+a);return new Promise(function(c,d){b.waitUntilConnected("RtpSender.replaceTrack").then(function(){if(a)return Promise.all([b.remoteInvoke(!1,
p.method_id_RTCRtpSender_t.replaceTrack,{oid:a.object_id()})]);if(b.unified_)return Promise.all([b.remoteInvoke(!1,p.method_id_RTCRtpSender_t.replaceTrack,{oid:0})]);l.logger.log(b.user_friendly_id()+".replaceTrack(): failed with null track!");d()}).then(function(d){l.logger.log(b.user_friendly_id()+".replaceTrack(): success.");c();b.reinitTrack(a)})["catch"](function(a){a=b.logRemoteInvokeError(a,".replaceTrack() failed!");d(a)})})};return b}(b);a.RtpSender=x;var D=function(a){function b(c,d,f,g,
e){c=a.call(this,c,p.class_id_t.RTCRtpReceiver,d,f)||this;l.logger.log(c.user_friendly_id()+".constructor");c.contribsources_=[];c.syncsources_=[];c.params_=null;c.unified_=g;e&&(c.track_=e);return c}d(b,a);b.prototype.dumpInfo=function(){l.logger.log("RtpReceiver["+this.object_id()+"].dumpInfo():");this.track&&this.track.dumpInfo();this.transport&&this.transport.dumpInfo()};b.prototype.syncBarrier=function(){var b=this;l.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(c,
d){b.waitUntilConnected("RtpReceiver.syncBarrier").then(function(){return a.prototype.syncBarrierBase.call(b)}).then(function(){l.logger.log(b.user_friendly_id()+".syncBarrierBase success.");return v.RemoteSession.isFeaturePstnSupported()&&v.RemoteSession.isFeatureDtmfSupported()?Promise.all([b.remoteInvoke(!1,p.method_id_RTCRtpReceiver_t.getContributingSources,[]),b.remoteInvoke(!1,p.method_id_RTCRtpReceiver_t.getSynchronizationSources,[]),b.remoteInvoke(!1,p.method_id_RTCRtpReceiver_t.getParameters,
{oid:b.object_id()})]):Promise.all([b.remoteInvoke(!1,p.method_id_RTCRtpReceiver_t.getContributingSources,[])])}).then(function(a){l.logger.log(b.user_friendly_id()+".syncBarrier success.");a=a.map(function(a){return b.param0(a)});b.contribsources_=a[0];b.syncsources_=a[1];b.params_=a[2];c(b)})["catch"](function(a){a=b.logRemoteInvokeError(a,".syncBarrier() failed!");d(a)})})};b.getCapabilities=function(a){l.logger.log(this.constructor.name+".getCapabilities() called.");return g.NavigatorUserMedia.getCapabilities(a)};
b.prototype.getContributingSources=function(){var a=this;l.logger.log(this.user_friendly_id()+".getContributingSources() called. "+JSON.stringify(this.contribsources_));this.waitUntilConnected("RtpReceiver.getContributingSources").then(function(){return Promise.all([a.remoteInvoke(!1,p.method_id_RTCRtpReceiver_t.getContributingSources,[])])}).then(function(b){a.contribsources_=b.map(function(b){return a.param0(b)})[0];l.logger.log(a.user_friendly_id(),".getContributingSources() success: "+JSON.stringify(a.contribsources_))})["catch"](function(b){a.logRemoteInvokeError(b,
".getContributingSources() failed!");a.contribsources_=[]});return this.contribsources_};b.prototype.getParameters=function(){l.logger.log(this.user_friendly_id()+".getParameters() called.");return this.params_};b.prototype.getSynchronizationSources=function(){l.logger.log(this.user_friendly_id()+".getSynchronizationSources() called.");return this.syncsources_};return b}(b);a.RtpReceiver=D},377:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||{__proto__:[]}instanceof
Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();Object.defineProperty(a,"__esModule",{value:!0});var e=c(658),k=c(550),m=c(851),p=c(589);b=function(){function a(){this.direction="sendrecv";this.sendEncodings=[];this.streams=[];m.logger.log(this.user_friendly_id()+".constructor")}a.prototype.user_friendly_id=
function(){return this.constructor.name};return a}();a.RtpTransceiverInit=b;var l;(function(a){a[a.kSendRecv=0]="kSendRecv";a[a.kSendOnly=1]="kSendOnly";a[a.kRecvOnly=2]="kRecvOnly";a[a.kInactive=3]="kInactive"})(l||(l={}));b=function(a){function b(c,d,I,u,f,A){c=a.call(this,c,k.class_id_t.RTCRtpTransceiver,d,I)||this;m.logger.log(c.user_friendly_id()+".constructor");c.unified_=u;c.sender_=new p.RtpSender(c,0,e.ProxyMode.Pseudo,u);c.receiver_=A?A:new p.RtpReceiver(c,0,e.ProxyMode.Pseudo,u);f?(c.direction_=
c.toRtpTransceiverDirection(f),c.currentDirection_=c.toRtpTransceiverDirection(f)):(c.direction_=l.kSendRecv,c.currentDirection_=l.kSendRecv);return c}d(b,a);b.prototype.dumpInfo=function(){m.logger.log(this.user_friendly_id()+".dumpInfo() [id="+this.mid+"] direction="+this.toRTCRtpTransceiverDirection(this.direction_)," currentDirection="+this.toRTCRtpTransceiverDirection(this.currentDirection_));this.sender&&this.sender.dumpInfo();this.receiver&&this.receiver.dumpInfo()};b.prototype.syncBarrier=
function(){var a=this;m.logger.log(this.user_friendly_id()+".syncBarrier() called.");return new Promise(function(b,c){a.waitUntilConnected("RtpTransceiver.syncBarrier").then(function(){return Promise.all([a.remoteInvoke(!1,k.method_id_RTCRtpTransceiver_t.mid,{oid:a.object_id()}),a.remoteInvoke(!1,k.method_id_RTCRtpTransceiver_t.direction,{oid:a.object_id()}),a.remoteInvoke(!1,k.method_id_RTCRtpTransceiver_t.currentDirection,{oid:a.object_id()}),a.remoteInvoke(!1,k.method_id_RTCRtpTransceiver_t.sender,
{oid:a.object_id()}),a.remoteInvoke(!1,k.method_id_RTCRtpTransceiver_t.receiver,{oid:a.object_id()})])}).then(function(c){var d;m.logger.log(a.user_friendly_id()+".syncBarrier remote success.");d=c.map(function(b){return a.param0(b)});a.mid_=d[0];a.direction_=d[1];a.currentDirection_=d[2];c=d[3];d=d[4];var e=[];void 0!=c&&!1===c.is_null&&(a.sender_.bind(a,c.oid),e.push(a.sender_.syncBarrier()));void 0!=d&&!1===d.is_null&&(a.receiver_.bind(a,d.oid),e.push(a.receiver_.syncBarrier()));if(0==e.length)m.logger.log(a.user_friendly_id()+
".syncBarrier success"),b(a);else return m.logger.log(a.user_friendly_id()+".prop.syncBarrier start"),Promise.all(e)}).then(function(){m.logger.log(a.user_friendly_id()+".syncBarrier success");b(a)})["catch"](function(b){b=a.logRemoteInvokeError(b,".syncBarrier() failed!");c(b)})})};Object.defineProperty(b.prototype,"mid",{get:function(){m.logger.log(this.user_friendly_id()+".get_mid() called: "+this.mid_);return this.mid_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"sender",
{get:function(){return this.sender_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"receiver",{get:function(){return this.receiver_},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"direction",{get:function(){m.logger.log(this.user_friendly_id()+".get_direction() called. "+this.toRTCRtpTransceiverDirection(this.direction_));return this.toRTCRtpTransceiverDirection(this.direction_)},set:function(a){var b=this;m.logger.log(this.user_friendly_id()+".set_direction() called. "+
a);this.direction_=this.toRtpTransceiverDirection(a);this.waitUntilConnected("RtpTransceiver.set_direction").then(function(){return b.remoteInvoke(!0,k.method_id_RTCRtpTransceiver_t.direction,b.toRtpTransceiverDirection(a))}).then(function(){m.logger.log(b.user_friendly_id()+".set_direction: success.")})["catch"](function(a){b.logRemoteInvokeError(a,".set_direction() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"currentDirection",{get:function(){m.logger.log(this.user_friendly_id()+
".get_currentDirection() called. "+this.toRTCRtpTransceiverDirection(this.direction_));return this.toRTCRtpTransceiverDirection(this.currentDirection_)},enumerable:!0,configurable:!0});b.prototype.stop=function(){var a=this;m.logger.log(this.user_friendly_id()+".stop() called.");this.waitUntilConnected("RtpTransceiver.stop").then(function(){return a.remoteInvoke(!0,k.method_id_RTCRtpTransceiver_t.stop)}).then(function(){m.logger.log(a.user_friendly_id()+".stop: success.")})["catch"](function(b){a.logRemoteInvokeError(b,
".stop() failed!")})};b.prototype.setCodecPreferences=function(a){var b=this;m.logger.log(this.user_friendly_id()+".setCodecPreferences() called.");this.waitUntilConnected("RtpTransceiver.setCodecPreferences").then(function(){return b.remoteInvoke(!0,k.method_id_RTCRtpTransceiver_t.setCodecPreferences,a)}).then(function(){m.logger.log(b.user_friendly_id()+".setCodecPreferences: success.")})["catch"](function(a){b.logRemoteInvokeError(a,".setCodecPreferences() failed!")})};b.prototype.toRtpTransceiverDirection=
function(a){var b=l.kSendRecv;switch(a){case "inactive":b=l.kInactive;break;case "recvonly":b=l.kRecvOnly;break;case "sendonly":b=l.kSendOnly;break;case "sendrecv":b=l.kSendRecv;break;default:b=l.kInactive}return b};b.prototype.toRTCRtpTransceiverDirection=function(a){var b="sendrecv";switch(a){default:b="inactive";break;case l.kRecvOnly:b="recvonly";break;case l.kSendOnly:b="sendonly";break;case l.kSendRecv:b="sendrecv"}return b};return b}(e.ProxyObject);a.RtpTransceiver=b},509:function(b,a){Object.defineProperty(a,
"__esModule",{value:!0});(function(a){a[a.Unknown=0]="Unknown";a[a.Cap=1]="Cap";a[a.GetSources=2]="GetSources";a[a.SetActive=3]="SetActive";a[a.TopologyChanged=4]="TopologyChanged"})(a.sshare_cmd||(a.sshare_cmd={}));(function(a){a[a.Unknown=0]="Unknown";a[a.Initialized=1]="Initialized";a[a.Error=2]="Error"})(a.sshare_state||(a.sshare_state={}));var c=function(){function a(){}a.prototype.onInitialized=function(a){};a.prototype.onInitComplete=function(){};a.prototype.onError=function(a){};a.prototype.onGetSources=
function(a,b){};a.prototype.onSetActive=function(a,b){};a.prototype.onToplogyChanged=function(){};return a}();a.ScreenShareUtil=c},517:function(b,a){Object.defineProperty(a,"__esModule",{value:!0});var c=function(){function a(){this.items=[]}a.fromJSON=function(b){for(var c=new a,e=0;e<b.length;e++){var l=d.fromJSON(b[e]);c.items.push(l)}return c};a.toRTCStatsReport=function(a){return a};a.prototype.toJSON=function(){return JSON.stringify(this.items)};a.prototype.result=function(){return this.items};
return a}();a.StatsReport=c;var d=function(){function a(){this.names_=[];this.stat_=new Map;this.id="";this.timestamp=0;this.type=""}a.fromJSON=function(b){var c=new a;c.id=b.id||"";c.timestamp=b.timestamp||"";c.type=b.type||"";Object.keys(b).forEach(function(a){"id"!==a&&"timestamp"!==a&&"type"!==a&&(c.names_.push(a),c.stat_.set(a,b[a]))});return c};a.prototype.toJSON=function(){return JSON.stringify({id:this.id,timestamp:this.timestamp,type:this.type,stat:this.stat_})};a.prototype.names=function(){return this.names_};
a.prototype.stat=function(a){return this.stat_.get(a)};return a}();a.Stats=d},394:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(946),e=c(851);(function(a){a[a.unknown=0]="unknown";a[a.active=1]="active";a[a.idle=2]="idle"})(a.tel_CallState||(a.tel_CallState={}));(function(a){a[a.unknown=0]="unknown";a[a.incoming=1]="incoming";a[a.outgoing=2]="outgoing"})(a.tel_CallDirection||(a.tel_CallDirection={}));(function(a){a[a.unknown=0]="unknown";a[a.audio=1]="audio";a[a.video=2]=
"video";a[a.multi=3]="multi";a[a.dshare=4]="dshare"})(a.tel_CallType||(a.tel_CallType={}));var k;(function(a){a[a.Unknown=0]="Unknown";a[a.Cap=1]="Cap";a[a.Init=2]="Init";a[a.Data=3]="Data"})(k=a.tel_cmd||(a.tel_cmd={}));a.tel_key_ConferenceCallDuration="ConferenceCallDuration";a.tel_key_AudioCallDuration="AudioCallDuration";a.tel_key_VideoCallDuration="VideoCallDuration";a.tel_key_ScreensharingCallDuration="ScreensharingCallDuration";a.tel_key_CallEstIncoming="CallEstIncoming";a.tel_key_CallEstOutgoing=
"CallEstOutgoing";a.tel_key_AudioDeviceUsed="AudioDeviceUsed";a.tel_key_VideoDeviceUsed="VideoDeviceUsed";a.tel_key_SpeakerDeviceUsed="SpeakerDeviceUsed";a.tel_key_PerfCallDirection="PerfCallDirection";a.tel_key_PerfCallState="PerfCallState";a.tel_key_PerfCallType="PerfCallType";a.tel_key_VerWebrpc="VerWebrpc";a.tel_key_VerWebrtcCodecs="VerWebrtcCodecs";a.tel_key_VerReceiver="VerReceiver";a.tel_key_VerVda="VerVda";a.tel_key_VerEndpoint="VerEndpoint";a.tel_key_VerTypeScript="VerTypeScript";a.tel_key_OSFamily=
"OSFamily";a.tel_key_OSVersion="OSVersion";a.tel_key_OSArchitecture="OSArchitecture";a.tel_key_OSDistro="OSDistro";a.tel_key_OSEdition="OSEdition";var m=function(){function a(b,c,d,e){this.cmd=b;this.key=c;this.value=d;this.flags=e}a.prototype.SendTelemetryData=function(a){a.SendTelemetryData(this.cmd,this.key,this.value,this.flags)};return a}();b=function(){function a(){this.id=0;this.deferredData=[]}a.prototype.reset=function(){this.id=0;this.deferredData=[]};a.prototype.onInitialized=function(a){for(this.id=
a;this.deferredData&&0<this.deferredData.length;)this.deferredData.shift().SendTelemetryData(this)};a.prototype.SendTelemetryInit=function(){0<this.id&&this.reset();try{d.getRedirector().WSSendObject({v:"telemetry",hdr:{command:k.Init,id:0},init:{domain:"HDXMM Teams",subdomain:"Teams",feature:"msteams",version:"1.1.1.1"}})}catch(a){e.logger.log(a)}};a.prototype.SendTelemetryData=function(a,b,c,p){if(a!=k.Data)e.logger.log("invalid telemetry command!");else if(0==this.id)this.deferredData.push(new m(a,
b,c,p));else try{d.getRedirector().WSSendObject({v:"telemetry",hdr:{command:a,id:this.id},data:{key:b,value:c,flags:p}})}catch(t){e.logger.log(t)}};return a}();a.Telemetry=b},307:function(b,a,c){var d=c(550).Features,e=c(360),k=c(144),m=c(679),p=c(945),l=c(368),g=c(851).logger,G=c(650),v=c(247).gc,t=c(946);(function(a,b){a.CitrixWebRTC=b()})("undefined"!==typeof self?self:this,function(){function a(b){t.getRedirector().SendTelemetryData_Speaker(b)}function b(){var a=window.getCitrixWebrtcRedir;void 0!==
a?a().then(function(a){g.log("sucesss on connect, getCitrixWebrtcRedir reg value:"+a);"1"===a&&null===F&&(g.log("supported client"),F=new G.RemoteSession)})["catch"](function(){g.log("Failure to Read Webrtc redir Reg Key");A()}):(g.log("window.getCitrixWebrtcRedir() method is not available yet"),A())}function c(a){if("1"===a)g.log("Supported client"),t.getRedirector().pingConnectionBegin(!0);else if("0"===a){g.log("VDI Event: Unsupported client reported");try{H({event:"vdiClientDisconnected",reason:"endpointUnsupported",
msg:"Unsupported endpoint connected"})}catch(b){g.log("onVMEvent(): exception: "+b.message)}}else g.log("Citrix Webrtc Redir Reg Key value is incorrect")}function A(){!1===J&&(g.log("starting MS Reg retry..."),J=!0,x(10))}function x(a){if(0>=a){J=!1;g.log("VDI Event: Reg Key not Updated after timer reported, Fallback");try{H({event:"vdiClientDisconnected",reason:"failure",msg:"Citrix Webrtc Redir Reg Key not Present"})}catch(b){g.log("onVMEvent(): exception: "+b.message)}}else{var d=window.getCitrixWebrtcRedir;
void 0!==d?d().then(function(b){g.log("CitrixMSTeamsRedir reg value:"+b);"0"===b||"1"===b?(c(b),J=!1):(g.log("MS Teams Redir Reg key not updated - Start timer"),setTimeout(function(){g.log("Timer waiting for registry to be updated count :"+a);x(--a)},1E3))})["catch"](function(){g.log("Failure to Read MS Teams redir Reg Key - Start timer");setTimeout(function(){g.log("Timer waiting for registry to be updated count :"+a);x(--a)},1E3)}):(g.log("window.getCitrixWebrtcRedir() method is not available yet"),
setTimeout(function(){g.log("Timer waiting for registry to be updated count :"+a);x(--a)},1E3))}}function D(){g.log("VDI: sendSessionInfo");F&&F.getSessionInfo().then(function(a){g.log("getSessionInfo success! info:"+JSON.stringify(a));try{H({event:"vdiClientConnected",version:a})}catch(b){g.log("onVMEvent(): exception: "+b.message)}})["catch"](function(){g.log("getSessionInfo failure! session is not fully connected yet...")})}var C=e.PeerConnection,r=new k.NavigatorUserMedia,q=k.NavigatorUserMedia.getCapabilities,
w=new k.RemoteDevices,B=new l.FrameTracker,y=0,H=window.VMEventCallback,h=!1;window.onVdiClientDisconnected=function(a){g.log("VDI Event: vdiClientDisconnected");g.log("VDI : cleanup");t.getRedirector().clearReqs();k.NavigatorUserMedia.resetcaps();B=w=r=null;F&&F.release();F=null;v.reset();g.log("VDI : cleanup done");if(!0===a&&!1===h){g.log("VDI Event: vdiClientDisconnected with failure reported");h=!0;try{H({event:"vdiClientDisconnected",reason:"failure",msg:"Websocket Connection Failure"})}catch(b){g.log("onVMEvent(): exception: "+
b.message)}}else{h=!1;try{H({event:"vdiClientDisconnected",reason:"endpointDisconnected"})}catch(b){g.log("onVMEvent(): exception: "+b.message)}}};var F=new G.RemoteSession;window.onVdiClientDisconnectedTimer=function(){g.log("VDI Event: onVdiClientDisconnectedTimer");null===F&&(F=new G.RemoteSession)};window.onVdiClientConnected=function(){g.log("VDI Event: vdiClientConnected");l.FrameTracker.sendOverlayInfo();null!==w&&w.isValid()||(w=new k.RemoteDevices);null!==r&&r.isValid()||(r=new k.NavigatorUserMedia);
r.getCapabilities().then(function(a){g.log(".getCapabilities() success "+a)})["catch"](function(){g.log(".getCapabilities() failure")});D();navigator.mediaDevices.dispatchEvent(new CustomEvent("devicechange"))};var J=!1;return{Features:d,CitrixPeerConnection:C,getUserMedia:function(a,c,d){b();g.log("VDI Shim getUserMedia");null!==r&&r.isValid()||(r=new k.NavigatorUserMedia);return r.webkitGetUserMedia(a,c,d)},getDisplayMedia:function(a){b();g.log("VDI Shim getDisplayMedia");null!==w&&w.isValid()||
(w=new k.RemoteDevices);return w.getDisplayMedia(a)},enumerateDevices:function(){b();null!==w&&w.isValid()||(w=new k.RemoteDevices);return w.enumerateDevices()},mapVideoElement:function(a){g.log("VDI New Video Element Created, Creating Mapping to VDA");null===B&&(B=new l.FrameTracker);void 0!==a.remoteVideoElement?g.log("Video element is already configured!"):(b(),Object.defineProperty(a,"remoteVideoElement",{writable:!0,value:null}),a.id||(a.id="ctx-vid-"+y++),a.remoteVideoElement=new m.VideoElement(a.id),
a.remoteVideoElement.onloadedmetadata=function(){var b=new Event("loadedmetadata");a.dispatchEvent(b)},a.remoteVideoElement.ontimeupdate=function(){var b=new Event("timeupdate");a.dispatchEvent(b)},a.remoteVideoElement.onconnectionstatechange=function(){"connected"===a.remoteVideoElement.connectionState?B.track(a,function(b){a.remoteVideoElement.setFrame(b)}):B.untrack(a)},Object.defineProperty(a,"sinkId",{get:function(){return a.remoteVideoElement.sinkId},set:function(b){g.log("VDI Shim set video element SinkId value = "+
b);a.remoteVideoElement.sinkId=b}}),Object.defineProperty(a,"srcObject",{get:function(){return a.remoteVideoElement.srcObject},set:function(b){g.log("VDI Shim set video element srcObject");a.remoteVideoElement.srcObject=b}}),Object.defineProperty(a,"videoWidth",{get:function(){return a.remoteVideoElement.videoWidth}}),Object.defineProperty(a,"videoHeight",{get:function(){return a.remoteVideoElement.videoHeight}}))},mapAudioElement:function(c){g.log("VDI New Audio Element Created, Creating Mapping to VDA");
if(void 0!==c.remoteAudioElement)g.log("Audio element is already configured!");else{b();Object.defineProperty(c,"remoteAudioElement",{writable:!0,value:null});c.remoteAudioElement=new p.AudioElement;var d=c.remoteAudioElement.play;c.play=function(){g.log("VDI Shim remote audio play");return d.apply(c.remoteAudioElement,arguments)};var h=c.remoteAudioElement.pause;c.pause=function(){g.log("VDI Shim remote audio pause");return h.apply(c.remoteAudioElement,arguments)};Object.defineProperty(c,"sinkId",
{get:function(){return c.remoteAudioElement.sinkId},set:function(a){g.log("VDI Shim set audio element SinkId value = "+a);c.setSinkId(a).then(function(){g.log("VDI Shim set audio element SinkId success")})["catch"](function(){g.log("VDI Shim set audio element SinkId failure")})}});c.setSinkId=function(b){g.log("VDI Shim set audio element SinkId value = "+b);var d=c.remoteAudioElement.setSinkId(b),h;k.enumerateddecices.forEach(function(a){b===a.deviceId&&(h=a.label)});a(h);return d};Object.defineProperty(c,
"srcObject",{get:function(){return c.remoteAudioElement.srcObject},set:function(a){g.log("VDI Shim set audio element srcObject "+JSON.stringify(a));c.remoteAudioElement.srcObject=a}})}},setVMEventCallback:function(a){H=a;t.getRedirector().isConnected()&&!window.VMEventCallback&&D();window.VMEventCallback=null;g.log("VDI Event Callback Set")},addClipRect:function(a){g.log("VDI Adding Occlusion "+JSON.stringify(a));null===B&&(B=new l.FrameTracker);B.addOcclusion(a)},removeClipRect:function(a){g.log("VDI Removing Occlusion "+
JSON.stringify(a));null===B&&(B=new l.FrameTracker);B.removeOcclusion(a)},initLog:function(a){g.setMSLogger(a);g.log("VDI init logger")},isFeatureOn:function(a){return null===F?!1:F.isFeatureSupported(a)},onConnectionChange:function(a){g.log("VDI : onConnectionChange to "+a);!1===a?g.log("Disconnecting from the VDA"):(g.log("Connecting to the VDA"),a=window.getCitrixWebrtcRedir,void 0!==a?a().then(function(a){g.log("Sucesss on connect, CitrixMSTeamsRedir reg value:"+a);"0"===a||"1"===a?c(a):(g.log("MS Teams Redir Reg key not updated yet"),
A())})["catch"](function(){g.log("Failure to Read MS Teams redir Reg Key");A()}):(g.log("window.getCitrixWebrtcRedir() method is not available yet"),A()))},setCodecCapabilities:function(a){g.log("VDI Shim setCodecCapabilities");null!==r&&r.isValid()||(r=new k.NavigatorUserMedia);return r.setCodecCapabilities(a)},createMediaStream:function(a){g.log("VDI Shim createMediaStream");b();return new k.RemoteStream(null,0,0,a)},getCapabilities:function(a){b();g.log("VDI Shim getCapabilities");null!==r&&r.isValid()||
(r=new k.NavigatorUserMedia,q=k.NavigatorUserMedia.getCapabilities);return q.apply(r,arguments)},destroyVideoElement:function(a,b){g.log("VDI Shim destroyVideoElement: ");if(a){var c=a.remoteVideoElement;c&&c.dispose();a.remoteVideoElement=void 0}},destroyAudioElement:function(a,b,c){g.log("VDI Shim destroyAudioElement: ");a&&((b=a.remoteAudioElement)&&b.dispose(),a.remoteAudioElement=void 0)}}})},679:function(b,a,c){var d=this&&this.__extends||function(){var a=function(b,c){a=Object.setPrototypeOf||
{__proto__:[]}instanceof Array&&function(a,b){a.__proto__=b}||function(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])};return a(b,c)};return function(b,c){function d(){this.constructor=b}a(b,c);b.prototype=null===c?Object.create(c):(d.prototype=c.prototype,new d)}}();Object.defineProperty(a,"__esModule",{value:!0});var e=c(658),k=c(550),m=c(851),p=c(946),l=c(550),g=function(){return function(a){this.x=Math.round(a.x)*window.devicePixelRatio;this.y=Math.round(a.y)*window.devicePixelRatio;this.width=
Math.round(a.width)*window.devicePixelRatio;this.height=Math.round(a.height)*window.devicePixelRatio}}();a.VideoRect=g;var G;(function(a){a[a.pixels=0]="pixels";a[a.percent=1]="percent"})(G||(G={}));var v=function(){function a(b){this.value=parseInt(b);this.units=this.detectUnits(b)}a.prototype.detectUnits=function(a){return-1===a.toLowerCase().indexOf("px")?G.pixels:G.percent};return a}(),t;(function(a){a[a.fill=0]="fill";a[a.contain=1]="contain";a[a.cover=2]="cover"})(t||(t={}));var z=function(){return function(a,
b){this.x=a;this.y=b}}(),u=function(){function a(b,c,d){this.fit=this.convertFit(b);this.position=new z(c,d)}a.prototype.convertFit=function(a){return"fill"==a?t.fill:"contain"==a?t.contain:"cover"==a?t.cover:t.fill};return a}();b=function(a){function b(c){var d=a.call(this,null,k.class_id_t.VideoElement,0,e.ProxyMode.Local)||this;d.srcObject_=null;d.sinkId_="";d.videoWidth=0;d.videoHeight=0;d.isLoaded=!1;d.connectionState="disconnected";d.styleObserver=null;d.pendingRelease_=!1;d.activeConnectionEvent_=
null;d.connectionEventQueue_=[];d.elementId=c;return d}d(b,a);b.prototype.dispose=function(){m.logger.log("VideoElement.dispose (elementId: "+this.elementId+" oid: "+this.object_id()+")");this.pendingRelease_=!0;this.srcObject=this.ontimeupdate=this.onloadedmetadata=null};b.prototype.setState=function(a){this.connectionState=a;if(this.onconnectionstatechange_)this.onconnectionstatechange_()};Object.defineProperty(b.prototype,"sinkId",{get:function(){return this.sinkId_},set:function(a){var b=this;
this.waitUntilConnected("VideoElement.sinkId").then(function(){return b.remoteInvoke(!0,k.method_id_VideoElement_t.sinkId,a)}).then(function(){b.sinkId_=a})["catch"](function(a){b.logRemoteInvokeError(a,".set_sinkId() failed!")})},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"srcObject",{get:function(){return this.srcObject_},set:function(a){m.logger.log(this.user_friendly_id()+".srcObject: set srcObject... this.srcObject:"+this.srcObject+" obj:"+a);if(this.srcObject_!==a){var b=
p.getRedirector().getFeatureValue(l.FEATURE_ms_teams_1911);null!==this.srcObject_&&(null===a&&b&&this.disconnect(),b||this.disconnect(),this.isLoaded=!1);this.srcObject_=a;null!==this.srcObject_&&this.connectTo(this.srcObject_)}},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onconnectionstatechange",{get:function(){return this.onconnectionstatechange_},set:function(a){m.logger.log(this.user_friendly_id()+".set_onconnectionstatechange() called.");this.onconnectionstatechange_=
a},enumerable:!0,configurable:!0});Object.defineProperty(b.prototype,"onloadedmetadata",{set:function(a){m.logger.log(this.user_friendly_id()+".set_onloadedmetadata() called.");this.onloadedmetadata_=a},enumerable:!0,configurable:!0});b.prototype.setupOnVideoFrameChanged=function(){var a=this,b=this.registerCallbacks(!1,!1,k.method_id_VideoElement_t.onvideoframechanged);b.then(function(b){m.logger.log(a.user_friendly_id()+".onvideoframechanged",b.params);a.videoWidth=b.params[0]||0;a.videoHeight=
b.params[1]||0;a.isLoaded||(a.isLoaded=!0,a.onloadedmetadata_&&a.onloadedmetadata_())});this.remoteInvoke(!0,k.method_id_VideoElement_t.onvideoframechanged,b.success)};b.prototype.processConnectionEvent=function(){var a=this;if(0!==this.connectionEventQueue_.length&&!this.activeConnectionEvent_){var b=this.connectionEventQueue_.pop();"connectTo"==b.operation?this.activeConnectionEvent_=this.connectToAsync(b.param):"disconnect"==b.operation&&(this.activeConnectionEvent_=this.disconnectAsync());this.activeConnectionEvent_.then(function(){a.activeConnectionEvent_=
void 0;a.processConnectionEvent()})["catch"](function(){m.logger.log(a.user_friendly_id()+" : Failed to handle connection event! ");a.activeConnectionEvent_=void 0;a.processConnectionEvent()})}};b.prototype.connectTo=function(a){this.connectionEventQueue_.push({operation:"connectTo",param:a});this.processConnectionEvent()};b.prototype.disconnect=function(){this.connectionEventQueue_.push({operation:"disconnect",param:null});this.processConnectionEvent()};b.prototype.connectToAsync=function(a){var b=
this;return new Promise(function(c,d){m.logger.log(b.user_friendly_id()+".connectTo: connect media stream with id = "+a.id+", clone_id = "+a.clone_state.clone_id);b.streamId_=a.id;b.waitUntilConnected("VideoElement.connectTo").then(function(){return a.waitUntilConnected("MediaStream.connectTo")}).then(function(){b.setupOnVideoFrameChanged();return a.clone_state.synchronize(a)}).then(function(a){m.logger.log(b.user_friendly_id()+".connectTo: remote invoking");var c=b.registerCallbacks(!0,!1,k.method_id_VideoElement_t.connectTo);
return Promise.all([b.remoteInvoke(!1,k.method_id_VideoElement_t.connectTo,{oid:a.object_id()},c.success,c.fail),c.prom()])}).then(function(a){m.logger.log(b.user_friendly_id()+".connectTo: remote media stream is connected!");b.setState("connected");b.watch();b.updateTimer=setInterval(function(){b.ontimeupdate&&b.ontimeupdate()},250);(a=window.document.getElementById(b.elementId))&&b.updateStyle(a);c()})["catch"](function(a){b.logRemoteInvokeError(a,".connectTo: failed to connect!");d()})})};b.prototype.disconnectAsync=
function(){var a=this;return new Promise(function(b,c){m.logger.log(a.user_friendly_id()+".disconnect: disconnecting stream : "+a.streamId_);a.unwatch();a.waitUntilConnected("VideoElement.disconnect").then(function(){a.updateTimer&&clearInterval(a.updateTimer);var b=a.registerCallbacks(!1,!0,k.method_id_VideoElement_t.onvideoframechanged);a.remoteInvoke(!0,k.method_id_VideoElement_t.onvideoframechanged,b.success);return a.remoteInvoke(!1,k.method_id_VideoElement_t.disconnect)}).then(function(){m.logger.log(a.user_friendly_id()+
".disconnect: remote media stream is disconnected!");a.setState("disconnected");1==a.pendingRelease_&&(a.pendingRelease_=!1,a.onconnectionstatechange=null,a.release());b()})["catch"](function(b){a.logRemoteInvokeError(b,".disconnect: failed to connect!");c()})})};b.prototype.setFrame=function(a){var b=this;m.logger.log(this.user_friendly_id()+".setFrame: set video frame to",a.x,a.y,a.width,a.height);this.waitUntilConnected("VideoElement.setFrame").then(function(){var c=new g(a);return b.remoteInvoke(!1,
k.method_id_VideoElement_t.setFrame,c)}).then(function(){m.logger.log(b.user_friendly_id()+".setFrame: success!")})["catch"](function(a){b.logRemoteInvokeError(a,".setFrame: failed to connect!")})};b.prototype.addClipRect=function(a){var b=this;m.logger.log(this.user_friendly_id()+".addClipRect: ",JSON.stringify(a));this.waitUntilConnected("VideoElement.addClipRect").then(function(){var c=new g(a);return b.remoteInvoke(!1,k.method_id_VideoElement_t.addClipRect,c)})["catch"](function(a){b.logRemoteInvokeError(a,
".addClipRect failed!")})};b.prototype.removeClipRect=function(a){var b=this;m.logger.log(this.user_friendly_id()+".removeClipRect: ",JSON.stringify(a));this.waitUntilConnected("VideoElement.removeClipRect").then(function(){var c=new g(a);return b.remoteInvoke(!1,k.method_id_VideoElement_t.removeClipRect,c)})["catch"](function(a){b.logRemoteInvokeError(a,".removeClipRect failed!")})};b.prototype.watch=function(){var a=this;if(p.getRedirector().getFeatureValue(l.FEATURE_ms_teams_video_placement)){var b=
window.document.getElementById(this.elementId);b&&(this.unwatch(),this.styleObserver=new MutationObserver(function(b){b.forEach(function(b){"style"==b.attributeName?a.updateStyle(b.target):a.elementId=b.target.id})}),this.styleObserver.observe(b,{attributes:!0,attributeOldValue:!0,attributeFilter:["style","id"]}))}};b.prototype.unwatch=function(){this.styleObserver&&(this.styleObserver.disconnect(),this.styleObserver=null)};b.prototype.updateStyle=function(a){if("connected"==this.connectionState){var b=
window.getComputedStyle(a).getPropertyValue("object-fit"),c=window.getComputedStyle(a).getPropertyValue("object-position").split(" ");a=new v(c[0]);c=new v(c[1]);this.placement=new u(b,a,c)}else m.logger.log(this.user_friendly_id()+".updateStyle: video element is not connected")};Object.defineProperty(b.prototype,"placement",{get:function(){return this.placement_},set:function(a){var b=this;p.getRedirector().getFeatureValue(l.FEATURE_ms_teams_video_placement)?this.waitUntilConnected("VideoElement.placement").then(function(){return b.remoteInvoke(!0,
k.method_id_VideoElement_t.placement,a)}).then(function(){b.placement_=a})["catch"](function(a){b.logRemoteInvokeError(a,".placement setter: failed to connect!")}):m.logger.log(this.user_friendly_id()+".placement: video placement feature is not supported on a client")},enumerable:!0,configurable:!0});return b}(e.ProxyObject);a.VideoElement=b},269:function(b,a){Object.defineProperty(a,"__esModule",{value:!0});a.FEATURE_ms_teams_redirection="ms_teams_redirection";a.FEATURE_unsupported="unsupported";
var c=function(){return function(a,b,c,d){this.major=a;this.minor=b;this.revision=c;this.build=d}}();a.VersionData=c;c=function(){return function(){}}();a.FeatureData=c;c=function(){return function(a,b){this.fature=a;this.version=b}}();a.WebrpcFeatureInfo=c;c=function(){return function(a,b,c,d,e){this.family=a;this.version=b;this.architecture=c;this.distro=d;this.edition=e}}();a.OSInfo=c;c=function(){return function(a,b){this.machine_id=a;this.user_id=b}}();a.EndpointId=c;c=function(){return function(b,
c,d,e,k){void 0===k&&(k=a.FEATURE_ms_teams_redirection);this.iid=b;this.mid=c;this.name=d;this.isprop=e;this.feature=k}}();a.WebrpcMethodInfo=c;c=function(){return function(a,b,c){this.id=a;this.name=b;this.methods=c}}();a.WebrpcClassInfo=c;c=function(){return function(a,b){this.name=a;this.classes=b}}();a.WebrpcClassLibInfo=c},550:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(187);(function(b){for(var c in b)a.hasOwnProperty(c)||(a[c]=b[c])})(c(187));b=function(){function a(){}
a.getInterfaceByid=function(a){for(var b=0,c=d.class_lib_info.classes;b<c.length;b++){var e=c[b];if(e.id==a)return e}return null};a.getMethodByid=function(a,b){var c=this.getInterfaceByid(a);if(null!=c)for(var d=0,c=c.methods;d<c.length;d++){var e=c[d];if(e.mid==b)return e}return null};a.getMethodFeatureByid=function(a,b){var c=this.getInterfaceByid(a);if(null!=c)for(var d=0,c=c.methods;d<c.length;d++){var e=c[d];if(e.mid==b)return e.feature}return null};a.composeClassInfoData=function(a){a=a.hdr;
if(void 0==a)return"*** Invalid packet: Couldn't find hdr object ***";var b=a.proc;if(void 0==b)return"";a=b.iid;for(var b=b.methodid,c=0,e=d.class_lib_info.classes;c<e.length;c++){var g=e[c];if(g.id==a)for(var k=0,n=g.methods;k<n.length;k++){var t=n[k];if(t.mid==b)return g.name+"::"+t.name}}return""};return a}();a.WebrpcClassLibInfoUtil=b},187:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});b=c(269);c=c(269);a.VersionData=c.VersionData;a.FeatureData=c.FeatureData;a.OSInfo=c.OSInfo;
a.EndpointId=c.EndpointId;a.BUILD_TYPE_SDK=!0;a.HDXMS_VERSION="2.0.0.5";a.FEATURE_vda_service_no_buffer_limit="wsservice_no_buffer_limit";a.FEATURE_vda_app_sharing="webrtc_app_sharing";a.FEATURE_vda_multi_window="webrtc_multi_window";a.FEATURE_ms_teams_desktop_sharing="ms_teams_desktop_sharing";a.FEATURE_ms_teams_speaking_indicator="ms_teams_speaking_indicator";a.FEATURE_ms_teams_common_media_constraints="ms_teams_common_media_constraints";a.FEATURE_ms_teams_1911="ms_teams_1911";a.FEATURE_ms_teams_pstn=
"ms_teams_pstn";a.FEATURE_ms_teams_1912="ms_teams_1912";a.FEATURE_ms_teams_mstrack_constraints="ms_teams_mstrack_constraints";a.FEATURE_ms_teams_osinfo="ms_teams_osinfo";a.FEATURE_ms_teams_endpoint_id="ms_teams_endpoint_id";a.FEATURE_ms_teams_remote_audio_notifications="ms_teams_remote_audio_notifications";a.FEATURE_ms_teams_device_group_id="ms_teams_device_group_id";a.FEATURE_ms_teams_dtmf="ms_teams_dtmf";a.FEATURE_ms_teams_video_placement="ms_teams_video_placement";a.FEATURE_ms_teams_codec_capability=
"ms_teams_codec_capability";a.FEATURE_ms_teams_multi_window="ms_teams_multi_windows";a.FEATURE_ms_teams_webrtc_1dot0="ms_teams_webrtc_1.0";a.FEATURE_ms_teams_data_channel="ms_teams_data_channel";a.FEATURE_ms_teams_no_vd_buffer_limit="ms_teams_no_vd_buffer_limit";new b.WebrpcFeatureInfo(b.FEATURE_ms_teams_redirection,new b.VersionData(1,1,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_desktop_sharing,new b.VersionData(1,2,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_speaking_indicator,new b.VersionData(1,
2,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_common_media_constraints,new b.VersionData(1,4,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_1911,new b.VersionData(1,4,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_1912,new b.VersionData(1,5,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_mstrack_constraints,new b.VersionData(1,6,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_pstn,new b.VersionData(1,6,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_osinfo,new b.VersionData(1,7,0,0));
new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_endpoint_id,new b.VersionData(1,7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_remote_audio_notifications,new b.VersionData(1,7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_device_group_id,new b.VersionData(1,7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_codec_capability,new b.VersionData(1,7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_dtmf,new b.VersionData(1,7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_video_placement,new b.VersionData(1,
7,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_webrtc_1dot0,new b.VersionData(1,8,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_data_channel,new b.VersionData(1,8,0,0));new b.WebrpcFeatureInfo(a.FEATURE_ms_teams_multi_window,new b.VersionData(1,14,0,0));c=function(){function a(){}a.FEATURE_public_screenshare="screenshare";a.FEATURE_public_redirection="redirection";a.FEATURE_public_speaking_indicator="speaking_indicator";a.FEATURE_public_pstn="pstn";a.FEATURE_public_osinfo="osinfo";a.FEATURE_public_endpoint_id=
"endpointid";a.FEATURE_public_remote_audio_notifications="remoteaudionotifications";a.FEATURE_public_device_group_id="compositedevices";a.FEATURE_public_dtmf="dtmf";a.FEATURE_public_monitor_sharing="multimonitorscreenshare";a.FEATURE_public_app_sharing="appshare";a.FEATURE_public_codec_capability="codec_capability";a.FEATURE_public_webrtc1dot0="webrtc1.0";a.FEATURE_public_data_channel="datachannel";a.FEATURE_public_vdnobuflimit="vdnobuflimit";a.FEATURE_public_multi_window="multiwindow";return a}();
a.Features=c;a.featureNameMap={};a.featureNameMap[c.FEATURE_public_screenshare]=[a.FEATURE_ms_teams_desktop_sharing];a.featureNameMap[c.FEATURE_public_redirection]=[b.FEATURE_ms_teams_redirection];a.featureNameMap[c.FEATURE_public_speaking_indicator]=[a.FEATURE_ms_teams_speaking_indicator];a.featureNameMap[c.FEATURE_public_pstn]=[a.FEATURE_ms_teams_pstn];a.featureNameMap[c.FEATURE_public_osinfo]=[a.FEATURE_ms_teams_osinfo];a.featureNameMap[c.FEATURE_public_endpoint_id]=[a.FEATURE_ms_teams_endpoint_id];
a.featureNameMap[c.FEATURE_public_remote_audio_notifications]=[a.FEATURE_ms_teams_remote_audio_notifications];a.featureNameMap[c.FEATURE_public_device_group_id]=[a.FEATURE_ms_teams_device_group_id];a.featureNameMap[c.FEATURE_public_dtmf]=[a.FEATURE_ms_teams_dtmf];a.featureNameMap[c.FEATURE_public_codec_capability]=[a.FEATURE_ms_teams_codec_capability];a.featureNameMap[c.FEATURE_public_webrtc1dot0]=[a.FEATURE_ms_teams_webrtc_1dot0];a.featureNameMap[c.FEATURE_public_multi_window]=[a.FEATURE_ms_teams_multi_window];
a.featureNameMap[c.FEATURE_public_data_channel]=[a.FEATURE_ms_teams_data_channel];a.featureNameMap[c.FEATURE_public_vdnobuflimit]=[a.FEATURE_ms_teams_no_vd_buffer_limit];(function(a){a[a.EngineControl=0]="EngineControl";a[a.RTCPeerConnection=1]="RTCPeerConnection";a[a.RTCSessionDescription=2]="RTCSessionDescription";a[a.RTCIceCandidate=3]="RTCIceCandidate";a[a.RTCIceCandidateEvent=4]="RTCIceCandidateEvent";a[a.MediaDevices=5]="MediaDevices";a[a.MediaDeviceInfo=6]="MediaDeviceInfo";a[a.MediaStreamTrack=
7]="MediaStreamTrack";a[a.MediaStreamEvent=8]="MediaStreamEvent";a[a.MediaStream=9]="MediaStream";a[a.NavigatorUserMedia=10]="NavigatorUserMedia";a[a.VideoElement=11]="VideoElement";a[a.AudioElement=12]="AudioElement";a[a.RTCRtpReceiver=13]="RTCRtpReceiver";a[a.RTCRtpSender=14]="RTCRtpSender";a[a.RTCDtlsTransport=15]="RTCDtlsTransport";a[a.RTCIceTransport=16]="RTCIceTransport";a[a.RTCDTMFSender=17]="RTCDTMFSender";a[a.RTCDTMFToneChangeEvent=18]="RTCDTMFToneChangeEvent";a[a.RTCIceCandidatePair=19]=
"RTCIceCandidatePair";a[a.RTCRtpTransceiver=20]="RTCRtpTransceiver";a[a.reserved3=21]="reserved3";a[a.reserved4=22]="reserved4";a[a.reserved1=23]="reserved1";a[a.reserved2=24]="reserved2";a[a.RTCDataChannel=25]="RTCDataChannel";a[a.RTCSctpTransport=26]="RTCSctpTransport"})(c=a.class_id_t||(a.class_id_t={}));var d;(function(a){a[a.ctor=0]="ctor";a[a.version=1]="version";a[a.feature_flags=2]="feature_flags";a[a.version_info=3]="version_info";a[a.osinfo=4]="osinfo";a[a.endpoint_id=5]="endpoint_id"})(d=
a.method_id_EngineControl_t||(a.method_id_EngineControl_t={}));var e;(function(a){a[a.ctor=0]="ctor";a[a.localDescription=1]="localDescription";a[a.remoteDescription=2]="remoteDescription";a[a.readyState=3]="readyState";a[a.iceState=4]="iceState";a[a.localStreams=5]="localStreams";a[a.remoteStreams=6]="remoteStreams";a[a.createOffer=7]="createOffer";a[a.createAnswer=8]="createAnswer";a[a.setLocalDescription=9]="setLocalDescription";a[a.setRemoteDescription=10]="setRemoteDescription";a[a.updateIce=
11]="updateIce";a[a.addIceCandidate=12]="addIceCandidate";a[a.addStream=13]="addStream";a[a.removeStream=14]="removeStream";a[a.close=15]="close";a[a.iceConnectionState=16]="iceConnectionState";a[a.iceGatheringState=17]="iceGatheringState";a[a.signalingState=18]="signalingState";a[a.onaddstream=19]="onaddstream";a[a.onicecandidate=20]="onicecandidate";a[a.oniceconnectionstatechange=21]="oniceconnectionstatechange";a[a.onicegatheringstatechange=22]="onicegatheringstatechange";a[a.onsignalingstatechange=
23]="onsignalingstatechange";a[a.onnegotiationneeded=24]="onnegotiationneeded";a[a.onremovestream=25]="onremovestream";a[a.getStats=26]="getStats";a[a.getReceivers=27]="getReceivers";a[a.getSenders=28]="getSenders";a[a.addTrack=29]="addTrack";a[a.removeTrack=30]="removeTrack";a[a.ontrack=31]="ontrack";a[a.setLocalDescription_v2=32]="setLocalDescription_v2";a[a.setRemoteDescription_v2=33]="setRemoteDescription_v2";a[a.addTransceiverWithTrack=34]="addTransceiverWithTrack";a[a.addTransceiverWithKind=
35]="addTransceiverWithKind";a[a.getTransceivers=36]="getTransceivers";a[a.onconnectionstatechange=37]="onconnectionstatechange";a[a.sctp=38]="sctp";a[a.ondatachannel=39]="ondatachannel";a[a.createDataChannel=40]="createDataChannel";a[a.getStats_v2=41]="getStats_v2"})(e=a.method_id_RTCPeerConnection_t||(a.method_id_RTCPeerConnection_t={}));var k;(function(a){a[a.ctor=0]="ctor";a[a.enumerateDevices=1]="enumerateDevices";a[a.getDisplayMedia=2]="getDisplayMedia";a[a.ondevicechange=3]="ondevicechange"})(k=
a.method_id_MediaDevices_t||(a.method_id_MediaDevices_t={}));var m;(function(a){a[a.ctor=0]="ctor";a[a.deviceId=1]="deviceId";a[a.kind=2]="kind";a[a.label=3]="label";a[a.groupId=4]="groupId"})(m=a.method_id_MediaDeviceInfo_t||(a.method_id_MediaDeviceInfo_t={}));var p;(function(a){a[a.ctor=0]="ctor";a[a.type=1]="type";a[a.sdp=2]="sdp"})(p=a.method_id_RTCSessionDescription_t||(a.method_id_RTCSessionDescription_t={}));var l;(function(a){a[a.ctor=0]="ctor";a[a.kind=1]="kind";a[a.id=2]="id";a[a.label=
3]="label";a[a.enabled=4]="enabled";a[a.muted=5]="muted";a[a.readyState=6]="readyState";a[a.onended=7]="onended";a[a.onmute=8]="onmute";a[a.onunmute=9]="onunmute";a[a.clone=10]="clone";a[a.stop=11]="stop";a[a.getCapabilities=12]="getCapabilities";a[a.getSettings=13]="getSettings";a[a.applyConstraints=14]="applyConstraints";a[a.getConstraints=15]="getConstraints"})(l=a.method_id_MediaStreamTrack_t||(a.method_id_MediaStreamTrack_t={}));var g;(function(a){a[a.ctor=0]="ctor";a[a.id=1]="id";a[a.getAudioTracks=
2]="getAudioTracks";a[a.getVideoTracks=3]="getVideoTracks";a[a.getTracks=4]="getTracks";a[a.getTrackById=5]="getTrackById";a[a.addTrack=6]="addTrack";a[a.removeTrack=7]="removeTrack";a[a.clone=8]="clone";a[a.active=9]="active"})(g=a.method_id_MediaStream_t||(a.method_id_MediaStream_t={}));var G;(function(a){a[a.ctor=0]="ctor";a[a.getUserMedia=1]="getUserMedia";a[a.setCodecCapabilities=2]="setCodecCapabilities";a[a.getCapabilities=3]="getCapabilities"})(G=a.method_id_NavigatorUserMedia_t||(a.method_id_NavigatorUserMedia_t=
{}));var v;(function(a){a[a.ctor=0]="ctor";a[a.candidate=1]="candidate";a[a.sdpMid=2]="sdpMid";a[a.sdpMLineIndex=3]="sdpMLineIndex"})(v=a.method_id_RTCIceCandidate_t||(a.method_id_RTCIceCandidate_t={}));var t;(function(a){a[a.ctor=0]="ctor";a[a.candidate=1]="candidate"})(t=a.method_id_RTCIceCandidateEvent_t||(a.method_id_RTCIceCandidateEvent_t={}));var z;(function(a){a[a.ctor=0]="ctor";a[a.stream=1]="stream"})(z=a.method_id_MediaStreamEvent_t||(a.method_id_MediaStreamEvent_t={}));var u;(function(a){a[a.ctor=
0]="ctor";a[a.sinkId=1]="sinkId";a[a.connectTo=2]="connectTo";a[a.disconnect=3]="disconnect";a[a.setFrame=4]="setFrame";a[a.addClipRect=5]="addClipRect";a[a.removeClipRect=6]="removeClipRect";a[a.onerror=7]="onerror";a[a.onvideoframechanged=8]="onvideoframechanged";a[a.placement=9]="placement"})(u=a.method_id_VideoElement_t||(a.method_id_VideoElement_t={}));var f;(function(a){a[a.ctor=0]="ctor";a[a.sinkId=1]="sinkId";a[a.srcObject=2]="srcObject";a[a.src=3]="src";a[a.play=4]="play";a[a.pause=5]="pause"})(f=
a.method_id_AudioElement_t||(a.method_id_AudioElement_t={}));var A;(function(a){a[a.ctor=0]="ctor";a[a.track=1]="track";a[a.getContributingSources=2]="getContributingSources";a[a.getSynchronizationSources=3]="getSynchronizationSources";a[a.transport=4]="transport";a[a.rtcpTransport=5]="rtcpTransport";a[a.getCapabilities=6]="getCapabilities";a[a.getParameters=7]="getParameters";a[a.getStats=8]="getStats";a[a.getCapabilities_v2=9]="getCapabilities_v2"})(A=a.method_id_RTCRtpReceiver_t||(a.method_id_RTCRtpReceiver_t=
{}));var x;(function(a){a[a.ctor=0]="ctor";a[a.track=1]="track";a[a.transport=2]="transport";a[a.rtcpTransport=3]="rtcpTransport";a[a.dtmf=4]="dtmf";a[a.getCapabilities=5]="getCapabilities";a[a.getParameters=6]="getParameters";a[a.setParameters=7]="setParameters";a[a.replaceTrack=8]="replaceTrack";a[a.getStats=9]="getStats";a[a.setStreams=10]="setStreams";a[a.getCapabilities_v2=11]="getCapabilities_v2"})(x=a.method_id_RTCRtpSender_t||(a.method_id_RTCRtpSender_t={}));var D;(function(a){a[a.ctor=0]=
"ctor";a[a.transport=1]="transport";a[a.state=2]="state";a[a.getRemoteCertificates=3]="getRemoteCertificates";a[a.onstatechange=4]="onstatechange";a[a.onerror=5]="onerror"})(D=a.method_id_RTCDtlsTransport_t||(a.method_id_RTCDtlsTransport_t={}));var C;(function(a){a[a.ctor=0]="ctor";a[a.role=1]="role";a[a.component=2]="component";a[a.state=3]="state";a[a.gatheringState=4]="gatheringState";a[a.localcandidates=5]="localcandidates";a[a.remotecandidates=6]="remotecandidates";a[a.onstatechange=7]="onstatechange";
a[a.ongatheringstatechange=8]="ongatheringstatechange";a[a.onselectedcandidatepairchange=9]="onselectedcandidatepairchange"})(C=a.method_id_RTCIceTransport_t||(a.method_id_RTCIceTransport_t={}));var r;(function(a){a[a.ctor=0]="ctor";a[a.insertDTMF=1]="insertDTMF";a[a.ontonechange=2]="ontonechange";a[a.canInsertDTMF=3]="canInsertDTMF";a[a.toneBuffer=4]="toneBuffer"})(r=a.method_id_RTCDTMFSender_t||(a.method_id_RTCDTMFSender_t={}));var q;(function(a){a[a.ctor=0]="ctor";a[a.tone=1]="tone";a[a.tone_buffer=
2]="tone_buffer"})(q=a.method_id_RTCDTMFToneChangeEvent_t||(a.method_id_RTCDTMFToneChangeEvent_t={}));var w;(function(a){a[a.ctor=0]="ctor";a[a.local=1]="local";a[a.remote=2]="remote"})(w=a.method_id_RTCIceCandidatePair_t||(a.method_id_RTCIceCandidatePair_t={}));var B;(function(a){a[a.ctor=0]="ctor";a[a.mid=1]="mid";a[a.sender=2]="sender";a[a.receiver=3]="receiver";a[a.direction=4]="direction";a[a.currentDirection=5]="currentDirection";a[a.stop=6]="stop";a[a.setCodecPreferences=7]="setCodecPreferences"})(B=
a.method_id_RTCRtpTransceiver_t||(a.method_id_RTCRtpTransceiver_t={}));var y;(function(a){a[a.ctor=0]="ctor";a[a.label=1]="label";a[a.ordered=2]="ordered";a[a.maxPacketLifeTime=3]="maxPacketLifeTime";a[a.maxRetransmits=4]="maxRetransmits";a[a.protocol=5]="protocol";a[a.negotiated=6]="negotiated";a[a.id=7]="id";a[a.readyState=8]="readyState";a[a.bufferedAmount=9]="bufferedAmount";a[a.bufferedAmountLowThreshold=10]="bufferedAmountLowThreshold";a[a.onopen=11]="onopen";a[a.onbufferedamountlow=12]="onbufferedamountlow";
a[a.onerror=13]="onerror";a[a.onclosing=14]="onclosing";a[a.onclose=15]="onclose";a[a.onmessage=16]="onmessage";a[a.close=17]="close";a[a.send_text=18]="send_text";a[a.send_binary=19]="send_binary"})(y=a.method_id_RTCDataChannel_t||(a.method_id_RTCDataChannel_t={}));var H;(function(a){a[a.ctor=0]="ctor";a[a.transport=1]="transport";a[a.state=2]="state";a[a.maxMessageSize=3]="maxMessageSize";a[a.maxChannels=4]="maxChannels";a[a.onstatechange=5]="onstatechange"})(H=a.method_id_RTCSctpTransport_t||(a.method_id_RTCSctpTransport_t=
{}));a.class_lib_info=new b.WebrpcClassLibInfo("webrpc_class_library",[new b.WebrpcClassInfo(c.EngineControl,"EngineControl",[new b.WebrpcMethodInfo(c.EngineControl,d.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.EngineControl,d.version,"version",!0),new b.WebrpcMethodInfo(c.EngineControl,d.feature_flags,"feature_flags",!0),new b.WebrpcMethodInfo(c.EngineControl,d.version_info,"version_info",!0,a.FEATURE_ms_teams_desktop_sharing),new b.WebrpcMethodInfo(c.EngineControl,d.osinfo,"osinfo",!0,a.FEATURE_ms_teams_osinfo),
new b.WebrpcMethodInfo(c.EngineControl,d.endpoint_id,"endpoint_id",!0,a.FEATURE_ms_teams_endpoint_id)]),new b.WebrpcClassInfo(c.RTCPeerConnection,"RTCPeerConnection",[new b.WebrpcMethodInfo(c.RTCPeerConnection,e.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.localDescription,"localDescription",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.remoteDescription,"remoteDescription",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.readyState,"readyState",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,
e.iceState,"iceState",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.localStreams,"localStreams",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.remoteStreams,"remoteStreams",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.createOffer,"createOffer",!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.createAnswer,"createAnswer",!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.setLocalDescription,"setLocalDescription",!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.setRemoteDescription,"setRemoteDescription",
!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.updateIce,"updateIce",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.addIceCandidate,"addIceCandidate",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.addStream,"addStream",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.removeStream,"removeStream",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.close,"close",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.iceConnectionState,"iceConnectionState",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,
e.iceGatheringState,"iceGatheringState",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.signalingState,"signalingState",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onaddstream,"onaddstream",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onicecandidate,"onicecandidate",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.oniceconnectionstatechange,"oniceconnectionstatechange",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onicegatheringstatechange,"onicegatheringstatechange",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,
e.onsignalingstatechange,"onsignalingstatechange",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onnegotiationneeded,"onnegotiationneeded",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onremovestream,"onremovestream",!0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.getStats,"getStats",!1),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.getReceivers,"getReceivers",!1,a.FEATURE_ms_teams_speaking_indicator),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.getSenders,"getSenders",!1,a.FEATURE_ms_teams_pstn),
new b.WebrpcMethodInfo(c.RTCPeerConnection,e.addTrack,"addTrack",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.removeTrack,"removeTrack",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.ontrack,"ontrack",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.setLocalDescription_v2,"setLocalDescription_v2",!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.setRemoteDescription_v2,"setRemoteDescription_v2",
!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.addTransceiverWithTrack,"addTransceiverWithTrack",!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.addTransceiverWithKind,"addTransceiverWithKind",!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.getTransceivers,"getTransceivers",!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.onconnectionstatechange,"onconnectionstatechange",
!0,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.sctp,"sctp",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.ondatachannel,"ondatachannel",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.createDataChannel,"createDataChannel",!1,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCPeerConnection,e.getStats_v2,"getStats_v2",!1,a.FEATURE_ms_teams_webrtc_1dot0)]),new b.WebrpcClassInfo(c.RTCSessionDescription,
"RTCSessionDescription",[new b.WebrpcMethodInfo(c.RTCSessionDescription,p.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.RTCSessionDescription,p.type,"type",!0),new b.WebrpcMethodInfo(c.RTCSessionDescription,p.sdp,"sdp",!0)]),new b.WebrpcClassInfo(c.RTCIceCandidate,"RTCIceCandidate",[new b.WebrpcMethodInfo(c.RTCIceCandidate,v.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.RTCIceCandidate,v.candidate,"candidate",!0),new b.WebrpcMethodInfo(c.RTCIceCandidate,v.sdpMid,"sdpMid",!0),new b.WebrpcMethodInfo(c.RTCIceCandidate,
v.sdpMLineIndex,"sdpMLineIndex",!0)]),new b.WebrpcClassInfo(c.RTCIceCandidateEvent,"RTCIceCandidateEvent",[new b.WebrpcMethodInfo(c.RTCIceCandidateEvent,t.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.RTCIceCandidateEvent,t.candidate,"candidate",!0)]),new b.WebrpcClassInfo(c.MediaDevices,"MediaDevices",[new b.WebrpcMethodInfo(c.MediaDevices,k.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.MediaDevices,k.enumerateDevices,"enumerateDevices",!1),new b.WebrpcMethodInfo(c.MediaDevices,k.getDisplayMedia,"getDisplayMedia",
!1,a.FEATURE_ms_teams_desktop_sharing),new b.WebrpcMethodInfo(c.MediaDevices,k.ondevicechange,"ondevicechange",!0,a.FEATURE_ms_teams_speaking_indicator)]),new b.WebrpcClassInfo(c.MediaDeviceInfo,"MediaDeviceInfo",[new b.WebrpcMethodInfo(c.MediaDeviceInfo,m.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.MediaDeviceInfo,m.deviceId,"deviceId",!0),new b.WebrpcMethodInfo(c.MediaDeviceInfo,m.kind,"kind",!0),new b.WebrpcMethodInfo(c.MediaDeviceInfo,m.label,"label",!0),new b.WebrpcMethodInfo(c.MediaDeviceInfo,
m.groupId,"groupId",!0)]),new b.WebrpcClassInfo(c.MediaStreamTrack,"MediaStreamTrack",[new b.WebrpcMethodInfo(c.MediaStreamTrack,l.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.clone,"clone",!1),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.stop,"stop",!1),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.getCapabilities,"getCapabilities",!1),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.getSettings,"getSettings",!1),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.applyConstraints,"applyConstraints",
!1,a.FEATURE_ms_teams_desktop_sharing),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.kind,"kind",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.id,"id",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.label,"label",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.enabled,"enabled",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.muted,"muted",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.readyState,"readyState",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.onended,"onended",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,
l.onmute,"onmute",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.onunmute,"onunmute",!0),new b.WebrpcMethodInfo(c.MediaStreamTrack,l.getConstraints,"getConstraints",!1,a.FEATURE_ms_teams_mstrack_constraints)]),new b.WebrpcClassInfo(c.MediaStream,"MediaStream",[new b.WebrpcMethodInfo(c.MediaStream,g.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.MediaStream,g.id,"id",!0),new b.WebrpcMethodInfo(c.MediaStream,g.getAudioTracks,"getAudioTracks",!1),new b.WebrpcMethodInfo(c.MediaStream,g.getVideoTracks,"getVideoTracks",
!1),new b.WebrpcMethodInfo(c.MediaStream,g.getTracks,"getTracks",!1),new b.WebrpcMethodInfo(c.MediaStream,g.getTrackById,"getTrackById",!1),new b.WebrpcMethodInfo(c.MediaStream,g.addTrack,"addTrack",!1),new b.WebrpcMethodInfo(c.MediaStream,g.removeTrack,"removeTrack",!1),new b.WebrpcMethodInfo(c.MediaStream,g.clone,"clone",!0),new b.WebrpcMethodInfo(c.MediaStream,g.active,"active",!0)]),new b.WebrpcClassInfo(c.NavigatorUserMedia,"NavigatorUserMedia",[new b.WebrpcMethodInfo(c.NavigatorUserMedia,G.ctor,
"ctor",!1),new b.WebrpcMethodInfo(c.NavigatorUserMedia,G.getUserMedia,"getUserMedia",!1),new b.WebrpcMethodInfo(c.NavigatorUserMedia,G.setCodecCapabilities,"setCodecCapabilities",!1,a.FEATURE_ms_teams_codec_capability),new b.WebrpcMethodInfo(c.NavigatorUserMedia,G.getCapabilities,"getRtpCapabilities",!1,a.FEATURE_ms_teams_webrtc_1dot0)]),new b.WebrpcClassInfo(c.MediaStreamEvent,"MediaStreamEvent",[new b.WebrpcMethodInfo(c.MediaStreamEvent,z.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.MediaStreamEvent,
z.stream,"stream",!0)]),new b.WebrpcClassInfo(c.VideoElement,"VideoElement",[new b.WebrpcMethodInfo(c.VideoElement,u.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.VideoElement,u.sinkId,"sinkId",!0),new b.WebrpcMethodInfo(c.VideoElement,u.connectTo,"connectTo",!1),new b.WebrpcMethodInfo(c.VideoElement,u.disconnect,"disconnect",!1),new b.WebrpcMethodInfo(c.VideoElement,u.setFrame,"setFrame",!1),new b.WebrpcMethodInfo(c.VideoElement,u.addClipRect,"addClipRect",!1),new b.WebrpcMethodInfo(c.VideoElement,u.removeClipRect,
"removeClipRect",!1),new b.WebrpcMethodInfo(c.VideoElement,u.onerror,"onerror",!0),new b.WebrpcMethodInfo(c.VideoElement,u.onvideoframechanged,"onvideoframechanged",!0),new b.WebrpcMethodInfo(c.VideoElement,u.placement,"placement",!0,a.FEATURE_ms_teams_video_placement)]),new b.WebrpcClassInfo(c.AudioElement,"AudioElement",[new b.WebrpcMethodInfo(c.AudioElement,f.ctor,"ctor",!1),new b.WebrpcMethodInfo(c.AudioElement,f.sinkId,"sinkId",!0),new b.WebrpcMethodInfo(c.AudioElement,f.srcObject,"srcObject",
!0),new b.WebrpcMethodInfo(c.AudioElement,f.src,"src",!0),new b.WebrpcMethodInfo(c.AudioElement,f.play,"play",!1),new b.WebrpcMethodInfo(c.AudioElement,f.pause,"pause",!1)]),new b.WebrpcClassInfo(c.RTCRtpReceiver,"RTCRtpReceiver",[new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.ctor,"ctor",!1,a.FEATURE_ms_teams_speaking_indicator),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.track,"track",!0,a.FEATURE_ms_teams_speaking_indicator),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.getContributingSources,"getContributingSources",
!1,a.FEATURE_ms_teams_speaking_indicator),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.getSynchronizationSources,"getSynchronizationSources",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.transport,"transport",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.rtcpTransport,"rtcptransport",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.getCapabilities,"getCapabilities",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,
A.getParameters,"getParameters",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.getStats,"getStats",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpReceiver,A.getCapabilities_v2,"getCapabilities_v2",!1,a.FEATURE_ms_teams_webrtc_1dot0)]),new b.WebrpcClassInfo(c.RTCRtpSender,"RTCRtpSender",[new b.WebrpcMethodInfo(c.RTCRtpSender,x.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.track,"track",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,
x.transport,"transport",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.rtcpTransport,"rtcpTransport",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.dtmf,"dtmf",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.getCapabilities,"getCapabilities",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.getParameters,"getParameters",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.setParameters,"setParameters",!1,
a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.replaceTrack,"replaceTrack",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.getStats,"getStats",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.setStreams,"setStreams",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCRtpSender,x.getCapabilities_v2,"getCapabilities_v2",!1,a.FEATURE_ms_teams_webrtc_1dot0)]),new b.WebrpcClassInfo(c.RTCDtlsTransport,"RTCDtlsTransport",[new b.WebrpcMethodInfo(c.RTCDtlsTransport,
D.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDtlsTransport,D.transport,"transport",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDtlsTransport,D.state,"state",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDtlsTransport,D.getRemoteCertificates,"getRemoteCertificates",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDtlsTransport,D.onstatechange,"onstatechange",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDtlsTransport,D.onerror,"onerror",
!0,a.FEATURE_ms_teams_pstn)]),new b.WebrpcClassInfo(c.RTCIceTransport,"RTCIceTransport",[new b.WebrpcMethodInfo(c.RTCIceTransport,C.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.role,"role",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.component,"component",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.state,"state",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.gatheringState,"gatheringState",
!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.localcandidates,"localcandidates",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.remotecandidates,"remotecandidates",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.onstatechange,"onstatechange",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,C.ongatheringstatechange,"ongatheringstatechange",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceTransport,
C.onselectedcandidatepairchange,"onselectedcandidatepairchange",!0,a.FEATURE_ms_teams_pstn)]),new b.WebrpcClassInfo(c.RTCDTMFSender,"RTCDTMFSender",[new b.WebrpcMethodInfo(c.RTCDTMFSender,r.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDTMFSender,r.insertDTMF,"insertDTMF",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDTMFSender,r.ontonechange,"ontonechange",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDTMFSender,r.canInsertDTMF,"canInsertDTMF",!0,a.FEATURE_ms_teams_pstn),
new b.WebrpcMethodInfo(c.RTCDTMFSender,r.toneBuffer,"toneBuffer",!0,a.FEATURE_ms_teams_pstn)]),new b.WebrpcClassInfo(c.RTCDTMFToneChangeEvent,"RTCDTMFToneChangeEvent",[new b.WebrpcMethodInfo(c.RTCDTMFToneChangeEvent,q.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDTMFToneChangeEvent,q.tone,"tone",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCDTMFToneChangeEvent,q.tone_buffer,"tone_buffer",!0,a.FEATURE_ms_teams_pstn)]),new b.WebrpcClassInfo(c.RTCIceCandidatePair,"RTCIceCandidatePair",
[new b.WebrpcMethodInfo(c.RTCIceCandidatePair,w.ctor,"ctor",!1,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceCandidatePair,w.local,"local",!0,a.FEATURE_ms_teams_pstn),new b.WebrpcMethodInfo(c.RTCIceCandidatePair,w.remote,"remote",!0,a.FEATURE_ms_teams_pstn)]),new b.WebrpcClassInfo(c.RTCRtpTransceiver,"RTCRtpTransceiver",[new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.ctor,"ctor",!1,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.mid,"mid",!0,a.FEATURE_ms_teams_webrtc_1dot0),
new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.sender,"sender",!0,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.receiver,"receiver",!0,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.direction,"direction",!0,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.currentDirection,"currentDirection",!0,a.FEATURE_ms_teams_webrtc_1dot0),new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.stop,"stop",!1,a.FEATURE_ms_teams_webrtc_1dot0),
new b.WebrpcMethodInfo(c.RTCRtpTransceiver,B.setCodecPreferences,"setCodecPreferences",!1,a.FEATURE_ms_teams_webrtc_1dot0)]),new b.WebrpcClassInfo(c.RTCDataChannel,"RTCDataChannel",[new b.WebrpcMethodInfo(c.RTCDataChannel,y.ctor,"ctor",!1,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.label,"label",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.ordered,"ordered",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.maxPacketLifeTime,
"maxPacketLifeTime",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.maxRetransmits,"maxRetransmits",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.protocol,"protocol",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.negotiated,"negotiated",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.id,"id",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.readyState,
"readyState",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.bufferedAmount,"bufferedAmount",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.bufferedAmountLowThreshold,"bufferedAmountLowThreshold",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.onopen,"onopen",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.onbufferedamountlow,"onbufferedamountlow",!0,a.FEATURE_ms_teams_data_channel),
new b.WebrpcMethodInfo(c.RTCDataChannel,y.onerror,"onerror",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.onclosing,"onclosing",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.onclose,"onclose",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.onmessage,"onmessage",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.close,"close",!1,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,
y.send_text,"send_text",!1,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCDataChannel,y.send_binary,"send_binary",!1,a.FEATURE_ms_teams_data_channel)]),new b.WebrpcClassInfo(c.RTCSctpTransport,"RTCSctpTransport",[new b.WebrpcMethodInfo(c.RTCSctpTransport,H.ctor,"ctor",!1,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCSctpTransport,H.transport,"transport",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCSctpTransport,H.state,"state",!0,a.FEATURE_ms_teams_data_channel),
new b.WebrpcMethodInfo(c.RTCSctpTransport,H.maxMessageSize,"maxMessageSize",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCSctpTransport,H.maxChannels,"maxChannels",!0,a.FEATURE_ms_teams_data_channel),new b.WebrpcMethodInfo(c.RTCSctpTransport,H.onstatechange,"onstatechange",!0,a.FEATURE_ms_teams_data_channel)])])},545:function(b,a,c){Object.defineProperty(a,"__esModule",{value:!0});var d=c(550),e;(function(a){a[a.req=0]="req";a[a.reply=1]="reply";a[a.event_req=2]="event_req";a[a.event_reply=
3]="event_reply"})(e=a.ws_msg_type_t||(a.ws_msg_type_t={}));b=function(){function a(){}a.createMessageByid=function(a,b,c,e,k,n){for(var t=[],z=6;z<arguments.length;z++)t[z-6]=arguments[z];(z=d.WebrpcClassLibInfoUtil.getMethodByid(e,k))&&z.isprop||(a=!1);return this.createMessage.apply(this,[c,a,b,e,k,n].concat(t))};a.createMessage=function(a,b,c,d,e,k){for(var n=[],z=6;z<arguments.length;z++)n[z-6]=arguments[z];return{v:"webrtc",hdr:{version:this._version,msg_type:this.getMsgType(a),modifier:b,destroy:c,
proc:{iid:d,methodid:e}},objref:{oid:k},params:n.slice()}};a.getMsgType=function(a){var b="";switch(a){default:b="req";break;case e.reply:b="reply";break;case e.event_req:b="event-req";break;case e.event_reply:b="event-reply"}return b};a._version=1;return a}();a.WsJsonUtil=b}},k={};return d(307)}()});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":20}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":21}],4:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":22}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":23}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":24}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":25}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":26}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":27}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _promise = require("../core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return _promise2.default.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};
},{"../core-js/promise":7}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":3}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":4,"../core-js/object/get-prototype-of":5}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":2,"../core-js/object/set-prototype-of":6,"../helpers/typeof":16}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":16}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":8,"../core-js/symbol/iterator":9}],17:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() { return this })() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":18}],18:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],19:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":17}],20:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":35,"../../modules/es6.object.create":103}],21:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":35,"../../modules/es6.object.define-property":104}],22:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":35,"../../modules/es6.object.get-own-property-descriptor":105}],23:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":35,"../../modules/es6.object.get-prototype-of":106}],24:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":35,"../../modules/es6.object.set-prototype-of":107}],25:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":35,"../modules/es6.object.to-string":108,"../modules/es6.promise":109,"../modules/es6.string.iterator":110,"../modules/es7.promise.finally":112,"../modules/es7.promise.try":113,"../modules/web.dom.iterable":116}],26:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":35,"../../modules/es6.object.to-string":108,"../../modules/es6.symbol":111,"../../modules/es7.symbol.async-iterator":114,"../../modules/es7.symbol.observable":115}],27:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":99,"../../modules/es6.string.iterator":110,"../../modules/web.dom.iterable":116}],28:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],29:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],30:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],31:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":54}],32:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":90,"./_to-iobject":92,"./_to-length":93}],33:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":34,"./_wks":100}],34:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],35:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],36:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":28}],37:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],38:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":43}],39:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":45,"./_is-object":54}],40:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],41:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":71,"./_object-keys":74,"./_object-pie":75}],42:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":35,"./_ctx":36,"./_global":45,"./_has":46,"./_hide":47}],43:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],44:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":31,"./_ctx":36,"./_is-array-iter":52,"./_iter-call":55,"./_to-length":93,"./core.get-iterator-method":101}],45:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],46:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],47:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":38,"./_object-dp":66,"./_property-desc":79}],48:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":45}],49:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":38,"./_dom-create":39,"./_fails":43}],50:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],51:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":34}],52:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":60,"./_wks":100}],53:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":34}],54:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],55:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":31}],56:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":47,"./_object-create":65,"./_property-desc":79,"./_set-to-string-tag":84,"./_wks":100}],57:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":42,"./_hide":47,"./_iter-create":56,"./_iterators":60,"./_library":61,"./_object-gpo":72,"./_redefine":81,"./_set-to-string-tag":84,"./_wks":100}],58:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":100}],59:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],60:[function(require,module,exports){
module.exports = {};

},{}],61:[function(require,module,exports){
module.exports = true;

},{}],62:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":43,"./_has":46,"./_is-object":54,"./_object-dp":66,"./_uid":96}],63:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":34,"./_global":45,"./_task":89}],64:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":28}],65:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":31,"./_dom-create":39,"./_enum-bug-keys":40,"./_html":48,"./_object-dps":67,"./_shared-key":85}],66:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":31,"./_descriptors":38,"./_ie8-dom-define":49,"./_to-primitive":95}],67:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":31,"./_descriptors":38,"./_object-dp":66,"./_object-keys":74}],68:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":38,"./_has":46,"./_ie8-dom-define":49,"./_object-pie":75,"./_property-desc":79,"./_to-iobject":92,"./_to-primitive":95}],69:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":70,"./_to-iobject":92}],70:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":40,"./_object-keys-internal":73}],71:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],72:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":46,"./_shared-key":85,"./_to-object":94}],73:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":32,"./_has":46,"./_shared-key":85,"./_to-iobject":92}],74:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":40,"./_object-keys-internal":73}],75:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],76:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":35,"./_export":42,"./_fails":43}],77:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],78:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":31,"./_is-object":54,"./_new-promise-capability":64}],79:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],80:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":47}],81:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":47}],82:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":31,"./_ctx":36,"./_is-object":54,"./_object-gopd":68}],83:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":35,"./_descriptors":38,"./_global":45,"./_object-dp":66,"./_wks":100}],84:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":46,"./_object-dp":66,"./_wks":100}],85:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":86,"./_uid":96}],86:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":35,"./_global":45,"./_library":61}],87:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":28,"./_an-object":31,"./_wks":100}],88:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":37,"./_to-integer":91}],89:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":34,"./_ctx":36,"./_dom-create":39,"./_global":45,"./_html":48,"./_invoke":50}],90:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":91}],91:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],92:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":37,"./_iobject":51}],93:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":91}],94:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":37}],95:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":54}],96:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],97:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":45}],98:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":35,"./_global":45,"./_library":61,"./_object-dp":66,"./_wks-ext":99}],99:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":100}],100:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":45,"./_shared":86,"./_uid":96}],101:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":33,"./_core":35,"./_iterators":60,"./_wks":100}],102:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":29,"./_iter-define":57,"./_iter-step":59,"./_iterators":60,"./_to-iobject":92}],103:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":42,"./_object-create":65}],104:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":38,"./_export":42,"./_object-dp":66}],105:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":68,"./_object-sap":76,"./_to-iobject":92}],106:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":72,"./_object-sap":76,"./_to-object":94}],107:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":42,"./_set-proto":82}],108:[function(require,module,exports){

},{}],109:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":28,"./_an-instance":30,"./_classof":33,"./_core":35,"./_ctx":36,"./_export":42,"./_for-of":44,"./_global":45,"./_is-object":54,"./_iter-detect":58,"./_library":61,"./_microtask":63,"./_new-promise-capability":64,"./_perform":77,"./_promise-resolve":78,"./_redefine-all":80,"./_set-species":83,"./_set-to-string-tag":84,"./_species-constructor":87,"./_task":89,"./_user-agent":97,"./_wks":100}],110:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":57,"./_string-at":88}],111:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":31,"./_descriptors":38,"./_enum-keys":41,"./_export":42,"./_fails":43,"./_global":45,"./_has":46,"./_hide":47,"./_is-array":53,"./_is-object":54,"./_library":61,"./_meta":62,"./_object-create":65,"./_object-dp":66,"./_object-gopd":68,"./_object-gopn":70,"./_object-gopn-ext":69,"./_object-gops":71,"./_object-keys":74,"./_object-pie":75,"./_property-desc":79,"./_redefine":81,"./_set-to-string-tag":84,"./_shared":86,"./_to-iobject":92,"./_to-object":94,"./_to-primitive":95,"./_uid":96,"./_wks":100,"./_wks-define":98,"./_wks-ext":99}],112:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":35,"./_export":42,"./_global":45,"./_promise-resolve":78,"./_species-constructor":87}],113:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":42,"./_new-promise-capability":64,"./_perform":77}],114:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":98}],115:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":98}],116:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":45,"./_hide":47,"./_iterators":60,"./_wks":100,"./es6.array.iterator":102}],117:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');

function fixStatsType(stat) {
  return {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  }[stat.type] || stat.type;
}

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole || 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    var trackId = transceiver.rtpSender._initialTrackId ||
        transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
        trackId + '\r\n';
    sdp += 'a=' + msid;
    // for Chrome. Legacy should no longer be required.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;

    // RTX
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return {
    offer: {
      setLocalDescription: ['stable', 'have-local-offer'],
      setRemoteDescription: ['stable', 'have-remote-offer']
    },
    answer: {
      setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
      setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
    }
  }[type][action].indexOf(signalingState) !== -1;
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport.getRemoteCandidates()
      .find(function(remoteCandidate) {
        return candidate.foundation === remoteCandidate.foundation &&
            candidate.ip === remoteCandidate.ip &&
            candidate.port === remoteCandidate.port &&
            candidate.priority === remoteCandidate.priority &&
            candidate.protocol === remoteCandidate.protocol &&
            candidate.type === remoteCandidate.type;
      });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}


function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
  e.code = {
    NotSupportedError: 9,
    InvalidStateError: 11,
    InvalidAccessError: 15,
    TypeError: undefined,
    OperationError: undefined
  }[name];
  return e;
}

module.exports = function(window, edgeVersion) {
  // https://w3c.github.io/mediacapture-main/#mediastream
  // Helper function to add the track to the stream and
  // dispatch the event ourselves.
  function addTrackToStreamAndFireEvent(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
        {track: track}));
  }

  function removeTrackFromStreamAndFireEvent(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
        {track: track}));
  }

  function fireAddTrack(pc, track, receiver, streams) {
    var trackEvent = new Event('track');
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = {receiver: receiver};
    trackEvent.streams = streams;
    window.setTimeout(function() {
      pc._dispatchEvent('track', trackEvent);
    });
  }

  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this._localDescription = null;
    this._remoteDescription = null;

    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.iceGatheringState = 'new';

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === 'max-bundle';
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        }));
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
    configurable: true,
    get: function() {
      return this._localDescription;
    }
  });
  Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
    configurable: true,
    get: function() {
      return this._remoteDescription;
    }
  });

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function() {
    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);
  };

  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this.transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var alreadyExists = this.transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError('InvalidAccessError', 'Track already exists.');
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (!this.transceivers[i].track &&
          this.transceivers[i].kind === track.kind) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track,
        transceiver.dtlsTransport);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call removeTrack on a closed peerconnection.');
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this.transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this.localStreams.indexOf(stream) > -1) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };


  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    Object.defineProperty(iceGatherer, 'state',
        {value: 'new', writable: true}
    );

    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? 'completed' : 'gathering';
      if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
        pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
      }
    };
    iceGatherer.addEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var bufferedCandidateEvents =
      this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
    iceGatherer.removeEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
          iceGatherer.state = 'completed';
        }
      } else {
        if (iceGatherer.state === 'new') {
          iceGatherer.state = 'gathering';
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = SDPUtils.writeCandidate(cand);
        event.candidate = Object.assign(event.candidate,
            SDPUtils.parseCandidate(serializedCandidate));

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function() {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment
          };
        };
      }

      // update local description.
      var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex] +=
            'a=end-of-candidates\r\n';
      }
      pc._localDescription.sdp =
          SDPUtils.getDescription(pc._localDescription.sdp) +
          sections.join('');
      var complete = pc.transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'completed';
      });

      if (pc.iceGatheringState !== 'gathering') {
        pc.iceGatheringState = 'gathering';
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent('icecandidate', event);
      }
      if (complete) {
        pc._dispatchEvent('icecandidate', new Event('icecandidate'));
        pc.iceGatheringState = 'complete';
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function() {
      bufferedCandidateEvents.forEach(function(e) {
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function() {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function() {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function() {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setLocalDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.rejected) {
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    pc._localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-local-offer');
    } else {
      pc._updateSignalingState('stable');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setRemoteDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var streams = {};
    pc.remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    pc.usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      pc.canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if (rejected || (kind === 'application' && (protocol === 'DTLS/SCTP' ||
          protocol === 'UDP/DTLS/SCTP'))) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          protocol: protocol,
          rejected: true
        };
        return;
      }

      if (!rejected && pc.transceivers[sdpMLineIndex] &&
          pc.transceivers[sdpMLineIndex].rejected) {
        // recycle a rejected transceiver.
        pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters.role = 'client';
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc.transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
            pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
            pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
            pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          ssrc: (2 * sdpMLineIndex + 2) * 1001
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        // If the offer contained RTX but the answer did not,
        // remove RTX from sendEncodingParameters.
        var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

        var hasRtx = commonCapabilities.codecs.filter(function(c) {
          return c.name.toLowerCase() === 'rtx';
        }).length;
        if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
          delete transceiver.sendEncodingParameters[0].rtx;
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    pc._remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-remote-offer');
    } else {
      pc._updateSignalingState('stable');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this.transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    this.signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this.signalingState !== 'stable' || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function() {
      if (pc.needNegotiation) {
        pc.needNegotiation = false;
        var event = new Event('negotiationneeded');
        pc._dispatchEvent('negotiationneeded', event);
      }
    }, 0);
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      if (transceiver.iceTransport && !transceiver.rejected) {
        states[transceiver.iceTransport.state]++;
      }
    });

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.checking > 0) {
      newState = 'checking';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    } else if (states.completed > 0) {
      newState = 'completed';
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      if (transceiver.iceTransport && transceiver.dtlsTransport &&
          !transceiver.rejected) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      }
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    }

    if (newState !== this.connectionState) {
      this.connectionState = newState;
      var event = new Event('connectionstatechange');
      this._dispatchEvent('connectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc.transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc.usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name === 'H264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.codecs) {
          transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
            if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
                codec.clockRate === remoteCodec.clockRate) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function(hdrExt) {
        var remoteExtensions = transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions || [];
        remoteExtensions.forEach(function(rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        ssrc: (2 * sdpMLineIndex + 1) * 1001
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc.usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'completed') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    if (!(pc.signalingState === 'have-remote-offer' ||
        pc.signalingState === 'have-local-pranswer')) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer in signalingState ' + pc.signalingState));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    if (pc.usingBundle) {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    var mediaSectionsInOffer = SDPUtils.getMediaSections(
        pc._remoteDescription.sdp).length;
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === 'application') {
          if (transceiver.protocol === 'DTLS/SCTP') { // legacy fmt
            sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
          } else {
            sdp += 'm=application 0 ' + transceiver.protocol +
                ' webrtc-datachannel\r\n';
          }
        } else if (transceiver.kind === 'audio') {
          sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
              'a=rtpmap:0 PCMU/8000\r\n';
        } else if (transceiver.kind === 'video') {
          sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
              'a=rtpmap:120 VP8/90000\r\n';
        }
        sdp += 'c=IN IP4 0.0.0.0\r\n' +
            'a=inactive\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var pc = this;
    var sections;
    if (candidate && !(candidate.sdpMLineIndex !== undefined ||
        candidate.sdpMid)) {
      return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function(resolve, reject) {
      if (!pc._remoteDescription) {
        return reject(makeError('InvalidStateError',
            'Can not add ICE candidate without a remote description'));
      } else if (!candidate || candidate.candidate === '') {
        for (var j = 0; j < pc.transceivers.length; j++) {
          if (pc.transceivers[j].rejected) {
            continue;
          }
          pc.transceivers[j].iceTransport.addRemoteCandidate({});
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[j] += 'a=end-of-candidates\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
          if (pc.usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc.transceivers.length; i++) {
            if (pc.transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc.transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
            if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(makeError('OperationError',
                  'Can not add ICE candidate'));
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf('a=') === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[sdpMLineIndex] += 'a=' +
              (cand.type ? candidateString : 'end-of-candidates')
              + '\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
        } else {
          return reject(makeError('OperationError',
              'Can not add ICE candidate'));
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function(selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.rtpSender &&
            transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (transceiver.rtpReceiver &&
            transceiver.rtpReceiver.track === selector) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw makeError('InvalidAccessError', 'Invalid selector.');
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this.transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });
    return Promise.all(promises).then(function(allStats) {
      var results = new Map();
      allStats.forEach(function(stats) {
        stats.forEach(function(stat) {
          results.set(stat.id, stat);
        });
      });
      return results;
    });
  };

  // fix low-level stat names and return Map instead of object.
  var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
    'RTCIceTransport', 'RTCDtlsTransport'];
  ortcObjects.forEach(function(ortcObjectName) {
    var obj = window[ortcObjectName];
    if (obj && obj.prototype && obj.prototype.getStats) {
      var nativeGetstats = obj.prototype.getStats;
      obj.prototype.getStats = function() {
        return nativeGetstats.apply(this)
        .then(function(nativeStats) {
          var mapStats = new Map();
          Object.keys(nativeStats).forEach(function(id) {
            nativeStats[id].type = fixStatsType(nativeStats[id]);
            mapStats.set(id, nativeStats[id]);
          });
          return mapStats;
        });
      };
    }
  });

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ['createOffer', 'createAnswer'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[0] === 'function' ||
          typeof args[1] === 'function') { // legacy
        return nativeMethod.apply(this, [arguments[2]])
        .then(function(description) {
          if (typeof args[0] === 'function') {
            args[0].apply(null, [description]);
          }
        }, function(error) {
          if (typeof args[1] === 'function') {
            args[1].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function' ||
          typeof args[2] === 'function') { // legacy
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        }, function(error) {
          if (typeof args[2] === 'function') {
            args[2].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ['getStats'].forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function') {
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};

},{"sdp":118}],118:[function(require,module,exports){
/* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// returns the session description.
SDPUtils.getDescription = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    address: parts[4], // address is an alias for ip.
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.address || candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress);
    sdp.push('rport');
    sdp.push(candidate.relatedPort);
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  // legacy alias, got renamed back to channels in ORTC.
  parsed.numChannels = parsed.channels;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  var channels = codec.channels || codec.numChannels || 1;
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (channels !== 1 ? '/' + channels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
        ? '/' + headerExtension.direction
        : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      if (codec.parameters[param]) {
        params.push(param + '=' + codec.parameters[param]);
      } else {
        params.push(param);
      }
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

SDPUtils.parseSsrcGroup = function(line) {
  var parts = line.substr(13).split(' ');
  return {
    semantics: parts.shift(),
    ssrcs: parts.map(function(ssrc) {
      return parseInt(ssrc, 10);
    })
  };
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
};

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};

// Parses a=crypto lines into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
SDPUtils.parseCryptoLine = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    tag: parseInt(parts[0], 10),
    cryptoSuite: parts[1],
    keyParams: parts[2],
    sessionParams: parts.slice(3),
  };
};

SDPUtils.writeCryptoLine = function(parameters) {
  return 'a=crypto:' + parameters.tag + ' ' +
    parameters.cryptoSuite + ' ' +
    (typeof parameters.keyParams === 'object'
      ? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
      : parameters.keyParams) +
    (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') +
    '\r\n';
};

// Parses the crypto key parameters into
//   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
SDPUtils.parseCryptoKeyParams = function(keyParams) {
  if (keyParams.indexOf('inline:') !== 0) {
    return null;
  }
  var parts = keyParams.substr(7).split('|');
  return {
    keyMethod: 'inline',
    keySalt: parts[0],
    lifeTime: parts[1],
    mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
    mkiLength: parts[2] ? parts[2].split(':')[1] : undefined,
  };
};

SDPUtils.writeCryptoKeyParams = function(keyParams) {
  return keyParams.keyMethod + ':'
    + keyParams.keySalt +
    (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') +
    (keyParams.mkiValue && keyParams.mkiLength
      ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength
      : '');
};

// Extracts all SDES paramters.
SDPUtils.getCryptoParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=crypto:');
  return lines.map(SDPUtils.parseCryptoLine);
};

// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-ufrag:')[0];
  var pwd = SDPUtils.matchPrefix(mediaSection + sessionpart,
    'a=ice-pwd:')[0];
  if (!(ufrag && pwd)) {
    return null;
  }
  return {
    usernameFragment: ufrag.substr(12),
    password: pwd.substr(10),
  };
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
      mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
        mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
        mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  if (caps.headerExtensions) {
    caps.headerExtensions.forEach(function(extension) {
      sdp += SDPUtils.writeExtmap(extension);
    });
  }
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(function(line) {
      return SDPUtils.parseSsrcMedia(line);
    })
    .filter(function(parts) {
      return parts.attribute === 'cname';
    });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
    .map(function(line) {
      var parts = line.substr(17).split(' ');
      return parts.map(function(part) {
        return parseInt(part, 10);
      });
    });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10)
      };
      if (primarySsrc && secondarySsrc) {
        encParam.rtx = {ssrc: secondarySsrc};
      }
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: primarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  // Gets the first SSRC. Note tha with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(function(line) {
      return SDPUtils.parseSsrcMedia(line);
    })
    .filter(function(obj) {
      return obj.attribute === 'cname';
    })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(function(line) {
      return SDPUtils.parseSsrcMedia(line);
    })
    .filter(function(msidParts) {
      return msidParts.attribute === 'msid';
    });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// SCTP
// parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
// to draft-ietf-mmusic-sctp-sdp-05
SDPUtils.parseSctpDescription = function(mediaSection) {
  var mline = SDPUtils.parseMLine(mediaSection);
  var maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
  var maxMessageSize;
  if (maxSizeLine.length > 0) {
    maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
  }
  if (isNaN(maxMessageSize)) {
    maxMessageSize = 65536;
  }
  var sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
  if (sctpPort.length > 0) {
    return {
      port: parseInt(sctpPort[0].substr(12), 10),
      protocol: mline.fmt,
      maxMessageSize: maxMessageSize
    };
  }
  var sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
  if (sctpMapLines.length > 0) {
    var parts = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:')[0]
      .substr(10)
      .split(' ');
    return {
      port: parseInt(parts[0], 10),
      protocol: parts[1],
      maxMessageSize: maxMessageSize
    };
  }
};

// SCTP
// outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
// support by now receiving in this format, unless we originally parsed
// as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
// protocol of DTLS/SCTP -- without UDP/ or TCP/)
SDPUtils.writeSctpDescription = function(media, sctp) {
  var output = [];
  if (media.protocol !== 'DTLS/SCTP') {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctp-port:' + sctp.port + '\r\n'
    ];
  } else {
    output = [
      'm=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n',
      'c=IN IP4 0.0.0.0\r\n',
      'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n'
    ];
  }
  if (sctp.maxMessageSize !== undefined) {
    output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
  }
  return output.join('');
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
// sessUser is optional and defaults to 'thisisadapterortc'
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  var user = sessUser || 'thisisadapterortc';
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=' + user + ' ' + sessionId + ' ' + version +
        ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
    transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
    transceiver.dtlsTransport.getLocalParameters(),
    type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' ')
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  var parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5]
  };
};

// a very naive interpretation of a valid SDP.
SDPUtils.isValidSDP = function(blob) {
  if (typeof blob !== 'string' || blob.length === 0) {
    return false;
  }
  var lines = SDPUtils.splitLines(blob);
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
      return false;
    }
    // TODO: check the modifier a bit more.
  }
  return true;
};

// Expose public methods.
if (typeof module === 'object') {
  module.exports = SDPUtils;
}

},{}],119:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;

},{}],120:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],121:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":119,"./lib/rng":120}],122:[function(require,module,exports){
(function (global){(function (){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":123}],123:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var utils = require('./utils');
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var commonShim = require('./common_shim') || null;

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    commonShim: commonShim,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);
      chromeShim.shimSenderReceiverGetStats(window);
      chromeShim.fixNegotiationNeeded(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      firefoxShim.shimRemoveStream(window);
      firefoxShim.shimSenderGetStats(window);
      firefoxShim.shimReceiverGetStats(window);
      firefoxShim.shimRTCDataChannel(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);
      edgeShim.shimGetDisplayMedia(window);

      // the edge shim implements the full RTCIceCandidate object.

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      commonShim.shimCreateObjectURL(window);

      safariShim.shimRTCIceServerUrls(window);
      safariShim.shimCreateOfferLegacy(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimTrackEventTransceiver(window);
      safariShim.shimGetUserMedia(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};

},{"./chrome/chrome_shim":124,"./common_shim":126,"./edge/edge_shim":127,"./firefox/firefox_shim":130,"./safari/safari_shim":132,"./utils":133}],124:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

/* iterates the stats graph recursively. */
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach(function(name) {
    if (name.endsWith('Id')) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith('Ids')) {
      base[name].forEach(function(id) {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}

/* filter getStats for a sender/receiver track. */
function filterStats(result, track, outbound) {
  var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
  var filteredResult = new Map();
  if (track === null) {
    return filteredResult;
  }
  var trackStats = [];
  result.forEach(function(value) {
    if (value.type === 'track' &&
        value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach(function(trackStat) {
    result.forEach(function(stats) {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        },
        enumerable: true,
        configurable: true
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
          };
          pc.addEventListener('addstream', pc._ontrackpoly);
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    } else {
      // even if RTCRtpTransceiver is in window, it is only used and
      // emitted in unified-plan. Unfortunately this means we need
      // to unconditionally wrap the event.
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        if (!e.transceiver) {
          Object.defineProperty(e, 'transceiver',
            {value: {receiver: e.receiver}});
        }
        return e;
      });
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);

        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  },

  shimSenderReceiverGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender && window.RTCRtpReceiver)) {
      return;
    }

    // shim sender stats.
    if (!('getStats' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          var pc = this;
          var senders = origGetSenders.apply(pc, []);
          senders.forEach(function(sender) {
            sender._pc = pc;
          });
          return senders;
        };
      }

      var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window.RTCPeerConnection.prototype.addTrack = function() {
          var sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window.RTCRtpSender.prototype.getStats = function() {
        var sender = this;
        return this._pc.getStats().then(function(result) {
          /* Note: this will include stats of all senders that
           *   send a track with the same id as sender.track as
           *   it is not possible to identify the RTCRtpSender.
           */
          return filterStats(result, sender.track, true);
        });
      };
    }

    // shim receiver stats.
    if (!('getStats' in window.RTCRtpReceiver.prototype)) {
      var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window.RTCPeerConnection.prototype.getReceivers = function() {
          var pc = this;
          var receivers = origGetReceivers.apply(pc, []);
          receivers.forEach(function(receiver) {
            receiver._pc = pc;
          });
          return receivers;
        };
      }
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window.RTCRtpReceiver.prototype.getStats = function() {
        var receiver = this;
        return this._pc.getStats().then(function(result) {
          return filterStats(result, receiver.track, false);
        });
      };
    }

    if (!('getStats' in window.RTCRtpSender.prototype &&
        'getStats' in window.RTCRtpReceiver.prototype)) {
      return;
    }

    // shim RTCPeerConnection.getStats(track).
    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function() {
      var pc = this;
      if (arguments.length > 0 &&
          arguments[0] instanceof window.MediaStreamTrack) {
        var track = arguments[0];
        var sender;
        var receiver;
        var err;
        pc.getSenders().forEach(function(s) {
          if (s.track === track) {
            if (sender) {
              err = true;
            } else {
              sender = s;
            }
          }
        });
        pc.getReceivers().forEach(function(r) {
          if (r.track === track) {
            if (receiver) {
              err = true;
            } else {
              receiver = r;
            }
          }
          return r.track === track;
        });
        if (err || (sender && receiver)) {
          return Promise.reject(new DOMException(
            'There are more than one sender or receiver for the track.',
            'InvalidAccessError'));
        } else if (sender) {
          return sender.getStats();
        } else if (receiver) {
          return receiver.getStats();
        }
        return Promise.reject(new DOMException(
          'There is no sender or receiver for the track.',
          'InvalidAccessError'));
      }
      return origGetStats.apply(pc, arguments);
    };
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrackWithNative: function(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
        return pc._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      var existingSenders = pc.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = pc.getSenders().filter(function(newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
          var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            pc._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (pc._shimmedLocalStreams[streamId].length === 1) {
            delete pc._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  },

  shimAddTrackRemoveTrack: function(window) {
    if (!window.RTCPeerConnection) {
      return;
    }
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 65) {
      return this.shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      pc._reverseStreams = pc._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return pc._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    }
    if (!window.RTCPeerConnection) {
      return;
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var pc = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(pc, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var pc = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(pc, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var pc = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(pc, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  },

  fixNegotiationNeeded: function(window) {
    utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function(e) {
      var pc = e.target;
      if (pc.signalingState !== 'stable') {
        return;
      }
      return e;
    });
  },

  shimGetDisplayMedia: function(window, getSourceId) {
    if (!window.navigator || !window.navigator.mediaDevices ||
        'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }
    // getSourceId is a function that returns a promise resolving with
    // the sourceId of the screen/window/tab to be shared.
    if (typeof getSourceId !== 'function') {
      console.error('shimGetDisplayMedia: getSourceId argument is not ' +
          'a function');
      return;
    }
    window.navigator.mediaDevices.getDisplayMedia = function(constraints) {
      return getSourceId(constraints)
        .then(function(sourceId) {
          var widthSpecified = constraints.video && constraints.video.width;
          var heightSpecified = constraints.video && constraints.video.height;
          var frameRateSpecified = constraints.video &&
            constraints.video.frameRate;
          constraints.video = {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxFrameRate: frameRateSpecified || 3
            }
          };
          if (widthSpecified) {
            constraints.video.mandatory.maxWidth = widthSpecified;
          }
          if (heightSpecified) {
            constraints.video.mandatory.maxHeight = heightSpecified;
          }
          return window.navigator.mediaDevices.getUserMedia(constraints);
        });
    };
    window.navigator.getDisplayMedia = function(constraints) {
      utils.deprecated('navigator.getDisplayMedia',
          'navigator.mediaDevices.getDisplayMedia');
      return window.navigator.mediaDevices.getDisplayMedia(constraints);
    };
  }
};

},{"../utils.js":133,"./getusermedia":125}],125:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        PermissionDismissedError: 'NotAllowedError',
        InvalidStateError: 'NotAllowedError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotAllowedError',
        MediaDeviceKillSwitchOn: 'NotAllowedError',
        TabCaptureError: 'AbortError',
        ScreenCaptureError: 'AbortError',
        DeviceCaptureError: 'AbortError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":133}],126:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var utils = require('./utils');

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype)) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
        var nativeCandidate = new NativeRTCIceCandidate(args);
        var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
        var augmentedCandidate = Object.assign(nativeCandidate,
            parsedCandidate);

        // Add a serializer that does not serialize the extra attributes.
        augmentedCandidate.toJSON = function() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment,
          };
        };
        return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    utils.wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  },

  shimMaxMessageSize: function(window) {
    if (window.RTCSctpTransport || !window.RTCPeerConnection) {
      return;
    }
    var browserDetails = utils.detectBrowser(window);

    if (!('sctp' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
        get: function() {
          return typeof this._sctp === 'undefined' ? null : this._sctp;
        }
      });
    }

    var sctpInDescription = function(description) {
      var sections = SDPUtils.splitSections(description.sdp);
      sections.shift();
      return sections.some(function(mediaSection) {
        var mLine = SDPUtils.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application'
            && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      var version = parseInt(match[1], 10);
      // Test for NaN (yes, this is ugly)
      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;
      if (browserDetails.browser === 'firefox') {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            // FF < 57 will send in 16 KiB chunks using the deprecated PPID
            // fragmentation.
            canSendMaxMessageSize = 16384;
          } else {
            // However, other FF (and RAWRTC) can reassemble PPID-fragmented
            // messages. Thus, supporting ~2 GiB when sending.
            canSendMaxMessageSize = 2147483637;
          }
        } else if (browserDetails.version < 60) {
          // Currently, all FF >= 57 will reset the remote maximum message size
          // to the default value when a data channel is created at a later
          // stage. :(
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
          canSendMaxMessageSize =
            browserDetails.version === 57 ? 65535 : 65536;
        } else {
          // FF >= 60 supports sending ~2 GiB
          canSendMaxMessageSize = 2147483637;
        }
      }
      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536;

      // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
      if (browserDetails.browser === 'firefox'
           && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' &&
                  remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };

    var origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function() {
      var pc = this;
      pc._sctp = null;

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        var canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        var maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        var sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get: function() {
            return maxMessageSize;
          }
        });
        pc._sctp = sctp;
      }

      return origSetRemoteDescription.apply(pc, arguments);
    };
  },

  shimSendThrowTypeError: function(window) {
    if (!(window.RTCPeerConnection &&
        'createDataChannel' in window.RTCPeerConnection.prototype)) {
      return;
    }

    // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

    function wrapDcSend(dc, pc) {
      var origDataChannelSend = dc.send;
      dc.send = function() {
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;
        if (dc.readyState === 'open' &&
            pc.sctp && length > pc.sctp.maxMessageSize) {
          throw new TypeError('Message too large (can send a maximum of ' +
            pc.sctp.maxMessageSize + ' bytes)');
        }
        return origDataChannelSend.apply(dc, arguments);
      };
    }
    var origCreateDataChannel =
      window.RTCPeerConnection.prototype.createDataChannel;
    window.RTCPeerConnection.prototype.createDataChannel = function() {
      var pc = this;
      var dataChannel = origCreateDataChannel.apply(pc, arguments);
      wrapDcSend(dataChannel, pc);
      return dataChannel;
    };
    utils.wrapPeerConnectionEvent(window, 'datachannel', function(e) {
      wrapDcSend(e.channel, e.target);
      return e;
    });
  }
};

},{"./utils":133,"sdp":118}],127:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var filterIceServers = require('./filtericeservers');
var shimRTCPeerConnection = require('rtcpeerconnection-shim');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
    // Edge currently only implements the RTCDtmfSender, not the
    // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
    if (window.RTCDtmfSender && !window.RTCDTMFSender) {
      window.RTCDTMFSender = window.RTCDtmfSender;
    }

    var RTCPeerConnectionShim = shimRTCPeerConnection(window,
        browserDetails.version);
    window.RTCPeerConnection = function(config) {
      if (config && config.iceServers) {
        config.iceServers = filterIceServers(config.iceServers);
      }
      return new RTCPeerConnectionShim(config);
    };
    window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
  },
  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
        !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  },
  shimGetDisplayMedia: function(window, preferredMediaSource) {
    if (!('getDisplayMedia' in window.navigator) ||
        !window.navigator.mediaDevices ||
        'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }
    var origGetDisplayMedia = window.navigator.getDisplayMedia;
    window.navigator.mediaDevices.getDisplayMedia = function(constraints) {
      return origGetDisplayMedia.call(window.navigator, constraints);
    };
    window.navigator.getDisplayMedia = function(constraints) {
      utils.deprecated('navigator.getDisplayMedia',
          'navigator.mediaDevices.getDisplayMedia');
      return origGetDisplayMedia.call(window.navigator, constraints);
    };
  }
};

},{"../utils":133,"./filtericeservers":128,"./getusermedia":129,"rtcpeerconnection-shim":117}],128:[function(require,module,exports){
/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
module.exports = function(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
};

},{"../utils":133}],129:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],130:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        },
        enumerable: true,
        configurable: true
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  },

  shimSenderGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
      return;
    }
    var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };
    }

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function() {
        var sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function() {
      return this.track ? this._pc.getStats(this.track) :
          Promise.resolve(new Map());
    };
  },

  shimReceiverGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
      return;
    }
    var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers = function() {
        var pc = this;
        var receivers = origGetReceivers.apply(pc, []);
        receivers.forEach(function(receiver) {
          receiver._pc = pc;
        });
        return receivers;
      };
    }
    utils.wrapPeerConnectionEvent(window, 'track', function(e) {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function() {
      return this._pc.getStats(this.track);
    };
  },

  shimRemoveStream: function(window) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function(sender) {
        if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
          pc.removeTrack(sender);
        }
      });
    };
  },

  shimRTCDataChannel: function(window) {
    // rename DataChannel to RTCDataChannel (native fix in FF60):
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
    if (window.DataChannel && !window.RTCDataChannel) {
      window.RTCDataChannel = window.DataChannel;
    }
  },

  shimGetDisplayMedia: function(window, preferredMediaSource) {
    if (!window.navigator || !window.navigator.mediaDevices ||
        'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }
    window.navigator.mediaDevices.getDisplayMedia = function(constraints) {
      if (!(constraints && constraints.video)) {
        var err = new DOMException('getDisplayMedia without video ' +
            'constraints is undefined');
        err.name = 'NotFoundError';
        // from https://heycam.github.io/webidl/#idl-DOMException-error-names
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = {mediaSource: preferredMediaSource};
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return window.navigator.mediaDevices.getUserMedia(constraints);
    };
    window.navigator.getDisplayMedia = function(constraints) {
      utils.deprecated('navigator.getDisplayMedia',
          'navigator.mediaDevices.getDisplayMedia');
      return window.navigator.mediaDevices.getDisplayMedia(constraints);
    };
  }
};

},{"../utils":133,"./getusermedia":131}],131:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":133}],132:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var utils = require('../utils');

module.exports = {
  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var pc = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(pc, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        return _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var pc = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            pc.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
          }
          this.addEventListener('addstream', this._onaddstream = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(function(stream) {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              var event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
        }


        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }
        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
    };
  }
};

},{"../utils":133}],133:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;
var deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  var match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object (or false to prevent
// the event).
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      var modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        cb(modifiedEvent);
      }
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}

// Utility methods.
module.exports = {
  extractVersion: extractVersion,
  wrapPeerConnectionEvent: wrapPeerConnectionEvent,
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    if (navigator.mozGetUserMedia) { // Firefox.
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera.
      // Version matches Chrome/WebRTC version.
      result.browser = 'chrome';
      result.version = extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (window.RTCPeerConnection &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

},{}],134:[function(require,module,exports){
(function (global){(function (){
'use strict';

require('webrtc-adapter');

var _rtc_session = require('./rtc_session');

var _rtc_session2 = _interopRequireDefault(_rtc_session);

var _rtc_const = require('./rtc_const');

var _rtc_peer_connection_factory = require('./rtc_peer_connection_factory');

var _rtc_peer_connection_factory2 = _interopRequireDefault(_rtc_peer_connection_factory);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _StandardStrategy = require('./strategies/StandardStrategy');

var _StandardStrategy2 = _interopRequireDefault(_StandardStrategy);

var _CitrixVDIStrategy = require('./strategies/CitrixVDIStrategy');

var _CitrixVDIStrategy2 = _interopRequireDefault(_CitrixVDIStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @license
 * License info for uuid module assembled into js bundle:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2016 Robert Kieffer and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
global.connect = global.connect || {}; /**
                                        * @license
                                        * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                        *
                                        * SPDX-License-Identifier: Apache-2.0
                                        */
/**
 * @license
 * License info for webrtc-adapter module assembled into js bundle:
 *
 * Copyright (c) 2014, The WebRTC project authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of Google nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @license
 * License info for sdp module assembled into js bundle:
 *
 * See https://www.npmjs.com/package/sdp
 */

global.connect.RTCSession = _rtc_session2.default;
global.connect.RTCErrors = _rtc_const.RTC_ERRORS;
global.connect.RtcPeerConnectionFactory = _rtc_peer_connection_factory2.default;
global.connect.uuid = _v2.default;
global.connect.StandardStrategy = _StandardStrategy2.default;
global.connect.CitrixVDIStrategy = _CitrixVDIStrategy2.default;

global.lily = global.lily || {};
global.lily.RTCSession = _rtc_session2.default;
global.lily.RTCErrors = _rtc_const.RTC_ERRORS;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./rtc_const":136,"./rtc_peer_connection_factory":137,"./rtc_session":138,"./strategies/CitrixVDIStrategy":143,"./strategies/StandardStrategy":144,"uuid/v4":121,"webrtc-adapter":122}],135:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UnknownSignalingError = exports.UnknownSignalingErrorName = exports.CallNotFoundException = exports.CallNotFoundExceptionName = exports.BusyException = exports.BusyExceptionName = exports.UnsupportedOperation = exports.UnsupportedOperationExceptionName = exports.IllegalState = exports.IllegalStateExceptionName = exports.IllegalParameters = exports.IllegalParametersExceptionName = exports.GumTimeout = exports.GumTimeoutExceptionName = exports.Timeout = exports.TimeoutExceptionName = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
var TimeoutExceptionName = exports.TimeoutExceptionName = 'Timeout';

var Timeout = exports.Timeout = function (_Error) {
    (0, _inherits3.default)(Timeout, _Error);

    function Timeout(msg) {
        (0, _classCallCheck3.default)(this, Timeout);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Timeout.__proto__ || Object.getPrototypeOf(Timeout)).call(this, msg));

        _this.name = TimeoutExceptionName;
        return _this;
    }

    return Timeout;
}(Error);

var GumTimeoutExceptionName = exports.GumTimeoutExceptionName = 'GumTimeout';

var GumTimeout = exports.GumTimeout = function (_Timeout) {
    (0, _inherits3.default)(GumTimeout, _Timeout);

    function GumTimeout(msg) {
        (0, _classCallCheck3.default)(this, GumTimeout);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (GumTimeout.__proto__ || Object.getPrototypeOf(GumTimeout)).call(this, msg));

        _this2.name = GumTimeoutExceptionName;
        return _this2;
    }

    return GumTimeout;
}(Timeout);

var IllegalParametersExceptionName = exports.IllegalParametersExceptionName = 'IllegalParameters';

var IllegalParameters = exports.IllegalParameters = function (_Error2) {
    (0, _inherits3.default)(IllegalParameters, _Error2);

    function IllegalParameters(msg) {
        (0, _classCallCheck3.default)(this, IllegalParameters);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (IllegalParameters.__proto__ || Object.getPrototypeOf(IllegalParameters)).call(this, msg));

        _this3.name = IllegalParametersExceptionName;
        return _this3;
    }

    return IllegalParameters;
}(Error);

var IllegalStateExceptionName = exports.IllegalStateExceptionName = 'IllegalState';

var IllegalState = exports.IllegalState = function (_Error3) {
    (0, _inherits3.default)(IllegalState, _Error3);

    function IllegalState(msg) {
        (0, _classCallCheck3.default)(this, IllegalState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (IllegalState.__proto__ || Object.getPrototypeOf(IllegalState)).call(this, msg));

        _this4.name = IllegalStateExceptionName;
        return _this4;
    }

    return IllegalState;
}(Error);

var UnsupportedOperationExceptionName = exports.UnsupportedOperationExceptionName = 'UnsupportedOperation';

var UnsupportedOperation = exports.UnsupportedOperation = function (_Error4) {
    (0, _inherits3.default)(UnsupportedOperation, _Error4);

    function UnsupportedOperation(msg) {
        (0, _classCallCheck3.default)(this, UnsupportedOperation);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (UnsupportedOperation.__proto__ || Object.getPrototypeOf(UnsupportedOperation)).call(this, msg));

        _this5.name = UnsupportedOperationExceptionName;
        return _this5;
    }

    return UnsupportedOperation;
}(Error);

var BusyExceptionName = exports.BusyExceptionName = 'BusyException';

var BusyException = exports.BusyException = function (_Error5) {
    (0, _inherits3.default)(BusyException, _Error5);

    function BusyException(msg) {
        (0, _classCallCheck3.default)(this, BusyException);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (BusyException.__proto__ || Object.getPrototypeOf(BusyException)).call(this, msg));

        _this6.name = BusyExceptionName;
        return _this6;
    }

    return BusyException;
}(Error);

var CallNotFoundExceptionName = exports.CallNotFoundExceptionName = 'CallNotFoundException';

var CallNotFoundException = exports.CallNotFoundException = function (_Error6) {
    (0, _inherits3.default)(CallNotFoundException, _Error6);

    function CallNotFoundException(msg) {
        (0, _classCallCheck3.default)(this, CallNotFoundException);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, (CallNotFoundException.__proto__ || Object.getPrototypeOf(CallNotFoundException)).call(this, msg));

        _this7.name = CallNotFoundExceptionName;
        return _this7;
    }

    return CallNotFoundException;
}(Error);

var UnknownSignalingErrorName = exports.UnknownSignalingErrorName = 'UnknownSignalingError';

var UnknownSignalingError = exports.UnknownSignalingError = function (_Error7) {
    (0, _inherits3.default)(UnknownSignalingError, _Error7);

    function UnknownSignalingError() {
        (0, _classCallCheck3.default)(this, UnknownSignalingError);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, (UnknownSignalingError.__proto__ || Object.getPrototypeOf(UnknownSignalingError)).call(this));

        _this8.name = UnknownSignalingErrorName;
        return _this8;
    }

    return UnknownSignalingError;
}(Error);

},{"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/inherits":14,"babel-runtime/helpers/possibleConstructorReturn":15}],136:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Timeout waiting for server response to accept/hangup request.
 */
var MAX_ACCEPT_BYE_DELAY_MS = exports.MAX_ACCEPT_BYE_DELAY_MS = 2000;
/**
 * Timeout waiting for server response to invite.
 */
var MAX_INVITE_DELAY_MS = exports.MAX_INVITE_DELAY_MS = 5000;
/**
 *  Default timeout on opening WebSocket connection.
 */
var DEFAULT_CONNECT_TIMEOUT_MS = exports.DEFAULT_CONNECT_TIMEOUT_MS = 10000;
/**
 * Default ice collection timeout in milliseconds.
 */
var DEFAULT_ICE_TIMEOUT_MS = exports.DEFAULT_ICE_TIMEOUT_MS = 8000;
/**
 * Default gum timeout in milliseconds to be enforced during start of a call.
 */
var DEFAULT_GUM_TIMEOUT_MS = exports.DEFAULT_GUM_TIMEOUT_MS = 10000;

var SOFTPHONE_ROUTE_KEY = exports.SOFTPHONE_ROUTE_KEY = "aws/softphone";

var INVITE_METHOD_NAME = exports.INVITE_METHOD_NAME = "invite";
var ACCEPT_METHOD_NAME = exports.ACCEPT_METHOD_NAME = "accept";
var BYE_METHOD_NAME = exports.BYE_METHOD_NAME = "bye";

var RTC_PEER_CONNECTION_CONFIG = exports.RTC_PEER_CONNECTION_CONFIG = {
    iceTransportPolicy: 'relay',
    rtcpMuxPolicy: 'require',
    bundlePolicy: 'balanced',
    sdpSemantics: 'unified-plan',
    enableDtlsSrtp: true
};

var RTC_PEER_CONNECTION_OPTIONAL_CONFIG = exports.RTC_PEER_CONNECTION_OPTIONAL_CONFIG = {
    optional: [{
        googDscp: true

    }, {
        DtlsSrtpKeyAgreement: true
    }]
};

var DEFAULT_ICE_CANDIDATE_POOL_SIZE = exports.DEFAULT_ICE_CANDIDATE_POOL_SIZE = 1;

var RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS = exports.RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS = 1 * 60 * 1000;

var NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS = exports.NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS = 250;

var CHROME_SUPPORTED_VERSION = exports.CHROME_SUPPORTED_VERSION = 59;

/**
 * RTC error names.
 */
var RTC_ERRORS = exports.RTC_ERRORS = {
    ICE_COLLECTION_TIMEOUT: 'Ice Collection Timeout',
    USER_BUSY: 'User Busy',
    SIGNALLING_CONNECTION_FAILURE: 'Signalling Connection Failure',
    SIGNALLING_HANDSHAKE_FAILURE: 'Signalling Handshake Failure',
    SET_REMOTE_DESCRIPTION_FAILURE: 'Set Remote Description Failure',
    CREATE_OFFER_FAILURE: 'Create Offer Failure',
    SET_LOCAL_DESCRIPTION_FAILURE: 'Set Local Description Failure',
    INVALID_REMOTE_SDP: 'Invalid Remote SDP',
    NO_REMOTE_ICE_CANDIDATE: 'No Remote ICE Candidate',
    GUM_TIMEOUT_FAILURE: 'GUM Timeout Failure',
    GUM_OTHER_FAILURE: 'GUM Other Failure',
    CALL_NOT_FOUND: 'Call Not Found'
};

var ICE_CONNECTION_STATE = exports.ICE_CONNECTION_STATE = {
    NEW: 'new',
    CHECKING: 'checking',
    CONNECTED: 'connected',
    COMPLETED: 'completed',
    FAILED: 'failed',
    DISCONNECTED: 'disconnected',
    CLOSED: 'closed'
};

var PEER_CONNECTION_STATE = exports.PEER_CONNECTION_STATE = {
    NEW: 'new',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    FAILED: 'failed',
    DISCONNECTED: 'disconnected',
    CLOSED: 'closed'
};

},{}],137:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _rtc_const = require('./rtc_const');

var _CCPInitiationStrategyInterface = require('./strategies/CCPInitiationStrategyInterface');

var _CCPInitiationStrategyInterface2 = _interopRequireDefault(_CCPInitiationStrategyInterface);

var _StandardStrategy = require('./strategies/StandardStrategy');

var _StandardStrategy2 = _interopRequireDefault(_StandardStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RtcPeerConnectionFactory = function () {

    //transportHandle must be a callback function which should return a promise which is going to return the iceServers. Please refer https://www.w3.org/TR/webrtc/#rtciceserver-dictionary for iceServer example
    //publishError(errorType, errorMessage) must be a callback function which will publish the passed error message to client browser
    function RtcPeerConnectionFactory(logger, wssManager, clientId, transportHandle, publishError) {
        var strategy = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new _StandardStrategy2.default();
        (0, _classCallCheck3.default)(this, RtcPeerConnectionFactory);

        if (!(strategy instanceof _CCPInitiationStrategyInterface2.default)) {
            throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
        }
        (0, _utils.assertTrue)((0, _utils.isFunction)(transportHandle), 'transportHandle must be a function');
        (0, _utils.assertTrue)((0, _utils.isFunction)(publishError), 'publishError must be a function');
        this._strategy = strategy;
        this._logger = logger;
        this._clientId = clientId;
        this._wssManager = wssManager;
        this._requestIceAccess = transportHandle;
        this._publishError = publishError;
        this._earlyMediaConnectionSupported = this._isEarlyMediaConnectionSupported();
        this._initializeWebSocketEventListeners();
        this._requestPeerConnection();
        this._networkConnectivityChecker();

        this._logger.log("RTC.js is using " + strategy.getStrategyName());
    }

    (0, _createClass3.default)(RtcPeerConnectionFactory, [{
        key: '_isEarlyMediaConnectionSupported',
        value: function _isEarlyMediaConnectionSupported() {
            return this._strategy._isEarlyMediaConnectionSupported();
        }

        //This will handle the idleConnection and quota limits notification from the server

    }, {
        key: '_webSocketManagerOnMessage',
        value: function _webSocketManagerOnMessage(event) {
            var content = void 0;
            if (event.content) {
                content = JSON.parse(event.content);
            }
            if (content && this._clientId === content.clientId) {
                if (content.jsonRpcMsg.method === "idleConnection") {
                    this._clearIdleRtcPeerConnection();
                } else if (content.jsonRpcMsg.method === "quotaBreached") {
                    this._logger.log("Number of active sessions are more then allowed limit for the client " + this._clientId);
                    this._closeRTCPeerConnection();
                    this._publishError("multiple_softphone_active_sessions", "Number of active sessions are more then allowed limit.");
                }
            }
        }
    }, {
        key: '_initializeWebSocketEventListeners',
        value: function _initializeWebSocketEventListeners() {
            this._wssManager.subscribeTopics([_rtc_const.SOFTPHONE_ROUTE_KEY]);
            this._unSubscribe = this._wssManager.onMessage(_rtc_const.SOFTPHONE_ROUTE_KEY, (0, _utils.hitch)(this, this._webSocketManagerOnMessage));
        }

        // This method will create and return new peer connection if browser is not supporting early ice collection.
        // For the supported browser, this method will request for new peerConnection after returning the existing peerConnection

    }, {
        key: 'get',
        value: function get(iceServers) {
            var self = this;
            var pc = self._pc;
            self._pc = null;
            if (pc == null) {
                pc = self._createRtcPeerConnection(iceServers);
            }
            self.clearIdleRtcPeerConnectionTimerId();
            self._requestPeerConnection();
            return pc;
        }
    }, {
        key: 'clearIdleRtcPeerConnectionTimerId',
        value: function clearIdleRtcPeerConnectionTimerId() {
            var self = this;
            if (self._idleRtcPeerConnectionTimerId) {
                clearTimeout(self._idleRtcPeerConnectionTimerId);
                self._idleRtcPeerConnectionTimerId = null;
            }
        }
    }, {
        key: '_requestPeerConnection',
        value: function _requestPeerConnection() {
            var self = this;
            if (!self._peerConnectionRequestInFlight && self._earlyMediaConnectionSupported) {
                self._peerConnectionRequestInFlight = true;
                self._requestIceAccess().then(function (response) {
                    self._pc = self._createRtcPeerConnection(response);
                    self._peerConnectionRequestInFlight = false;
                    self._idleRtcPeerConnectionTimerId = setTimeout((0, _utils.hitch)(self, self._refreshRtcPeerConnection), _rtc_const.RTC_PEER_CONNECTION_IDLE_TIMEOUT_MS);
                },
                // eslint-disable-next-line no-unused-vars
                function (reason) {
                    self._peerConnectionRequestInFlight = false;
                });
            }
        }
    }, {
        key: '_networkConnectivityChecker',
        value: function _networkConnectivityChecker() {
            var self = this;
            setInterval(function () {
                if (!navigator.onLine && self._pc) {
                    self._logger.log("Network offline. Cleaning up early connection");
                    self._pc.close();
                    self._pc = null;
                }
            }, _rtc_const.NETWORK_CONNECTIVITY_CHECK_INTERVAL_MS);
        }
    }, {
        key: '_createRtcPeerConnection',
        value: function _createRtcPeerConnection(iceServers) {
            var rtcPeerConnectionConfig = JSON.parse(JSON.stringify(_rtc_const.RTC_PEER_CONNECTION_CONFIG));
            rtcPeerConnectionConfig.iceServers = iceServers;
            rtcPeerConnectionConfig.iceCandidatePoolSize = _rtc_const.DEFAULT_ICE_CANDIDATE_POOL_SIZE;
            return this._strategy._createRtcPeerConnection(rtcPeerConnectionConfig, _rtc_const.RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
        }
    }, {
        key: '_clearIdleRtcPeerConnection',
        value: function _clearIdleRtcPeerConnection() {
            this._logger.log("session is idle from long time. closing the peer connection for client " + this._clientId);
            this._closeRTCPeerConnection();
        }
    }, {
        key: '_refreshRtcPeerConnection',
        value: function _refreshRtcPeerConnection() {
            this._idleRtcPeerConnectionTimerId = null;
            this._clearIdleRtcPeerConnection();
            this._logger.log("refreshing peer connection for client " + this._clientId);
            this._requestPeerConnection();
        }
    }, {
        key: '_closeRTCPeerConnection',
        value: function _closeRTCPeerConnection() {
            if (this._pc) {
                this._pc.close();
                this._pc = null;
            }
        }
    }]);
    return RtcPeerConnectionFactory;
}();

exports.default = RtcPeerConnectionFactory;

},{"./rtc_const":136,"./strategies/CCPInitiationStrategyInterface":142,"./strategies/StandardStrategy":144,"./utils":145,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12}],138:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.CleanUpState = exports.TalkingState = exports.AcceptState = exports.InviteAnswerState = exports.ConnectSignalingAndIceCollectionState = exports.SetLocalSessionDescriptionState = exports.CreateOfferState = exports.GrabLocalMediaState = exports.RTCSessionState = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _session_report = require('./session_report');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

var _signaling = require('./signaling');

var _signaling2 = _interopRequireDefault(_signaling);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _rtpStats = require('./rtp-stats');

var _sdp = require('sdp');

var _CCPInitiationStrategyInterface = require('./strategies/CCPInitiationStrategyInterface');

var _CCPInitiationStrategyInterface2 = _interopRequireDefault(_CCPInitiationStrategyInterface);

var _StandardStrategy = require('./strategies/StandardStrategy');

var _StandardStrategy2 = _interopRequireDefault(_StandardStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
var RTCSessionState = exports.RTCSessionState = function () {
    /**
     *
     * @param {RtcSession} rtcSession
     */
    function RTCSessionState(rtcSession) {
        (0, _classCallCheck3.default)(this, RTCSessionState);

        this._rtcSession = rtcSession;
    }

    (0, _createClass3.default)(RTCSessionState, [{
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: '_isCurrentState',
        value: function _isCurrentState() {
            return this._rtcSession._state === this;
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            if (this._isCurrentState()) {
                this._rtcSession.transit(nextState);
            }
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.transit(new FailedState(this._rtcSession));
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {// eslint-disable-line no-unused-vars
            //ignore candidate by default, ConnectSignalingAndIceCollectionState will override to collect candidates, but collecting process could last much longer than ConnectSignalingAndIceCollectionState
            //we don't want to spam the console log
        }
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            throw new _exceptions.UnsupportedOperation('onRemoteHungup not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            throw new _exceptions.UnsupportedOperation('onSignalingConnected not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            throw new _exceptions.UnsupportedOperation('onSignalingHandshaked not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onSignalingFailed not implemented by ' + this.name);
        }
    }, {
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {// eslint-disable-line no-unused-vars
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._rtcSession._logger;
        }
    }, {
        key: 'name',
        get: function get() {
            return "RTCSessionState";
        }
    }]);
    return RTCSessionState;
}();

var GrabLocalMediaState = exports.GrabLocalMediaState = function (_RTCSessionState) {
    (0, _inherits3.default)(GrabLocalMediaState, _RTCSessionState);

    function GrabLocalMediaState() {
        (0, _classCallCheck3.default)(this, GrabLocalMediaState);
        return (0, _possibleConstructorReturn3.default)(this, (GrabLocalMediaState.__proto__ || Object.getPrototypeOf(GrabLocalMediaState)).apply(this, arguments));
    }

    (0, _createClass3.default)(GrabLocalMediaState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var startTime = Date.now();
            if (self._rtcSession._isUserProvidedStream) {
                self.transit(new CreateOfferState(self._rtcSession));
            } else {
                var gumTimeoutPromise = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new _exceptions.GumTimeout('Local media has not been initialized yet.'));
                    }, self._rtcSession._gumTimeoutMillis);
                });
                var sessionGumPromise = self._gUM(self._rtcSession._buildMediaConstraints());

                Promise.race([sessionGumPromise, gumTimeoutPromise]).then(function (stream) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    self._rtcSession._onGumSuccess(self._rtcSession);
                    self._rtcSession._localStream = stream;
                    self._rtcSession._sessionReport.gumOtherFailure = false;
                    self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    self.transit(new CreateOfferState(self._rtcSession));
                }).catch(function (e) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    var errorReason;
                    if (e instanceof _exceptions.GumTimeout) {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_TIMEOUT_FAILURE;
                        self._rtcSession._sessionReport.gumTimeoutFailure = true;
                        self._rtcSession._sessionReport.gumOtherFailure = false;
                    } else {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_OTHER_FAILURE;
                        self._rtcSession._sessionReport.gumOtherFailure = true;
                        self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    }
                    self.logger.error('Local media initialization failed', e);
                    self._rtcSession._onGumError(self._rtcSession);
                    self.transit(new FailedState(self._rtcSession, errorReason));
                });
            }
        }
    }, {
        key: '_gUM',
        value: function _gUM(constraints) {
            return this._rtcSession._strategy._gUM(constraints);
        }
    }, {
        key: 'name',
        get: function get() {
            return "GrabLocalMediaState";
        }
    }]);
    return GrabLocalMediaState;
}(RTCSessionState);

var CreateOfferState = exports.CreateOfferState = function (_RTCSessionState2) {
    (0, _inherits3.default)(CreateOfferState, _RTCSessionState2);

    function CreateOfferState() {
        (0, _classCallCheck3.default)(this, CreateOfferState);
        return (0, _possibleConstructorReturn3.default)(this, (CreateOfferState.__proto__ || Object.getPrototypeOf(CreateOfferState)).apply(this, arguments));
    }

    (0, _createClass3.default)(CreateOfferState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var stream = self._rtcSession._localStream;
            self._rtcSession._strategy.addStream(self._rtcSession._pc, stream);
            self._rtcSession._onLocalStreamAdded(self._rtcSession, stream);
            self._rtcSession._pc.createOffer().then(function (rtcSessionDescription) {
                self._rtcSession._localSessionDescription = rtcSessionDescription;
                self._rtcSession._sessionReport.createOfferFailure = false;
                self.transit(new SetLocalSessionDescriptionState(self._rtcSession));
            }).catch(function (e) {
                self.logger.error('CreateOffer failed', e);
                self._rtcSession._sessionReport.createOfferFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.CREATE_OFFER_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "CreateOfferState";
        }
    }]);
    return CreateOfferState;
}(RTCSessionState);

var SetLocalSessionDescriptionState = exports.SetLocalSessionDescriptionState = function (_RTCSessionState3) {
    (0, _inherits3.default)(SetLocalSessionDescriptionState, _RTCSessionState3);

    function SetLocalSessionDescriptionState() {
        (0, _classCallCheck3.default)(this, SetLocalSessionDescriptionState);
        return (0, _possibleConstructorReturn3.default)(this, (SetLocalSessionDescriptionState.__proto__ || Object.getPrototypeOf(SetLocalSessionDescriptionState)).apply(this, arguments));
    }

    (0, _createClass3.default)(SetLocalSessionDescriptionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;

            // fix/modify SDP as needed here, before setLocalDescription
            var localDescription = self._rtcSession._localSessionDescription;
            var sdpOptions = new _utils.SdpOptions();
            // Set audio codec.
            if (self._rtcSession._forceAudioCodec) {
                sdpOptions.forceCodec['audio'] = self._rtcSession._forceAudioCodec;
            }
            // Set video codec.
            if (self._rtcSession._forceVideoCodec) {
                sdpOptions.forceCodec['video'] = self._rtcSession._forceVideoCodec;
            }
            sdpOptions.enableOpusDtx = self._rtcSession._enableOpusDtx;

            var transformedSdp = (0, _utils.transformSdp)(localDescription.sdp, sdpOptions);
            localDescription.sdp = transformedSdp.sdp;
            localDescription.sdp += 'a=ptime:20\r\n';
            localDescription.sdp += 'a=maxptime:20\r\n';
            localDescription.sdp = localDescription.sdp.replace("minptime=10", "minptime=20");

            self.logger.info('LocalSD', self._rtcSession._localSessionDescription);
            self._rtcSession._pc.setLocalDescription(self._rtcSession._localSessionDescription).then(function () {
                var initializationTime = Date.now() - self._rtcSession._connectTimeStamp;
                self._rtcSession._sessionReport.initializationTimeMillis = initializationTime;
                self._rtcSession._onSessionInitialized(self._rtcSession, initializationTime);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = false;
                self.transit(new ConnectSignalingAndIceCollectionState(self._rtcSession, transformedSdp.mLines));
            }).catch(function (e) {
                self.logger.error('SetLocalDescription failed', e);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.SET_LOCAL_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "SetLocalSessionDescriptionState";
        }
    }]);
    return SetLocalSessionDescriptionState;
}(RTCSessionState);

/**
 * Kick off signaling connection. Wait until signaling connects and ICE collection (which already started in previous state) completes.
 * ICE collection times out after user specified amount of time (default to DEFAULT_ICE_TIMEOUT_MS) in case user has complex network environment that blackholes STUN/TURN requests. In this case at least one candidate is required to move forward.
 * ICE collection could also wrap up before timeout if it's determined that RTP candidates from same TURN server have been collected for all m lines.
 */


var ConnectSignalingAndIceCollectionState = exports.ConnectSignalingAndIceCollectionState = function (_RTCSessionState4) {
    (0, _inherits3.default)(ConnectSignalingAndIceCollectionState, _RTCSessionState4);

    /**
     * Create ConnectSignalingAndIceCollectionState object.
     * @param {RtcSession} rtcSession
     * @param {number} mLines Number of m lines in SDP
     */
    function ConnectSignalingAndIceCollectionState(rtcSession, mLines) {
        (0, _classCallCheck3.default)(this, ConnectSignalingAndIceCollectionState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (ConnectSignalingAndIceCollectionState.__proto__ || Object.getPrototypeOf(ConnectSignalingAndIceCollectionState)).call(this, rtcSession));

        _this4._iceCandidates = [];
        _this4._iceCandidateFoundationsMap = {};
        _this4._mLines = mLines;
        return _this4;
    }

    (0, _createClass3.default)(ConnectSignalingAndIceCollectionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            self._startTime = Date.now();
            setTimeout(function () {
                if (self._isCurrentState() && !self._iceCompleted) {
                    self.logger.warn('ICE collection timed out');
                    self._reportIceCompleted(true);
                }
            }, self._rtcSession._iceTimeoutMillis);
            self._rtcSession._createSignalingChannel().connect();
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            this._rtcSession._signallingConnectTimestamp = Date.now();
            this._rtcSession._sessionReport.signallingConnectTimeMillis = this._rtcSession._signallingConnectTimestamp - this._startTime;
            this._signalingConnected = true;
            this._rtcSession._onSignalingConnected(this._rtcSession);
            this._rtcSession._sessionReport.signallingConnectionFailure = false;
            this._checkAndTransit();
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            this._rtcSession._sessionReport.signallingConnectTimeMillis = Date.now() - this._startTime;
            this.logger.error('Failed connecting to signaling server', e);
            this._rtcSession._sessionReport.signallingConnectionFailure = true;
            this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.SIGNALLING_CONNECTION_FAILURE));
        }
    }, {
        key: '_createLocalCandidate',
        value: function _createLocalCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {
            var candidate = evt.candidate;
            this.logger.log('onicecandidate ' + JSON.stringify(candidate));
            if (candidate) {
                if (candidate.candidate) {
                    this._iceCandidates.push(this._createLocalCandidate(candidate));
                    if (!this._iceCompleted) {
                        this._checkCandidatesSufficient(candidate);
                    }
                }
            } else {
                this._reportIceCompleted(false);
            }
        }
    }, {
        key: '_checkCandidatesSufficient',
        value: function _checkCandidatesSufficient(candidate) {
            //check if we collected sufficient candidates from single media server to start the call
            var candidateObj = (0, _sdp.parseCandidate)(candidate.candidate);
            if (candidateObj.component != 1) {
                return;
            }
            var candidateFoundation = candidateObj.foundation;
            var candidateMLineIndex = candidate.sdpMLineIndex;
            if (candidateFoundation && candidateMLineIndex >= 0 && candidateMLineIndex < this._mLines) {
                var mIndexList = this._iceCandidateFoundationsMap[candidateFoundation] || [];
                if (!mIndexList.includes(candidateMLineIndex)) {
                    mIndexList.push(candidateMLineIndex);
                }
                this._iceCandidateFoundationsMap[candidateFoundation] = mIndexList;

                if (this._mLines == mIndexList.length) {
                    this._reportIceCompleted(false);
                }
            }
        }
    }, {
        key: '_reportIceCompleted',
        value: function _reportIceCompleted(isTimeout) {
            this._rtcSession._sessionReport.iceCollectionTimeMillis = Date.now() - this._startTime;
            this._iceCompleted = true;
            this._rtcSession._onIceCollectionComplete(this._rtcSession, isTimeout, this._iceCandidates.length);
            if (this._iceCandidates.length > 0) {
                this._rtcSession._sessionReport.iceCollectionFailure = false;
                this._checkAndTransit();
            } else {
                this.logger.error('No ICE candidate');
                this._rtcSession._sessionReport.iceCollectionFailure = true;
                this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.ICE_COLLECTION_TIMEOUT));
            }
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._iceCompleted && this._signalingConnected) {
                this.transit(new InviteAnswerState(this._rtcSession, this._iceCandidates));
            } else if (!this._iceCompleted) {
                this.logger.log('Pending ICE collection');
            } else {
                //implies _signalingConnected == false
                this.logger.log('Pending signaling connection');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "ConnectSignalingAndIceCollectionState";
        }
    }]);
    return ConnectSignalingAndIceCollectionState;
}(RTCSessionState);

var InviteAnswerState = exports.InviteAnswerState = function (_RTCSessionState5) {
    (0, _inherits3.default)(InviteAnswerState, _RTCSessionState5);

    function InviteAnswerState(rtcSession, iceCandidates) {
        (0, _classCallCheck3.default)(this, InviteAnswerState);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (InviteAnswerState.__proto__ || Object.getPrototypeOf(InviteAnswerState)).call(this, rtcSession));

        _this5._iceCandidates = iceCandidates;
        return _this5;
    }

    (0, _createClass3.default)(InviteAnswerState, [{
        key: 'onEnter',
        value: function onEnter() {
            var rtcSession = this._rtcSession;
            rtcSession._onSignalingStarted(rtcSession);
            rtcSession._signalingChannel.invite(rtcSession._localSessionDescription.sdp, this._iceCandidates);
        }
    }, {
        key: 'onSignalingAnswered',
        value: function onSignalingAnswered(sdp, candidates) {
            this._rtcSession._sessionReport.userBusyFailure = false;
            this._rtcSession._sessionReport.handshakingFailure = false;
            this.transit(new AcceptState(this._rtcSession, sdp, candidates));
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            var reason;
            if (e.name == _exceptions.BusyExceptionName) {
                this.logger.error('User Busy, possibly multiple CCP windows open', e);
                this._rtcSession._sessionReport.userBusyFailure = true;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.USER_BUSY;
            } else if (e.name == _exceptions.CallNotFoundExceptionName) {
                this.logger.error('Call not found. One of the participant probably hungup.', e);
                reason = _rtc_const.RTC_ERRORS.CALL_NOT_FOUND;
                this._rtcSession._sessionReport.handshakingFailure = true;
            } else {
                this.logger.error('Failed handshaking with signaling server', e);
                this._rtcSession._sessionReport.userBusyFailure = false;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
            }
            this.transit(new FailedState(this._rtcSession, reason));
        }
    }, {
        key: 'name',
        get: function get() {
            return "InviteAnswerState";
        }
    }]);
    return InviteAnswerState;
}(RTCSessionState);

var AcceptState = exports.AcceptState = function (_RTCSessionState6) {
    (0, _inherits3.default)(AcceptState, _RTCSessionState6);

    function AcceptState(rtcSession, sdp, candidates) {
        (0, _classCallCheck3.default)(this, AcceptState);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (AcceptState.__proto__ || Object.getPrototypeOf(AcceptState)).call(this, rtcSession));

        _this6._sdp = sdp;
        _this6._candidates = candidates;
        return _this6;
    }

    (0, _createClass3.default)(AcceptState, [{
        key: '_createSessionDescription',
        value: function _createSessionDescription(initDict) {
            return new RTCSessionDescription(initDict);
        }
    }, {
        key: '_createRemoteCandidate',
        value: function _createRemoteCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var rtcSession = self._rtcSession;

            if (!self._sdp) {
                self.logger.error('Invalid remote SDP');
                rtcSession._stopSession();
                rtcSession._sessionReport.invalidRemoteSDPFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.INVALID_REMOTE_SDP));
                return;
            } else if (!self._candidates || self._candidates.length < 1) {
                self.logger.error('No remote ICE candidate');
                rtcSession._stopSession();
                rtcSession._sessionReport.noRemoteIceCandidateFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.NO_REMOTE_ICE_CANDIDATE));
                return;
            }

            rtcSession._sessionReport.invalidRemoteSDPFailure = false;
            rtcSession._sessionReport.noRemoteIceCandidateFailure = false;
            self._rtcSession._strategy.setRemoteDescription(self, rtcSession);
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            this._rtcSession._sessionReport.handshakingTimeMillis = Date.now() - this._rtcSession._signallingConnectTimestamp;
            this._signalingHandshaked = true;
            this._checkAndTransit();
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._signalingHandshaked && this._remoteDescriptionSet) {
                this.transit(new TalkingState(this._rtcSession));
            } else if (!this._signalingHandshaked) {
                this.logger.log('Pending handshaking');
            } else {
                //implies _remoteDescriptionSet == false
                this.logger.log('Pending setting remote description');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "AcceptState";
        }
    }]);
    return AcceptState;
}(RTCSessionState);

var TalkingState = exports.TalkingState = function (_RTCSessionState7) {
    (0, _inherits3.default)(TalkingState, _RTCSessionState7);

    function TalkingState() {
        (0, _classCallCheck3.default)(this, TalkingState);
        return (0, _possibleConstructorReturn3.default)(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    (0, _createClass3.default)(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._sessionReport.preTalkingTimeMillis = this._startTime - this._rtcSession._connectTimeStamp;
            this._rtcSession._onSessionConnected(this._rtcSession);
        }
    }, {
        key: 'onSignalingReconnected',
        value: function onSignalingReconnected() {}
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {
            var iceState = this._rtcSession._strategy.onIceStateChange(evt, this._rtcSession._pc);
            this.logger.info('ICE Connection State: ', iceState);

            if (iceState == _rtc_const.ICE_CONNECTION_STATE.DISCONNECTED) {
                this.logger.info('Lost ICE connection');
                this._rtcSession._sessionReport.iceConnectionsLost += 1;
            }
            if (iceState == _rtc_const.ICE_CONNECTION_STATE.FAILED) {
                this._rtcSession._sessionReport.iceConnectionsFailed = true;
            }
        }
    }, {
        key: 'onPeerConnectionStateChange',
        value: function onPeerConnectionStateChange() {
            var peerConnectionState = this._rtcSession._strategy.onPeerConnectionStateChange(this._rtcSession._pc);
            this.logger.info('Peer Connection State: ', peerConnectionState);

            if (peerConnectionState == _rtc_const.PEER_CONNECTION_STATE.FAILED) {
                this._rtcSession._sessionReport.peerConnectionFailed = true;
            }
        }
    }, {
        key: 'onExit',
        value: function onExit() {
            this._rtcSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
            this._rtcSession._detachMedia();
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionCompleted(this._rtcSession);
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);
    return TalkingState;
}(RTCSessionState);

var CleanUpState = exports.CleanUpState = function (_RTCSessionState8) {
    (0, _inherits3.default)(CleanUpState, _RTCSessionState8);

    function CleanUpState() {
        (0, _classCallCheck3.default)(this, CleanUpState);
        return (0, _possibleConstructorReturn3.default)(this, (CleanUpState.__proto__ || Object.getPrototypeOf(CleanUpState)).apply(this, arguments));
    }

    (0, _createClass3.default)(CleanUpState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._stopSession();
            this._rtcSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
            this._rtcSession._onSessionDestroyed(this._rtcSession, this._rtcSession._sessionReport);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            //do nothing, already at the end of lifecycle
        }
    }, {
        key: 'name',
        get: function get() {
            return "CleanUpState";
        }
    }]);
    return CleanUpState;
}(RTCSessionState);

var DisconnectedState = exports.DisconnectedState = function (_CleanUpState) {
    (0, _inherits3.default)(DisconnectedState, _CleanUpState);

    function DisconnectedState() {
        (0, _classCallCheck3.default)(this, DisconnectedState);
        return (0, _possibleConstructorReturn3.default)(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    (0, _createClass3.default)(DisconnectedState, [{
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);
    return DisconnectedState;
}(CleanUpState);

var FailedState = exports.FailedState = function (_CleanUpState2) {
    (0, _inherits3.default)(FailedState, _CleanUpState2);

    function FailedState(rtcSession, failureReason) {
        (0, _classCallCheck3.default)(this, FailedState);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, rtcSession));

        _this10._failureReason = failureReason;
        return _this10;
    }

    (0, _createClass3.default)(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionFailed(this._rtcSession, this._failureReason);
            (0, _get3.default)(FailedState.prototype.__proto__ || Object.getPrototypeOf(FailedState.prototype), 'onEnter', this).call(this);
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }]);
    return FailedState;
}(CleanUpState);

var RtcSession = function () {
    /**
     * Build an AmazonConnect RTC session.
     * @param {*} signalingUri
     * @param {*} iceServers Array of ice servers
     * @param {*} contactToken A string representing the contact token (optional)
     * @param {*} logger An object provides logging functions, such as console
     * @param {*} contactId Must be UUID, uniquely identifies the session.
     */
    function RtcSession(signalingUri, iceServers, contactToken, logger, contactId, connectionId, wssManager) {
        var strategy = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : new _StandardStrategy2.default();
        (0, _classCallCheck3.default)(this, RtcSession);

        if (!(strategy instanceof _CCPInitiationStrategyInterface2.default)) {
            throw new Error('Expected a strategy of type CCPInitiationStrategyInterface');
        }
        if (typeof signalingUri !== 'string' || signalingUri.trim().length === 0) {
            throw new _exceptions.IllegalParameters('signalingUri required');
        }
        if (!iceServers) {
            throw new _exceptions.IllegalParameters('iceServers required');
        }
        if ((typeof logger === 'undefined' ? 'undefined' : (0, _typeof3.default)(logger)) !== 'object') {
            throw new _exceptions.IllegalParameters('logger required');
        }
        if (!contactId) {
            this._callId = (0, _v2.default)();
        } else {
            this._callId = contactId;
        }
        this._strategy = strategy;
        this._connectionId = connectionId;
        this._wssManager = wssManager;
        this._sessionReport = new _session_report.SessionReport();
        this._signalingUri = signalingUri;
        this._iceServers = iceServers;
        this._contactToken = contactToken;
        this._originalLogger = logger;
        this._logger = (0, _utils.wrapLogger)(this._originalLogger, this._callId, 'SESSION');
        this._iceTimeoutMillis = _rtc_const.DEFAULT_ICE_TIMEOUT_MS;
        this._gumTimeoutMillis = _rtc_const.DEFAULT_GUM_TIMEOUT_MS;

        this._enableAudio = true;
        this._enableVideo = false;
        this._facingMode = 'user';
        this._legacyStatsReportSupport = false;
        /**
         * user may provide the stream to the RtcSession directly to connect to the other end.
         * user may also acquire the stream from the local device.
         * This flag is used to track where the stream is acquired.
         * If it's acquired from local devices, then we must close the stream when the session ends.
         * If it's provided by user (rather than local camera/microphone), then we should leave it open when the
         * session ends.
         */
        this._isUserProvidedStream = false;

        this._onGumError = this._onGumSuccess = this._onLocalStreamAdded = this._onSessionFailed = this._onSessionInitialized = this._onSignalingConnected = this._onIceCollectionComplete = this._onSignalingStarted = this._onSessionConnected = this._onRemoteStreamAdded = this._onSessionCompleted = this._onSessionDestroyed = function () {};
    }

    (0, _createClass3.default)(RtcSession, [{
        key: 'pauseLocalVideo',
        value: function pauseLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalVideo',
        value: function resumeLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteVideo',
        value: function pauseRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteVideo',
        value: function resumeRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseLocalAudio',
        value: function pauseLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalAudio',
        value: function resumeLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteAudio',
        value: function pauseRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteAudio',
        value: function resumeRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
        /**
         * Callback when gUM succeeds.
         * First param is RtcSession object.
         */

    }, {
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this._state && this._state.onExit) {
                    this._state.onExit();
                }
            } finally {
                this._state = nextState;
                if (nextState.onEnter) {
                    try {
                        nextState.onEnter();
                    } catch (e) {
                        this._logger.warn(nextState.name + '#onEnter failed', e);
                        throw e; // eslint-disable-line no-unsafe-finally
                    }
                }
            }
        }
    }, {
        key: '_createSignalingChannel',
        value: function _createSignalingChannel() {
            var signalingChannel = new _signaling2.default(this._callId, this._signalingUri, this._contactToken, this._originalLogger, this._signalingConnectTimeout, this._connectionId, this._wssManager);
            signalingChannel.onConnected = (0, _utils.hitch)(this, this._signalingConnected);
            signalingChannel.onAnswered = (0, _utils.hitch)(this, this._signalingAnswered);
            signalingChannel.onHandshaked = (0, _utils.hitch)(this, this._signalingHandshaked);
            signalingChannel.onRemoteHungup = (0, _utils.hitch)(this, this._signalingRemoteHungup);
            signalingChannel.onFailed = (0, _utils.hitch)(this, this._signalingFailed);
            signalingChannel.onDisconnected = (0, _utils.hitch)(this, this._signalingDisconnected);

            this._signalingChannel = signalingChannel;

            return signalingChannel;
        }
    }, {
        key: '_signalingConnected',
        value: function _signalingConnected() {
            this._state.onSignalingConnected();
        }
    }, {
        key: '_signalingAnswered',
        value: function _signalingAnswered(sdp, candidates) {
            this._state.onSignalingAnswered(sdp, candidates);
        }
    }, {
        key: '_signalingHandshaked',
        value: function _signalingHandshaked() {
            this._state.onSignalingHandshaked();
        }
    }, {
        key: '_signalingRemoteHungup',
        value: function _signalingRemoteHungup() {
            this._state.onRemoteHungup();
        }
    }, {
        key: '_signalingFailed',
        value: function _signalingFailed(e) {
            this._state.onSignalingFailed(e);
        }
    }, {
        key: '_signalingDisconnected',
        value: function _signalingDisconnected() {}
    }, {
        key: '_createPeerConnection',
        value: function _createPeerConnection(configuration, optionalConfiguration) {
            return this._strategy._createPeerConnection(configuration, optionalConfiguration);
        }
    }, {
        key: 'connect',
        value: function connect(pc) {
            var self = this;
            var now = new Date();
            self._sessionReport.sessionStartTime = now;
            self._connectTimeStamp = now.getTime();
            if (pc && pc.signalingState != 'closed') {
                self._pc = pc;
            } else {
                if (pc) {
                    pc.close();
                    pc = null;
                }
                _rtc_const.RTC_PEER_CONNECTION_CONFIG.iceServers = self._iceServers;
                self._pc = self._createPeerConnection(_rtc_const.RTC_PEER_CONNECTION_CONFIG, _rtc_const.RTC_PEER_CONNECTION_OPTIONAL_CONFIG);
            }
            self._strategy.connect(self);
            self._pc.onicecandidate = (0, _utils.hitch)(self, self._onIceCandidate);
            self._pc.onconnectionstatechange = (0, _utils.hitch)(self, self._onPeerConnectionStateChange);
            self._pc.oniceconnectionstatechange = (0, _utils.hitch)(self, self._onIceStateChange);

            (0, _utils.isLegacyStatsReportSupported)(self._pc).then(function (result) {
                self._legacyStatsReportSupport = result;
                self.transit(new GrabLocalMediaState(self));
            });
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept does not go through signaling channel at this moment');
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._state.hangup();
        }

        /**
         * Get a promise containing an object with two named lists of audio stats, one for each channel on each
         * media type of 'video' and 'audio'.
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getStats',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var _this11 = this;

                var timestamp, impl, statsResult, rttReducer, audioInputRttMilliseconds, videoInputRttMilliseconds;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                timestamp = new Date();

                                impl = function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(stream, streamType) {
                                        var tracks;
                                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        tracks = [];

                                                        if (stream) {
                                                            _context2.next = 3;
                                                            break;
                                                        }

                                                        return _context2.abrupt('return', []);

                                                    case 3:
                                                        _context2.t0 = streamType;
                                                        _context2.next = _context2.t0 === 'audio_input' ? 6 : _context2.t0 === 'audio_output' ? 6 : _context2.t0 === 'video_input' ? 8 : _context2.t0 === 'video_output' ? 8 : 10;
                                                        break;

                                                    case 6:
                                                        tracks = stream.getAudioTracks();
                                                        return _context2.abrupt('break', 11);

                                                    case 8:
                                                        tracks = stream.getVideoTracks();
                                                        return _context2.abrupt('break', 11);

                                                    case 10:
                                                        throw new Error('Unsupported stream type while trying to get stats: ' + streamType);

                                                    case 11:
                                                        _context2.next = 13;
                                                        return Promise.all(tracks.map((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                                            return _regenerator2.default.wrap(function _callee$(_context) {
                                                                while (1) {
                                                                    switch (_context.prev = _context.next) {
                                                                        case 0:
                                                                            return _context.abrupt('return', _this11._pc.getStats().then(function (rawStats) {
                                                                                var digestedStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, rawStats, streamType);
                                                                                if (!digestedStats) {
                                                                                    throw new Error('Failed to extract MediaRtpStats from RTCStatsReport for stream type ' + streamType);
                                                                                }
                                                                                return digestedStats;
                                                                            }));

                                                                        case 1:
                                                                        case 'end':
                                                                            return _context.stop();
                                                                    }
                                                                }
                                                            }, _callee, _this11);
                                                        }))));

                                                    case 13:
                                                        return _context2.abrupt('return', _context2.sent);

                                                    case 14:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this11);
                                    }));

                                    return function impl(_x2, _x3) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }();

                                if (!(this._pc && this._pc.signalingState === 'stable')) {
                                    _context3.next = 26;
                                    break;
                                }

                                _context3.next = 5;
                                return impl(this._remoteAudioStream, 'audio_input');

                            case 5:
                                _context3.t0 = _context3.sent;
                                _context3.next = 8;
                                return impl(this._localStream, 'audio_output');

                            case 8:
                                _context3.t1 = _context3.sent;
                                _context3.t2 = {
                                    input: _context3.t0,
                                    output: _context3.t1
                                };
                                _context3.next = 12;
                                return impl(this._remoteVideoStream, 'video_input');

                            case 12:
                                _context3.t3 = _context3.sent;
                                _context3.next = 15;
                                return impl(this._localStream, 'video_output');

                            case 15:
                                _context3.t4 = _context3.sent;
                                _context3.t5 = {
                                    input: _context3.t3,
                                    output: _context3.t4
                                };
                                statsResult = {
                                    audio: _context3.t2,
                                    video: _context3.t5
                                };

                                // For consistency's sake, coalesce rttMilliseconds into the output for audio and video.
                                rttReducer = function rttReducer(acc, stats) {
                                    if (stats.rttMilliseconds !== null && (acc === null || stats.rttMilliseconds > acc)) {
                                        acc = stats.rttMilliseconds;
                                    }
                                    stats._rttMilliseconds = null;
                                    return acc;
                                };

                                audioInputRttMilliseconds = statsResult.audio.input.reduce(rttReducer, null);
                                videoInputRttMilliseconds = statsResult.video.input.reduce(rttReducer, null);


                                if (audioInputRttMilliseconds !== null) {
                                    statsResult.audio.output.forEach(function (stats) {
                                        stats._rttMilliseconds = audioInputRttMilliseconds;
                                    });
                                }

                                if (videoInputRttMilliseconds !== null) {
                                    statsResult.video.output.forEach(function (stats) {
                                        stats._rttMilliseconds = videoInputRttMilliseconds;
                                    });
                                }

                                return _context3.abrupt('return', statsResult);

                            case 26:
                                return _context3.abrupt('return', Promise.reject(new _exceptions.IllegalState()));

                            case 27:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getStats() {
                return _ref.apply(this, arguments);
            }

            return getStats;
        }()

        /**
         * Get a promise of MediaRtpStats object for remote audio (from Amazon Connect to client).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getRemoteAudioStats',
        value: function getRemoteAudioStats() {
            return this.getStats().then(function (stats) {
                if (stats.audio.output.length > 0) {
                    return stats.audio.output[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user audio (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getUserAudioStats',
        value: function getUserAudioStats() {
            return this.getStats().then(function (stats) {
                if (stats.audio.input.length > 0) {
                    return stats.audio.input[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getRemoteVideoStats',
        value: function getRemoteVideoStats() {
            return this.getStats().then(function (stats) {
                if (stats.video.output.length > 0) {
                    return stats.video.output[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         * @deprecated in favor of getStats()
         */

    }, {
        key: 'getUserVideoStats',
        value: function getUserVideoStats() {
            return this.getStats().then(function (stats) {
                if (stats.video.input.length > 0) {
                    return stats.video.input[0];
                } else {
                    return Promise.reject(new _exceptions.IllegalState());
                }
            });
        }
    }, {
        key: '_onIceCandidate',
        value: function _onIceCandidate(evt) {
            this._state.onIceCandidate(evt);
        }
    }, {
        key: '_onPeerConnectionStateChange',
        value: function _onPeerConnectionStateChange() {
            this._state.onPeerConnectionStateChange();
        }
    }, {
        key: '_onIceStateChange',
        value: function _onIceStateChange(evt) {
            this._state.onIceStateChange(evt);
        }

        /**
         * Attach remote media stream to web element.
         */

    }, {
        key: '_ontrack',
        value: function _ontrack(evt) {
            this._strategy._ontrack(this, evt);
            this._onRemoteStreamAdded(this, evt.streams[0]);
        }
    }, {
        key: '_detachMedia',
        value: function _detachMedia() {
            if (this._remoteVideoElement) {
                this._remoteVideoElement.srcObject = null;
            }
            if (this._remoteAudioElement) {
                this._remoteAudioElement.srcObject = null;
                this._remoteAudioStream = null;
            }
        }
    }, {
        key: '_stopSession',
        value: function _stopSession() {
            try {
                if (this._localStream && !this._isUserProvidedStream) {
                    (0, _utils.closeStream)(this._localStream);
                    this._localStream = null;
                    this._isUserProvidedStream = false;
                }
            } finally {
                try {
                    if (this._pc) {
                        this._pc.close();
                    }
                } catch (e) {
                    // eat exception
                } finally {
                    this._pc = null;
                }
            }
        }
    }, {
        key: '_buildMediaConstraints',
        value: function _buildMediaConstraints() {
            var self = this;
            var mediaConstraints = {};

            self._strategy._buildMediaConstraints(self, mediaConstraints);

            if (self._enableVideo) {
                var videoConstraints = {};
                var widthConstraints = {};
                var heightConstraints = {};
                var frameRateConstraints = {};

                //build video width constraints
                if (typeof self._idealVideoWidth !== 'undefined') {
                    widthConstraints.ideal = self._idealVideoWidth;
                }
                if (typeof self._maxVideoWidth !== 'undefined') {
                    widthConstraints.max = self._maxVideoWidth;
                }
                if (typeof self._minVideoWidth !== 'undefined') {
                    widthConstraints.min = self._minVideoWidth;
                }
                // build video height constraints
                if (typeof self._idealVideoHeight !== 'undefined') {
                    heightConstraints.ideal = self._idealVideoHeight;
                }
                if (typeof self._maxVideoHeight !== 'undefined') {
                    heightConstraints.max = self._maxVideoHeight;
                }
                if (typeof self._minVideoHeight !== 'undefined') {
                    heightConstraints.min = self._minVideoHeight;
                }
                if (Object.keys(widthConstraints).length > 0 && Object.keys(heightConstraints).length > 0) {
                    videoConstraints.width = widthConstraints;
                    videoConstraints.height = heightConstraints;
                }
                // build frame rate constraints
                if (typeof self._videoFrameRate !== 'undefined') {
                    frameRateConstraints.ideal = self._videoFrameRate;
                }
                if (typeof self._minVideoFrameRate !== 'undefined') {
                    frameRateConstraints.min = self._minVideoFrameRate;
                }
                if (typeof self._maxVideoFrameRate !== 'undefined') {
                    frameRateConstraints.max = self._maxVideoFrameRate;
                }
                if (Object.keys(frameRateConstraints).length > 0) {
                    videoConstraints.frameRate = frameRateConstraints;
                }

                // build facing mode constraints
                if (self._facingMode !== 'user' && self._facingMode !== "environment") {
                    self._facingMode = 'user';
                }
                videoConstraints.facingMode = self._facingMode;

                // set video constraints
                if (Object.keys(videoConstraints).length > 0) {
                    mediaConstraints.video = videoConstraints;
                } else {
                    mediaConstraints.video = true;
                }
            }

            return mediaConstraints;
        }
    }, {
        key: 'sessionReport',
        get: function get() {
            return this._sessionReport;
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
        /**
         * getMediaStream returns the local stream, which may be acquired from local device or from user provided stream.
         * Rather than getting a stream by calling getUserMedia (which gets a stream from local device such as camera),
         * user could also provide the stream to the RtcSession directly to connect to the other end.
         */

    }, {
        key: 'mediaStream',
        get: function get() {
            return this._localStream;
        },

        /**
         * Optional. RtcSession will grab input device if this is not specified.
         * Please note: this RtcSession class only support single audio track and/or single video track.
         */
        set: function set(input) {
            this._localStream = input;
            this._isUserProvidedStream = true;
        }
        /**
         * Needed, expect an audio element that can be used to play remote audio stream.
         */

    }, {
        key: 'remoteVideoStream',
        get: function get() {
            return this._remoteVideoStream;
        }
    }, {
        key: 'onGumSuccess',
        set: function set(handler) {
            this._onGumSuccess = handler;
        }
        /**
         * Callback when gUM fails.
         * First param is RtcSession object.
         * Second param is the error.
         */

    }, {
        key: 'onGumError',
        set: function set(handler) {
            this._onGumError = handler;
        }
        /**
         * Callback if failed initializing local resources
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionFailed',
        set: function set(handler) {
            this._onSessionFailed = handler;
        }
        /**
         * Callback after local user media stream is added to the session.
         * First param is RtcSession object.
         * Second param is media stream
         */

    }, {
        key: 'onLocalStreamAdded',
        set: function set(handler) {
            this._onLocalStreamAdded = handler;
        }
        /**
         * Callback when all local resources are ready. Establishing signaling chanel and ICE collection happens at the same time after this.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionInitialized',
        set: function set(handler) {
            this._onSessionInitialized = handler;
        }
        /**
         * Callback when signaling channel is established.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingConnected',
        set: function set(handler) {
            this._onSignalingConnected = handler;
        }
        /**
         * Callback when ICE collection completes either because there is no more candidate or collection timed out.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         * Second param is boolean, TRUE - ICE collection timed out.
         * Third param is number of candidates collected.
         */

    }, {
        key: 'onIceCollectionComplete',
        set: function set(handler) {
            this._onIceCollectionComplete = handler;
        }
        /**
         * Callback when signaling channel is established and ICE collection completed with at least one candidate.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingStarted',
        set: function set(handler) {
            this._onSignalingStarted = handler;
        }
        /**
         * Callback when the call is established (handshaked and media stream should be flowing)
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionConnected',
        set: function set(handler) {
            this._onSessionConnected = handler;
        }
        /**
         * Callback after remote media stream is added to the session.
         * This could be called multiple times with the same stream if multiple tracks are included in the same stream.
         *
         * First param is RtcSession object.
         * Second param is media stream track.
         */

    }, {
        key: 'onRemoteStreamAdded',
        set: function set(handler) {
            this._onRemoteStreamAdded = handler;
        }
        /**
         * Callback when the hangup is initiated (implies the call was successfully established).
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionCompleted',
        set: function set(handler) {
            this._onSessionCompleted = handler;
        }
        /**
         * Callback after session is cleaned up, no matter if the call was successfully established or not.
         * First param is RtcSession object.
         * Second param is SessionReport object.
         */

    }, {
        key: 'onSessionDestroyed',
        set: function set(handler) {
            this._onSessionDestroyed = handler;
        }
    }, {
        key: 'enableAudio',
        set: function set(flag) {
            this._enableAudio = flag;
        }
    }, {
        key: 'echoCancellation',
        set: function set(flag) {
            this._echoCancellation = flag;
        }
    }, {
        key: 'enableVideo',
        set: function set(flag) {
            this._enableVideo = flag;
        }
    }, {
        key: 'maxVideoFrameRate',
        set: function set(frameRate) {
            this._maxVideoFrameRate = frameRate;
        }
    }, {
        key: 'minVideoFrameRate',
        set: function set(frameRate) {
            this._minVideoFrameRate = frameRate;
        }
    }, {
        key: 'videoFrameRate',
        set: function set(frameRate) {
            this._videoFrameRate = frameRate;
        }
    }, {
        key: 'maxVideoWidth',
        set: function set(width) {
            this._maxVideoWidth = width;
        }
    }, {
        key: 'minVideoWidth',
        set: function set(width) {
            this._minVideoWidth = width;
        }
    }, {
        key: 'idealVideoWidth',
        set: function set(width) {
            this._idealVideoWidth = width;
        }
    }, {
        key: 'maxVideoHeight',
        set: function set(height) {
            this._maxVideoHeight = height;
        }
    }, {
        key: 'minVideoHeight',
        set: function set(height) {
            this._minVideoHeight = height;
        }
    }, {
        key: 'idealVideoHeight',
        set: function set(height) {
            this._idealVideoHeight = height;
        }
    }, {
        key: 'facingMode',
        set: function set(mode) {
            this._facingMode = mode;
        }
    }, {
        key: 'remoteAudioElement',
        set: function set(element) {
            this._remoteAudioElement = element;
        }
    }, {
        key: 'remoteVideoElement',
        set: function set(element) {
            this._remoteVideoElement = element;
        }
        /**
         * Override the default signaling connect time out.
         */

    }, {
        key: 'signalingConnectTimeout',
        set: function set(ms) {
            this._signalingConnectTimeout = ms;
        }
        /**
         * Override the default ICE collection time limit.
         */

    }, {
        key: 'iceTimeoutMillis',
        set: function set(timeoutMillis) {
            this._iceTimeoutMillis = timeoutMillis;
        }
        /**
         * Override the default GUM timeout time limit.
         */

    }, {
        key: 'gumTimeoutMillis',
        set: function set(timeoutMillis) {
            this._gumTimeoutMillis = timeoutMillis;
        }
        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported audio codecs: opus.
         */

    }, {
        key: 'forceAudioCodec',
        set: function set(audioCodec) {
            this._forceAudioCodec = audioCodec;
        }

        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported video codecs: VP8, VP9, H264.
         */

    }, {
        key: 'forceVideoCodec',
        set: function set(videoCodec) {
            this._forceVideoCodec = videoCodec;
        }

        /**
         * connect-rtc-js disables OPUS DTX by default because it harms audio quality.
         * @param flag boolean
         */

    }, {
        key: 'enableOpusDtx',
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }
    }]);
    return RtcSession;
}();

exports.default = RtcSession;

},{"./exceptions":135,"./rtc_const":136,"./rtp-stats":139,"./session_report":140,"./signaling":141,"./strategies/CCPInitiationStrategyInterface":142,"./strategies/StandardStrategy":144,"./utils":145,"babel-runtime/helpers/asyncToGenerator":10,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12,"babel-runtime/helpers/get":13,"babel-runtime/helpers/inherits":14,"babel-runtime/helpers/possibleConstructorReturn":15,"babel-runtime/helpers/typeof":16,"babel-runtime/regenerator":19,"sdp":118,"uuid/v4":121}],139:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.extractMediaStatsFromStats = extractMediaStatsFromStats;

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractMediaStatsFromStats(timestamp, stats, streamType) {
    var extractedStats = null;
    var reportType = null;

    stats.forEach(function (statsReport) {
        if (statsReport) {
            if (statsReport.type === 'inbound-rtp' && streamType === 'audio_input') {
                // inbound-rtp: Stats for stream from Server to CCP, as seen on the browser
                reportType = statsReport.type;
                extractedStats = {
                    timestamp: timestamp,
                    packetsLost: statsReport.packetsLost,
                    // packetsCount: number of packet received by CCP, as seen on the browser
                    packetsCount: statsReport.packetsReceived,
                    jbMilliseconds: Math.floor((0, _utils.when_defined)(statsReport.jitter, 0) * 1000),
                    // Multiplying audioLevel by 32768 aligns its value with the legacy getStats API.
                    audioLevel: (0, _utils.is_defined)(statsReport.audioLevel) ? Math.floor(statsReport.audioLevel * 32768) : null
                };
            } else if (statsReport.type === 'outbound-rtp' && streamType === 'audio_output') {
                // outbound-rtp: Stats for stream from CCP to Server, as seen on the browser
                extractedStats = extractedStats || {};
                // packetsCount: number of packet sent by CCP, as seen on the browser
                extractedStats.packetsCount = statsReport.packetsSent;
            } else if (statsReport.type === 'media-source' && streamType === 'audio_output') {
                extractedStats = extractedStats || {};
                // Multiplying audioLevel by 32768 aligns its value with the legacy getStats API.
                extractedStats.audioLevel = (0, _utils.is_defined)(statsReport.audioLevel) ? Math.floor(statsReport.audioLevel * 32768) : null;
            } else if (statsReport.type === 'remote-inbound-rtp' && streamType === 'audio_output') {
                // remote-inbound-rtp: Stats for stream from CCP to Server, as seen on Server side
                reportType = statsReport.type;
                extractedStats = extractedStats || {};
                extractedStats.timestamp = timestamp;
                extractedStats.packetsLost = statsReport.packetsLost;
                extractedStats.rttMilliseconds = (0, _utils.is_defined)(statsReport.roundTripTime) ? Math.floor(statsReport.roundTripTime * 1000) : null;
                extractedStats.jbMilliseconds = Math.floor((0, _utils.when_defined)(statsReport.jitter, 0) * 1000);
            }
        }
    });

    return extractedStats ? new MediaRtpStats(extractedStats, reportType, streamType) : null;
}

/**
 * Basic RTP statistics object, represents statistics of an audio or video stream.
 */
/**
 * Extract rtp stats of specified stream from RTCStatsReport
 * Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
 * StreamType is passed only to pull right stream stats audio_input or audio_output.
 */

var MediaRtpStats = function () {
    function MediaRtpStats(paramsIn, statsReportType, streamType) {
        (0, _classCallCheck3.default)(this, MediaRtpStats);

        var params = paramsIn || {};

        this._timestamp = params.timestamp || new Date().getTime();
        this._packetsLost = (0, _utils.when_defined)(params.packetsLost);
        this._packetsCount = (0, _utils.when_defined)(params.packetsCount);
        this._audioLevel = (0, _utils.when_defined)(params.audioLevel);
        this._procMilliseconds = (0, _utils.when_defined)(params.procMilliseconds);
        this._rttMilliseconds = (0, _utils.when_defined)(params.rttMilliseconds);
        this._jbMilliseconds = (0, _utils.when_defined)(params.jbMilliseconds);
        this._bytesSent = (0, _utils.when_defined)(params.bytesSent);
        this._bytesReceived = (0, _utils.when_defined)(params.bytesReceived);
        this._framesEncoded = (0, _utils.when_defined)(params.framesEncoded);
        this._framesDecoded = (0, _utils.when_defined)(params.framesDecoded);
        this._frameRateSent = (0, _utils.when_defined)(params.frameRateSent);
        this._frameRateReceived = (0, _utils.when_defined)(params.frameRateReceived);
        this._statsReportType = statsReportType || params._statsReportType || "unknown";
        this._streamType = streamType || params.streamType || "unknown";
    }

    /** {number} number of packets sent to the channel */


    (0, _createClass3.default)(MediaRtpStats, [{
        key: 'packetsCount',
        get: function get() {
            return this._packetsCount;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetsLost',
        get: function get() {
            return this._packetsLost;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetLossPercentage',
        get: function get() {
            return this._packetsCount > 0 ? this._packetsLost / this._packetsCount : 0;
        }
        /** Audio volume level
         * Currently firefox doesn't provide audio level in rtp stats.
         */

    }, {
        key: 'audioLevel',
        get: function get() {
            return this._audioLevel;
        }
        /** Timestamp when stats are collected. */

    }, {
        key: 'timestamp',
        get: function get() {
            return this._timestamp;
        }
        /** {number} Processing delay calculated by time to process packet header */

    }, {
        key: 'procMilliseconds',
        get: function get() {
            return this._procMilliseconds;
        }
        /** {number} Round trip time calculated with RTCP reports */

    }, {
        key: 'rttMilliseconds',
        get: function get() {
            return this._rttMilliseconds;
        }
        /** {number} Statistical variance of RTP data packet inter-arrival time */

    }, {
        key: 'jbMilliseconds',
        get: function get() {
            return this._jbMilliseconds;
        }
        /** {number} number of bytes sent to the channel*/

    }, {
        key: 'bytesSent',
        get: function get() {
            return this._bytesSent;
        }
        /** {number} number of bytes received from the channel*/

    }, {
        key: 'bytesReceived',
        get: function get() {
            return this._bytesReceived;
        }
        /** {number} number of video frames encoded*/

    }, {
        key: 'framesEncoded',
        get: function get() {
            return this._framesEncoded;
        }
        /** {number} number of video frames decoded*/

    }, {
        key: 'framesDecoded',
        get: function get() {
            return this._framesDecoded;
        }
        /** {number} frames per second sent to the channel*/

    }, {
        key: 'frameRateSent',
        get: function get() {
            return this._frameRateSent;
        }
        /** {number} frames per second received from the channel*/

    }, {
        key: 'frameRateReceived',
        get: function get() {
            return this._frameRateReceived;
        }
        /** {string} the type of the stats report */

    }, {
        key: 'statsReportType',
        get: function get() {
            return this._statsReportType;
        }
        /** {string} the type of the stream */

    }, {
        key: 'streamType',
        get: function get() {
            return this._streamType;
        }
    }]);
    return MediaRtpStats;
}();

},{"./utils":145,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12}],140:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SessionReport = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var SessionReport = exports.SessionReport = function () {
    /**
     * @class Prototype for tracking various RTC session report
     * @constructs
     */
    function SessionReport() {
        (0, _classCallCheck3.default)(this, SessionReport);

        this._sessionStartTime = null;
        this._sessionEndTime = null;
        this._gumTimeMillis = null;
        this._initializationTimeMillis = null;
        this._iceCollectionTimeMillis = null;
        this._signallingConnectTimeMillis = null;
        this._handshakingTimeMillis = null;
        this._preTalkingTimeMillis = null;
        this._talkingTimeMillis = null;
        this._iceConnectionsLost = 0;
        this._iceConnectionsFailed = null;
        this._peerConnectionFailed = null;
        this._cleanupTimeMillis = null;
        this._iceCollectionFailure = null;
        this._signallingConnectionFailure = null;
        this._handshakingFailure = null;
        this._gumOtherFailure = null;
        this._gumTimeoutFailure = null;
        this._createOfferFailure = null;
        this._setLocalDescriptionFailure = null;
        this._userBusyFailure = null;
        this._invalidRemoteSDPFailure = null;
        this._noRemoteIceCandidateFailure = null;
        this._setRemoteDescriptionFailure = null;
        this._streamStats = [];
        this._rtcJsVersion = "1.1.23";
    }
    /**
     *Timestamp when RTCSession started.
     */


    (0, _createClass3.default)(SessionReport, [{
        key: "sessionStartTime",
        get: function get() {
            return this._sessionStartTime;
        }
        /**
         * Timestamp when RTCSession ended.
         */
        ,
        set: function set(value) {
            this._sessionStartTime = value;
        }
    }, {
        key: "sessionEndTime",
        get: function get() {
            return this._sessionEndTime;
        }
        /**
         * Time taken for grabbing user microphone at the time of connecting RTCSession.
         */
        ,
        set: function set(value) {
            this._sessionEndTime = value;
        }
    }, {
        key: "gumTimeMillis",
        get: function get() {
            return this._gumTimeMillis;
        }
        /**
         * Time taken for session initialization in millis. Includes time spent in GrabLocalMedia, SetLocalSDP states.
         */
        ,
        set: function set(value) {
            this._gumTimeMillis = value;
        }
    }, {
        key: "initializationTimeMillis",
        get: function get() {
            return this._initializationTimeMillis;
        }
        /**
         * Time spent on ICECollection in millis.
         */
        ,
        set: function set(value) {
            this._initializationTimeMillis = value;
        }
    }, {
        key: "iceCollectionTimeMillis",
        get: function get() {
            return this._iceCollectionTimeMillis;
        }
        /**
         * Time taken for connecting the signalling in millis.
         */
        ,
        set: function set(value) {
            this._iceCollectionTimeMillis = value;
        }
    }, {
        key: "signallingConnectTimeMillis",
        get: function get() {
            return this._signallingConnectTimeMillis;
        }
        /**
         * Times spent from RTCSession connection until entering Talking state in millis.
         */
        ,
        set: function set(value) {
            this._signallingConnectTimeMillis = value;
        }
    }, {
        key: "preTalkingTimeMillis",
        get: function get() {
            return this._preTalkingTimeMillis;
        }
        /**
         *  Times spent in completing handshaking process of the RTCSession in millis.
         */
        ,
        set: function set(value) {
            this._preTalkingTimeMillis = value;
        }
    }, {
        key: "handshakingTimeMillis",
        get: function get() {
            return this._handshakingTimeMillis;
        }
        /**
         *  Times spent in Talking state in millis.
         */
        ,
        set: function set(value) {
            this._handshakingTimeMillis = value;
        }
    }, {
        key: "talkingTimeMillis",
        get: function get() {
            return this._talkingTimeMillis;
        }
        /**
         * How many times the RTCSession has lost ICE connection in talking state.
         */
        ,
        set: function set(value) {
            this._talkingTimeMillis = value;
        }
    }, {
        key: "iceConnectionsLost",
        get: function get() {
            return this._iceConnectionsLost;
        }
        /**
         * Tells if the RTCSession has failed RTCPeerConnection.iceConnectionState
         */
        ,
        set: function set(value) {
            this._iceConnectionsLost = value;
        }
    }, {
        key: "iceConnectionsFailed",
        get: function get() {
            return this._iceConnectionsFailed;
        }
        /**
         * Tells if the RTCSession has failed RTCPeerConnection.connectionState
         */
        ,
        set: function set(value) {
            this._iceConnectionsFailed = value;
        }
    }, {
        key: "peerConnectionFailed",
        get: function get() {
            return this._peerConnectionFailed;
        }
        /**
         * Times spent in Cleanup state in millis
         */
        ,
        set: function set(value) {
            this._peerConnectionFailed = value;
        }
    }, {
        key: "cleanupTimeMillis",
        get: function get() {
            return this._cleanupTimeMillis;
        }
        /**
         * Tells if the RTCSession fails in ICECollection.
         */
        ,
        set: function set(value) {
            this._cleanupTimeMillis = value;
        }
    }, {
        key: "iceCollectionFailure",
        get: function get() {
            return this._iceCollectionFailure;
        }
        /**
         * Tells if the RTCSession failed in signalling connect stage.
         */
        ,
        set: function set(value) {
            this._iceCollectionFailure = value;
        }
    }, {
        key: "signallingConnectionFailure",
        get: function get() {
            return this._signallingConnectionFailure;
        }
        /**
         * Handshaking failure of the RTCSession
         */
        ,
        set: function set(value) {
            this._signallingConnectionFailure = value;
        }
    }, {
        key: "handshakingFailure",
        get: function get() {
            return this._handshakingFailure;
        }
        /**
         * Gum failed due to timeout at the time of new RTCSession connection
         */
        ,
        set: function set(value) {
            this._handshakingFailure = value;
        }
    }, {
        key: "gumTimeoutFailure",
        get: function get() {
            return this._gumTimeoutFailure;
        }
        /**
         * Gum failed due to other reasons (other than Timeout)
         */
        ,
        set: function set(value) {
            this._gumTimeoutFailure = value;
        }
    }, {
        key: "gumOtherFailure",
        get: function get() {
            return this._gumOtherFailure;
        }
        /**
         * RTC Session failed in create Offer state.
         */
        ,
        set: function set(value) {
            this._gumOtherFailure = value;
        }
    }, {
        key: "createOfferFailure",
        get: function get() {
            return this._createOfferFailure;
        }
        /**
         * Tells if setLocalDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._createOfferFailure = value;
        }
    }, {
        key: "setLocalDescriptionFailure",
        get: function get() {
            return this._setLocalDescriptionFailure;
        }
        /**
         * Tells if handshaking failed due to user busy case,
         * happens when multiple softphone calls are initiated at same time.
         */
        ,
        set: function set(value) {
            this._setLocalDescriptionFailure = value;
        }
    }, {
        key: "userBusyFailure",
        get: function get() {
            return this._userBusyFailure;
        }
        /**
         * Tells it remote SDP is invalid.
         */
        ,
        set: function set(value) {
            this._userBusyFailure = value;
        }
    }, {
        key: "invalidRemoteSDPFailure",
        get: function get() {
            return this._invalidRemoteSDPFailure;
        }
        /**
         * Tells if the setRemoteDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._invalidRemoteSDPFailure = value;
        }
    }, {
        key: "setRemoteDescriptionFailure",
        get: function get() {
            return this._setRemoteDescriptionFailure;
        }
        /**
         * A failure case when there is no RemoteIceCandidate.
         */
        ,
        set: function set(value) {
            this._setRemoteDescriptionFailure = value;
        }
    }, {
        key: "noRemoteIceCandidateFailure",
        get: function get() {
            return this._noRemoteIceCandidateFailure;
        }
        /**
         * Statistics for each stream(audio-in, audio-out, video-in, video-out) of the RTCSession.
         */
        ,
        set: function set(value) {
            this._noRemoteIceCandidateFailure = value;
        }
    }, {
        key: "streamStats",
        get: function get() {
            return this._streamStats;
        }
        /**
         * get current connect-rtc-js version
         */
        ,
        set: function set(value) {
            this._streamStats = value;
        }
    }, {
        key: "rtcJsVersion",
        get: function get() {
            return this._rtcJsVersion;
        },
        set: function set(value) {
            this._rtcJsVersion = value;
        }
    }]);
    return SessionReport;
}();

},{"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12}],141:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.PendingLocalHangupState = exports.PendingRemoteHangupState = exports.PendingReconnectState = exports.TalkingState = exports.PendingAcceptAckState = exports.PendingAcceptState = exports.PendingAnswerState = exports.PendingInviteState = exports.PendingConnectState = exports.FailOnTimeoutState = exports.SignalingState = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _virtual_wss_connection_manager = require('./virtual_wss_connection_manager');

var _virtual_wss_connection_manager2 = _interopRequireDefault(_virtual_wss_connection_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONNECT_MAX_RETRIES = 3;

/**
 * Abstract signaling state class.
 */
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var SignalingState = exports.SignalingState = function () {
    /**
     * @param {AmznRtcSignaling} signaling Signaling object.
     */
    function SignalingState(signaling) {
        (0, _classCallCheck3.default)(this, SignalingState);

        this._signaling = signaling;
        this._createTime = new Date().getTime();
    }

    (0, _createClass3.default)(SignalingState, [{
        key: 'setStateTimeout',
        value: function setStateTimeout(timeoutMs) {
            setTimeout((0, _utils.hitch)(this, this._onTimeoutChecked), timeoutMs);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: '_onTimeoutChecked',
        value: function _onTimeoutChecked() {
            if (this.isCurrentState) {
                this.onTimeout();
            }
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            throw new _exceptions.UnsupportedOperation();
        }
    }, {
        key: 'transit',
        value: function transit(newState) {
            this._signaling.transit(newState);
        }
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: 'onOpen',
        value: function onOpen() {
            throw new _exceptions.UnsupportedOperation('onOpen not supported by ' + this.name);
        }
    }, {
        key: 'onError',
        value: function onError() {
            this.channelDown();
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.channelDown();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            throw new _exceptions.UnsupportedOperation('channelDown not supported by ' + this.name);
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(rpcMsg) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onRpcMsg not supported by ' + this.name);
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('invite not supported by ' + this.name);
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept not supported by ' + this.name);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            throw new _exceptions.UnsupportedOperation('hangup not supported by ' + this.name);
        }
    }, {
        key: 'isCurrentState',
        get: function get() {
            return this === this._signaling.state;
        }
    }, {
        key: 'name',
        get: function get() {
            return "SignalingState";
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._signaling._logger;
        }
    }]);
    return SignalingState;
}();

var FailOnTimeoutState = exports.FailOnTimeoutState = function (_SignalingState) {
    (0, _inherits3.default)(FailOnTimeoutState, _SignalingState);

    function FailOnTimeoutState(signaling, timeoutMs) {
        (0, _classCallCheck3.default)(this, FailOnTimeoutState);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FailOnTimeoutState.__proto__ || Object.getPrototypeOf(FailOnTimeoutState)).call(this, signaling));

        _this._timeoutMs = timeoutMs;
        return _this;
    }

    (0, _createClass3.default)(FailOnTimeoutState, [{
        key: 'onEnter',
        value: function onEnter() {
            this.setStateTimeout(this._timeoutMs);
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            this.transit(new FailedState(this._signaling, new _exceptions.Timeout()));
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailOnTimeoutState";
        }
    }]);
    return FailOnTimeoutState;
}(SignalingState);

var PendingConnectState = exports.PendingConnectState = function (_FailOnTimeoutState) {
    (0, _inherits3.default)(PendingConnectState, _FailOnTimeoutState);

    function PendingConnectState(signaling, timeoutMs, initialStartTimeIn, retriesIn) {
        (0, _classCallCheck3.default)(this, PendingConnectState);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (PendingConnectState.__proto__ || Object.getPrototypeOf(PendingConnectState)).call(this, signaling, timeoutMs));

        _this2._initialStartTime = initialStartTimeIn || new Date().getTime();
        _this2._retries = retriesIn || 0;
        return _this2;
    }

    (0, _createClass3.default)(PendingConnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new PendingInviteState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            var now = new Date().getTime();
            var untilTimeoutMs = this._initialStartTime + this._timeoutMs - now;
            if (untilTimeoutMs > 0 && ++this._retries < CONNECT_MAX_RETRIES) {
                this._signaling._connect();
                this.transit(new PendingConnectState(this._signaling, untilTimeoutMs, this._initialStartTime, this._retries));
            } else {
                this.transit(new FailedState(this._signaling, new Error('channelDown')));
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingConnectState";
        }
    }]);
    return PendingConnectState;
}(FailOnTimeoutState);

var PendingInviteState = exports.PendingInviteState = function (_SignalingState2) {
    (0, _inherits3.default)(PendingInviteState, _SignalingState2);

    function PendingInviteState() {
        (0, _classCallCheck3.default)(this, PendingInviteState);
        return (0, _possibleConstructorReturn3.default)(this, (PendingInviteState.__proto__ || Object.getPrototypeOf(PendingInviteState)).apply(this, arguments));
    }

    (0, _createClass3.default)(PendingInviteState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyConnected(resolve) {
                self._signaling._connectedHandler();
                resolve();
            });
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            var self = this;
            var inviteId = (0, _v2.default)();

            var inviteParams = {
                sdp: sdp,
                candidates: iceCandidates,
                callContextToken: self._signaling._contactToken
            };
            self.logger.log('Sending SDP', (0, _utils.getRedactedSdp)(sdp));
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: _rtc_const.INVITE_METHOD_NAME,
                params: inviteParams,
                id: inviteId
            }));
            self.transit(new PendingAnswerState(self._signaling, inviteId));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingInviteState";
        }
    }]);
    return PendingInviteState;
}(SignalingState);

var PendingAnswerState = exports.PendingAnswerState = function (_FailOnTimeoutState2) {
    (0, _inherits3.default)(PendingAnswerState, _FailOnTimeoutState2);

    function PendingAnswerState(signaling, inviteId) {
        (0, _classCallCheck3.default)(this, PendingAnswerState);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, (PendingAnswerState.__proto__ || Object.getPrototypeOf(PendingAnswerState)).call(this, signaling, _rtc_const.MAX_INVITE_DELAY_MS));

        _this4._inviteId = inviteId;
        return _this4;
    }

    (0, _createClass3.default)(PendingAnswerState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            var self = this;
            if (msg.id === this._inviteId) {
                if (msg.error || !msg.result) {
                    this.transit(new FailedState(this._signaling, self.translateInviteError(msg)));
                } else {
                    new Promise(function notifyAnswered(resolve) {
                        self.logger.log('Received SDP', (0, _utils.getRedactedSdp)(msg.result.sdp));
                        self._signaling._answeredHandler(msg.result.sdp, msg.result.candidates);
                        resolve();
                    });
                    this.transit(new PendingAcceptState(this._signaling, this._signaling._autoAnswer));
                }
            }
        }
    }, {
        key: 'translateInviteError',
        value: function translateInviteError(msg) {
            if (msg.error && msg.error.code == 486) {
                return new _exceptions.BusyException(msg.error.message);
            } else if (msg.error && msg.error.code == 404) {
                return new _exceptions.CallNotFoundException(msg.error.message);
            } else {
                return new _exceptions.UnknownSignalingError();
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAnswerState";
        }
    }]);
    return PendingAnswerState;
}(FailOnTimeoutState);

var PendingAcceptState = exports.PendingAcceptState = function (_SignalingState3) {
    (0, _inherits3.default)(PendingAcceptState, _SignalingState3);

    function PendingAcceptState(signaling, autoAnswer) {
        (0, _classCallCheck3.default)(this, PendingAcceptState);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (PendingAcceptState.__proto__ || Object.getPrototypeOf(PendingAcceptState)).call(this, signaling));

        _this5._autoAnswer = autoAnswer;
        return _this5;
    }

    (0, _createClass3.default)(PendingAcceptState, [{
        key: 'onEnter',
        value: function onEnter() {
            if (this._autoAnswer) {
                this.accept();
            }
        }
    }, {
        key: 'accept',
        value: function accept() {
            this.sendAcceptRequest();
            this.transit(new TalkingState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'sendAcceptRequest',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var acceptId;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                acceptId = (0, _v2.default)();

                                this._signaling._wss.send(JSON.stringify({
                                    jsonrpc: '2.0',
                                    method: _rtc_const.ACCEPT_METHOD_NAME,
                                    params: {},
                                    id: acceptId
                                }));

                            case 2:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function sendAcceptRequest() {
                return _ref.apply(this, arguments);
            }

            return sendAcceptRequest;
        }()
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptState";
        }
    }]);
    return PendingAcceptState;
}(SignalingState);

var PendingAcceptAckState = exports.PendingAcceptAckState = function (_FailOnTimeoutState3) {
    (0, _inherits3.default)(PendingAcceptAckState, _FailOnTimeoutState3);

    function PendingAcceptAckState(signaling, acceptId) {
        (0, _classCallCheck3.default)(this, PendingAcceptAckState);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (PendingAcceptAckState.__proto__ || Object.getPrototypeOf(PendingAcceptAckState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this6._acceptId = acceptId;
        return _this6;
    }

    (0, _createClass3.default)(PendingAcceptAckState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._acceptId) {
                if (msg.error) {
                    this.transit(new FailedState(this._signaling));
                } else {
                    this._signaling._clientToken = msg.result.clientToken;
                    this.transit(new TalkingState(this._signaling));
                }
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptAckState";
        }
    }]);
    return PendingAcceptAckState;
}(FailOnTimeoutState);

var TalkingState = exports.TalkingState = function (_SignalingState4) {
    (0, _inherits3.default)(TalkingState, _SignalingState4);

    function TalkingState() {
        (0, _classCallCheck3.default)(this, TalkingState);
        return (0, _possibleConstructorReturn3.default)(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    (0, _createClass3.default)(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyHandshaked(resolve) {
                self._signaling._handshakedHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var byeId = (0, _v2.default)();
            this._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: _rtc_const.BYE_METHOD_NAME,
                params: { callContextToken: this._signaling._contactToken },
                id: byeId
            }));
            this.transit(new PendingRemoteHangupState(this._signaling, byeId));
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.method === _rtc_const.BYE_METHOD_NAME) {
                this.transit(new PendingLocalHangupState(this._signaling, msg.id));
            } else if (msg.method === 'renewClientToken') {
                this._signaling._clientToken = msg.params.clientToken;
            }
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this._signaling._reconnect();
            this._signaling.transit(new PendingReconnectState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);
    return TalkingState;
}(SignalingState);

var PendingReconnectState = exports.PendingReconnectState = function (_FailOnTimeoutState4) {
    (0, _inherits3.default)(PendingReconnectState, _FailOnTimeoutState4);

    function PendingReconnectState(signaling) {
        (0, _classCallCheck3.default)(this, PendingReconnectState);
        return (0, _possibleConstructorReturn3.default)(this, (PendingReconnectState.__proto__ || Object.getPrototypeOf(PendingReconnectState)).call(this, signaling, _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS));
    }

    (0, _createClass3.default)(PendingReconnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new TalkingState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingReconnectState";
        }
    }]);
    return PendingReconnectState;
}(FailOnTimeoutState);

var PendingRemoteHangupState = exports.PendingRemoteHangupState = function (_FailOnTimeoutState5) {
    (0, _inherits3.default)(PendingRemoteHangupState, _FailOnTimeoutState5);

    function PendingRemoteHangupState(signaling, byeId) {
        (0, _classCallCheck3.default)(this, PendingRemoteHangupState);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, (PendingRemoteHangupState.__proto__ || Object.getPrototypeOf(PendingRemoteHangupState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this9._byeId = byeId;
        return _this9;
    }

    (0, _createClass3.default)(PendingRemoteHangupState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._byeId || msg.method === _rtc_const.BYE_METHOD_NAME) {
                this.transit(new DisconnectedState(this._signaling));
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingRemoteHangupState";
        }
    }]);
    return PendingRemoteHangupState;
}(FailOnTimeoutState);

var PendingLocalHangupState = exports.PendingLocalHangupState = function (_SignalingState5) {
    (0, _inherits3.default)(PendingLocalHangupState, _SignalingState5);

    function PendingLocalHangupState(signaling, byeId) {
        (0, _classCallCheck3.default)(this, PendingLocalHangupState);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, (PendingLocalHangupState.__proto__ || Object.getPrototypeOf(PendingLocalHangupState)).call(this, signaling));

        _this10._byeId = byeId;
        return _this10;
    }

    (0, _createClass3.default)(PendingLocalHangupState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyRemoteHungup(resolve) {
                self._signaling._remoteHungupHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var self = this;
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                result: {},
                id: self._byeId
            }));
            self.transit(new DisconnectedState(self._signaling));
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg() {
            //Do nothing
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new DisconnectedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingLocalHangupState";
        }
    }]);
    return PendingLocalHangupState;
}(SignalingState);

var DisconnectedState = exports.DisconnectedState = function (_SignalingState6) {
    (0, _inherits3.default)(DisconnectedState, _SignalingState6);

    function DisconnectedState() {
        (0, _classCallCheck3.default)(this, DisconnectedState);
        return (0, _possibleConstructorReturn3.default)(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    (0, _createClass3.default)(DisconnectedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyDisconnected(resolve) {
                self._signaling._disconnectedHandler();
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);
    return DisconnectedState;
}(SignalingState);

var FailedState = exports.FailedState = function (_SignalingState7) {
    (0, _inherits3.default)(FailedState, _SignalingState7);

    function FailedState(signaling, exception) {
        (0, _classCallCheck3.default)(this, FailedState);

        var _this12 = (0, _possibleConstructorReturn3.default)(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, signaling));

        _this12._exception = exception;
        return _this12;
    }

    (0, _createClass3.default)(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyFailed(resolve) {
                self._signaling._failedHandler(self._exception);
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }, {
        key: 'exception',
        get: function get() {
            return this._exception;
        }
    }]);
    return FailedState;
}(SignalingState);

var AmznRtcSignaling = function () {
    function AmznRtcSignaling(callId, signalingUri, contactToken, logger, connectTimeoutMs, connectionId, wssManager) {
        (0, _classCallCheck3.default)(this, AmznRtcSignaling);

        this._callId = callId;
        this._connectTimeoutMs = connectTimeoutMs || _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS;
        this._autoAnswer = true;
        this._signalingUri = signalingUri;
        this._contactToken = contactToken;
        this._logger = (0, _utils.wrapLogger)(logger, callId, 'SIGNALING');
        this._connectionId = connectionId;
        this._wssManager = wssManager;

        //empty event handlers
        this._connectedHandler = this._answeredHandler = this._handshakedHandler = this._reconnectedHandler = this._remoteHungupHandler = this._disconnectedHandler = this._failedHandler = function noOp() {};
    }

    (0, _createClass3.default)(AmznRtcSignaling, [{
        key: 'connect',
        value: function connect() {
            this._connect();
            this.transit(new PendingConnectState(this, this._connectTimeoutMs));
        }
    }, {
        key: '_connect',
        value: function _connect() {
            this._wss = this._connectWebSocket(this._buildInviteUri());
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this.state && this.state.onExit) {
                    this.state.onExit();
                }
            } finally {
                this._state = nextState;
                if (this._state.onEnter) {
                    this._state.onEnter();
                }
            }
        }
    }, {
        key: '_connectWebSocket',
        value: function _connectWebSocket(uri) {
            var wsConnection = void 0;
            if (this._wssManager) {
                wsConnection = new _virtual_wss_connection_manager2.default(this._logger, this._connectionId, this._wssManager);
            } else {
                wsConnection = new WebSocket(uri);
            }
            wsConnection.onopen = (0, _utils.hitch)(this, this._onOpen);
            wsConnection.onmessage = (0, _utils.hitch)(this, this._onMessage);
            wsConnection.onerror = (0, _utils.hitch)(this, this._onError);
            wsConnection.onclose = (0, _utils.hitch)(this, this._onClose);
            return wsConnection;
        }
    }, {
        key: '_buildInviteUri',
        value: function _buildInviteUri() {
            if (this._contactToken) {
                return this._buildUriBase() + '&contactCtx=' + encodeURIComponent(this._contactToken);
            } else {
                return this._buildUriBase();
            }
        }
    }, {
        key: '_buildReconnectUri',
        value: function _buildReconnectUri() {
            return this._buildUriBase() + '&clientToken=' + encodeURIComponent(this._clientToken);
        }
    }, {
        key: '_buildUriBase',
        value: function _buildUriBase() {
            var separator = '?';
            if (this._signalingUri.indexOf(separator) > -1) {
                separator = '&';
            }
            return this._signalingUri + separator + 'callId=' + encodeURIComponent(this._callId);
        }
    }, {
        key: '_onMessage',
        value: function _onMessage(evt) {
            this.state.onRpcMsg(JSON.parse(evt.data));
        }
    }, {
        key: '_onOpen',
        value: function _onOpen(evt) {
            this.state.onOpen(evt);
        }
    }, {
        key: '_onError',
        value: function _onError(evt) {
            this.state.onError(evt);
        }
    }, {
        key: '_onClose',
        value: function _onClose(evt) {
            this._logger.log('WebSocket onclose code=' + evt.code + ', reason=' + evt.reason);
            this.state.onClose(evt);
        }
    }, {
        key: '_reconnect',
        value: function _reconnect() {
            this._wss = this._connectWebSocket(this._buildReconnectUri());
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            this.state.invite(sdp, iceCandidates);
        }
    }, {
        key: 'accept',
        value: function accept() {
            this.state.accept();
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.state.hangup();
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
    }, {
        key: 'onConnected',
        set: function set(connectedHandler) {
            this._connectedHandler = connectedHandler;
        }
    }, {
        key: 'onAnswered',
        set: function set(answeredHandler) {
            this._answeredHandler = answeredHandler;
        }
    }, {
        key: 'onHandshaked',
        set: function set(handshakedHandler) {
            this._handshakedHandler = handshakedHandler;
        }
    }, {
        key: 'onReconnected',
        set: function set(reconnectedHandler) {
            this._reconnectedHandler = reconnectedHandler;
        }
    }, {
        key: 'onRemoteHungup',
        set: function set(remoteHungupHandler) {
            this._remoteHungupHandler = remoteHungupHandler;
        }
    }, {
        key: 'onDisconnected',
        set: function set(disconnectedHandler) {
            this._disconnectedHandler = disconnectedHandler;
        }
    }, {
        key: 'onFailed',
        set: function set(failedHandler) {
            this._failedHandler = failedHandler;
        }
    }, {
        key: 'state',
        get: function get() {
            return this._state;
        }
    }]);
    return AmznRtcSignaling;
}();

exports.default = AmznRtcSignaling;

},{"./exceptions":135,"./rtc_const":136,"./utils":145,"./virtual_wss_connection_manager":146,"babel-runtime/helpers/asyncToGenerator":10,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12,"babel-runtime/helpers/inherits":14,"babel-runtime/helpers/possibleConstructorReturn":15,"babel-runtime/regenerator":19,"uuid/v4":121}],142:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CCPInitiationStrategyInterface = function () {
    function CCPInitiationStrategyInterface() {
        (0, _classCallCheck3.default)(this, CCPInitiationStrategyInterface);

        console.log("CCPInitiationStrategyInterface initialized");
    }

    (0, _createClass3.default)(CCPInitiationStrategyInterface, [{
        key: "getStrategyName",
        value: function getStrategyName() {
            console.error("getStrategyName needs to be overridden");
        }

        // the following functions are rtc_peer_connection_factory related functions
        // check if the browser supports early media connection

    }, {
        key: "_isEarlyMediaConnectionSupported",
        value: function _isEarlyMediaConnectionSupported() {
            console.error("_isEarlyMediaConnectionSupported needs to be overridden");
        }
    }, {
        key: "_createRtcPeerConnection",
        value: function _createRtcPeerConnection() {
            console.error("_createRtcPeerConnection needs to be overridden");
        }

        // the following functions are rtc_session related functions

    }, {
        key: "_guM",
        value: function _guM() {
            console.error("_guM needs to be overridden");
        }
    }, {
        key: "addStream",
        value: function addStream() {
            console.error("addStream needs to be overridden");
        }
    }, {
        key: "setRemoteDescription",
        value: function setRemoteDescription() {
            console.error("setRemoteDescription needs to be overridden");
        }
    }, {
        key: "onIceStateChange",
        value: function onIceStateChange() {
            console.error("onIceStateChange needs to be overridden");
        }
    }, {
        key: "onPeerConnectionStateChange",
        value: function onPeerConnectionStateChange() {
            console.error("onPeerConnectionStateChange needs to be overridden");
        }
    }, {
        key: "_createPeerConnection",
        value: function _createPeerConnection() {
            console.error("_createPeerConnection needs to be overridden");
        }
    }, {
        key: "connect",
        value: function connect() {
            console.error("connect needs to be overridden");
        }
    }, {
        key: "_ontrack",
        value: function _ontrack() {
            console.error("_ontrack needs to be overridden");
        }
    }, {
        key: "_buildMediaConstraints",
        value: function _buildMediaConstraints() {
            console.error("_buildMediaConstraints needs to be overridden");
        }
    }]);
    return CCPInitiationStrategyInterface;
}();

exports.default = CCPInitiationStrategyInterface;

},{"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12}],143:[function(require,module,exports){
(function (global){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _CCPInitiationStrategyInterface = require("./CCPInitiationStrategyInterface");

var _CCPInitiationStrategyInterface2 = _interopRequireDefault(_CCPInitiationStrategyInterface);

var _utils = require("../utils");

var _rtc_session = require("../rtc_session");

var _rtc_const = require("../rtc_const");

require("@citrix/ucsdk/CitrixWebRTC");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CitrixVDIStrategy = function (_CCPInitiationStrateg) {
    (0, _inherits3.default)(CitrixVDIStrategy, _CCPInitiationStrateg);

    function CitrixVDIStrategy() {
        (0, _classCallCheck3.default)(this, CitrixVDIStrategy);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CitrixVDIStrategy.__proto__ || Object.getPrototypeOf(CitrixVDIStrategy)).call(this));

        if (!window.CitrixWebRTC.isFeatureOn("webrtc1.0")) {
            throw new Error('Citrix WebRTC redirection feature is NOT supported!');
        }
        window.getCitrixWebrtcRedir = function () {
            var registryValue = Promise.resolve(1);
            return new Promise(function (resolve, reject) {
                //retrieve registry value internally
                registryValue.then(function (v) {
                    resolve(v);
                }).catch(function () {
                    reject();
                });
            });
        };
        window.CitrixWebRTC.initLog(global.connect.getLog());
        console.log("CitrixVDIStrategy initialized");
        return _this;
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection


    (0, _createClass3.default)(CitrixVDIStrategy, [{
        key: "_isEarlyMediaConnectionSupported",
        value: function _isEarlyMediaConnectionSupported() {
            // Citrix WebRTC SDK doesn't support early media connection
            return false;
        }
    }, {
        key: "_createRtcPeerConnection",
        value: function _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
            return new window.CitrixWebRTC.CitrixPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
        }

        // the following functions are rtc_session related functions

    }, {
        key: "_gUM",
        value: function _gUM(constraints) {
            return window.CitrixWebRTC.getUserMedia(constraints);
        }
    }, {
        key: "addStream",
        value: function addStream(_pc, stream) {
            stream.getTracks().forEach(function (track) {
                _pc.addTransceiver(track, {});
            });
        }
    }, {
        key: "setRemoteDescription",
        value: function setRemoteDescription(self, rtcSession) {
            var answerSessionDescription = self._createSessionDescription({ type: 'answer', sdp: self._sdp });

            rtcSession._pc.setRemoteDescription(answerSessionDescription, function () {
                var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                    var remoteCandidate = self._createRemoteCandidate(candidate);
                    self.logger.info('Adding remote candidate', remoteCandidate);
                    return rtcSession._pc.addIceCandidate(remoteCandidate);
                }));
                remoteCandidatePromises.catch(function (reason) {
                    self.logger.warn('Error adding remote candidate', reason);
                });
                rtcSession._sessionReport.setRemoteDescriptionFailure = false;
                self._remoteDescriptionSet = true;
                self._checkAndTransit();
            }, function () {
                rtcSession._stopSession();
                rtcSession._sessionReport.setRemoteDescriptionFailure = true;
                self.transit(new _rtc_session.FailedState(rtcSession, _rtc_const.RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: "onIceStateChange",
        value: function onIceStateChange(evt, _pc) {
            return _pc.iceConnectionState;
        }
    }, {
        key: "onPeerConnectionStateChange",
        value: function onPeerConnectionStateChange(_pc) {
            return _pc.connectionState_;
        }
    }, {
        key: "_createPeerConnection",
        value: function _createPeerConnection(configuration, optionalConfiguration) {
            return new window.CitrixWebRTC.CitrixPeerConnection(configuration, optionalConfiguration);
        }
    }, {
        key: "connect",
        value: function connect(self) {
            self._pc.onaddstream = (0, _utils.hitch)(self, self._ontrack);
        }
    }, {
        key: "_ontrack",
        value: function _ontrack(self, evt) {
            var remoteStream = evt.stream.clone();

            var audioTracks = evt.stream.getAudioTracks();
            if (audioTracks !== undefined && audioTracks.length > 0) {
                self._remoteAudioStream = remoteStream;
                self._remoteAudioElement.srcObject = remoteStream;
            }
        }
    }, {
        key: "_buildMediaConstraints",
        value: function _buildMediaConstraints(self, mediaConstraints) {
            if (self._enableAudio) {
                var audioConstraints = {};
                if (typeof self._echoCancellation !== 'undefined') {
                    audioConstraints.echoCancellation = !!self._echoCancellation;
                }
                if (window.audio_input) {
                    audioConstraints.deviceId = window.audio_input;
                }
                if (Object.keys(audioConstraints).length > 0) {
                    mediaConstraints.audio = audioConstraints;
                } else {
                    mediaConstraints.audio = true;
                }
            } else {
                mediaConstraints.audio = false;
            }
        }
    }, {
        key: "getStrategyName",
        value: function getStrategyName() {
            return 'CitrixVDIStrategy';
        }
    }]);
    return CitrixVDIStrategy;
}(_CCPInitiationStrategyInterface2.default); /**
                                              * By using the Citrix ucsdk (https://www.npmjs.com/package/@citrix/ucsdk), you are accepting the Citrix Developer Terms of Use  located here: https://www.cloud.com/terms-of-use.
                                              */

exports.default = CitrixVDIStrategy;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../rtc_const":136,"../rtc_session":138,"../utils":145,"./CCPInitiationStrategyInterface":142,"@citrix/ucsdk/CitrixWebRTC":1,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12,"babel-runtime/helpers/inherits":14,"babel-runtime/helpers/possibleConstructorReturn":15}],144:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _CCPInitiationStrategyInterface = require("./CCPInitiationStrategyInterface");

var _CCPInitiationStrategyInterface2 = _interopRequireDefault(_CCPInitiationStrategyInterface);

var _rtc_const = require("../rtc_const");

var _utils = require("../utils");

var _rtc_session = require("../rtc_session");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StandardStrategy = function (_CCPInitiationStrateg) {
    (0, _inherits3.default)(StandardStrategy, _CCPInitiationStrateg);

    function StandardStrategy() {
        (0, _classCallCheck3.default)(this, StandardStrategy);

        var _this = (0, _possibleConstructorReturn3.default)(this, (StandardStrategy.__proto__ || Object.getPrototypeOf(StandardStrategy)).call(this));

        console.log("StandardStrategy initialized");
        return _this;
    }

    // the following functions are rtc_peer_connection_factory related functions
    // check if the browser supports early media connection


    (0, _createClass3.default)(StandardStrategy, [{
        key: "_isEarlyMediaConnectionSupported",
        value: function _isEarlyMediaConnectionSupported() {
            return (0, _utils.isChromeBrowser)() && (0, _utils.getChromeBrowserVersion)() >= _rtc_const.CHROME_SUPPORTED_VERSION;
        }
    }, {
        key: "_createRtcPeerConnection",
        value: function _createRtcPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig) {
            return new RTCPeerConnection(rtcPeerConnectionConfig, rtcPeerConnectionOptionalConfig);
        }

        // the following functions are rtc_session related functions

    }, {
        key: "_gUM",
        value: function _gUM(constraints) {
            return navigator.mediaDevices.getUserMedia(constraints);
        }
    }, {
        key: "addStream",
        value: function addStream(_pc, stream) {
            _pc.addStream(stream);
        }
    }, {
        key: "setRemoteDescription",
        value: function setRemoteDescription(self, rtcSession) {
            var setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
                type: 'answer',
                sdp: self._sdp
            }));
            setRemoteDescriptionPromise.catch(function (e) {
                self.logger.error('SetRemoteDescription failed', e);
            });
            setRemoteDescriptionPromise.then(function () {
                var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                    var remoteCandidate = self._createRemoteCandidate(candidate);
                    self.logger.info('Adding remote candidate', remoteCandidate);
                    return rtcSession._pc.addIceCandidate(remoteCandidate);
                }));
                remoteCandidatePromises.catch(function (reason) {
                    self.logger.warn('Error adding remote candidate', reason);
                });
                return remoteCandidatePromises;
            }).then(function () {
                rtcSession._sessionReport.setRemoteDescriptionFailure = false;
                self._remoteDescriptionSet = true;
                self._checkAndTransit();
            }).catch(function () {
                rtcSession._stopSession();
                rtcSession._sessionReport.setRemoteDescriptionFailure = true;
                self.transit(new _rtc_session.FailedState(rtcSession, _rtc_const.RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: "onIceStateChange",
        value: function onIceStateChange(evt, _pc) {
            // eslint-disable-line no-unused-vars
            return evt.currentTarget.iceConnectionState;
        }
    }, {
        key: "onPeerConnectionStateChange",
        value: function onPeerConnectionStateChange(_pc) {
            return _pc.connectionState;
        }
    }, {
        key: "_createPeerConnection",
        value: function _createPeerConnection(configuration, optionalConfiguration) {
            return new RTCPeerConnection(configuration, optionalConfiguration);
        }
    }, {
        key: "connect",
        value: function connect(self) {
            self._pc.ontrack = (0, _utils.hitch)(self, self._ontrack);
        }
    }, {
        key: "_ontrack",
        value: function _ontrack(self, evt) {
            if (evt.streams.length > 1) {
                self._logger.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' + evt.streams.map(function (stream) {
                    return stream.id;
                }).join(','));
            }
            if (evt.track.kind === 'video' && self._remoteVideoElement) {
                self._remoteVideoElement.srcObject = evt.streams[0];
                self._remoteVideoStream = evt.streams[0];
            } else if (evt.track.kind === 'audio' && self._remoteAudioElement) {
                self._remoteAudioElement.srcObject = evt.streams[0];
                self._remoteAudioStream = evt.streams[0];
            }
        }
    }, {
        key: "_buildMediaConstraints",
        value: function _buildMediaConstraints(self, mediaConstraints) {
            if (self._enableAudio) {
                var audioConstraints = {};
                if (typeof self._echoCancellation !== 'undefined') {
                    audioConstraints.echoCancellation = !!self._echoCancellation;
                }
                if (Object.keys(audioConstraints).length > 0) {
                    mediaConstraints.audio = audioConstraints;
                } else {
                    mediaConstraints.audio = true;
                }
            } else {
                mediaConstraints.audio = false;
            }
        }
    }, {
        key: "getStrategyName",
        value: function getStrategyName() {
            return 'StandardStrategy';
        }
    }]);
    return StandardStrategy;
}(_CCPInitiationStrategyInterface2.default);

exports.default = StandardStrategy;

},{"../rtc_const":136,"../rtc_session":138,"../utils":145,"./CCPInitiationStrategyInterface":142,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12,"babel-runtime/helpers/inherits":14,"babel-runtime/helpers/possibleConstructorReturn":15}],145:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SdpOptions = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.hitch = hitch;
exports.wrapLogger = wrapLogger;
exports.closeStream = closeStream;
exports.transformSdp = transformSdp;
exports.is_defined = is_defined;
exports.when_defined = when_defined;
exports.isLegacyStatsReportSupported = isLegacyStatsReportSupported;
exports.isFunction = isFunction;
exports.assertTrue = assertTrue;
exports.isChromeBrowser = isChromeBrowser;
exports.getChromeBrowserVersion = getChromeBrowserVersion;
exports.getRedactedSdp = getRedactedSdp;

var _exceptions = require('./exceptions');

var _sdp = require('sdp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * All logging methods used by connect-rtc.
 */
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var logMethods = ['log', 'info', 'warn', 'error'];

/**
 * Binds the given instance object as the context for
 * the method provided.
 *
 * @param scope The instance object to be set as the scope
 *    of the function.
 * @param method The method to be encapsulated.
 *
 * All other arguments, if any, are bound to the method
 * invocation inside the closure.
 *
 * @return A closure encapsulating the invocation of the
 *    method provided in context of the given instance.
 */
function hitch() {
    var args = Array.prototype.slice.call(arguments);
    var scope = args.shift();
    var method = args.shift();

    if (!scope) {
        throw new _exceptions.IllegalParameters('utils.hitch(): scope is required!');
    }

    if (!method) {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is required!');
    }

    if (typeof method !== 'function') {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is not a function!');
    }

    return function _hitchedFunction() {
        var closureArgs = Array.prototype.slice.call(arguments);
        return method.apply(scope, args.concat(closureArgs));
    };
}

function wrapLogger(logger, callId, logCategory) {
    var _logger = {};
    logMethods.forEach(function (logMethod) {
        if (!logger[logMethod]) {
            throw new Error('Logging method ' + logMethod + ' required');
        }
        _logger[logMethod] = hitch(logger, logger[logMethod], callId, logCategory);
    });
    return _logger;
}

function closeStream(stream) {
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            try {
                track.stop();
            } catch (e) {
                // eat exception
            }
        }
    }
}

/**
 * A parameter of transformSdp.
 * This defines all the SDP options connect-rtc-js supports.
 */

var SdpOptions = exports.SdpOptions = function () {
    function SdpOptions() {
        (0, _classCallCheck3.default)(this, SdpOptions);

        this._forceCodec = {};
    }

    (0, _createClass3.default)(SdpOptions, [{
        key: '_shouldDeleteCodec',


        /**
         * Test if given codec should be removed from SDP.
         * @param mediaType audio|video
         * @param codecName case insensitive
         * @return TRUE - should remove
         */
        value: function _shouldDeleteCodec(mediaType, codecName) {
            var upperCaseCodecName = codecName.toUpperCase();
            return this._forceCodec[mediaType] && upperCaseCodecName !== this._forceCodec[mediaType].toUpperCase() && upperCaseCodecName !== 'TELEPHONE-EVENT';
        }
    }, {
        key: 'enableOpusDtx',
        get: function get() {
            return this._enableOpusDtx;
        }

        /**
         * By default transformSdp disables dtx for OPUS codec.
         * Setting this to true would force it to turn on DTX.
         */
        ,
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }

        /**
         * A map from media type (audio/video) to codec (case insensitive).
         * Add entry for force connect-rtc-js to use specified codec for certain media type.
         * For example: sdpOptions.forceCodec['audio'] = 'opus';
         */

    }, {
        key: 'forceCodec',
        get: function get() {
            return this._forceCodec;
        }
    }]);
    return SdpOptions;
}();

/**
 * Modifies input SDP according to sdpOptions.
 * See SdpOptions for available options.
 * @param sdp original SDP
 * @param sdpOptions defines changes to be applied to SDP
 * @returns a map with 'sdp' containing the transformed SDP and 'mLines' containing the number of m lines in SDP
 */


function transformSdp(sdp, sdpOptions) {
    var sections = (0, _sdp.splitSections)(sdp);
    for (var i = 1; i < sections.length; i++) {
        var mediaType = (0, _sdp.getKind)(sections[i]);
        var rtpParams = (0, _sdp.parseRtpParameters)(sections[i]);
        // a map from payload type (string) to codec object
        var codecMap = rtpParams.codecs.reduce(function (map, codec) {
            map['' + codec.payloadType] = codec;
            return map;
        }, {});
        sections[i] = (0, _sdp.splitLines)(sections[i]).map(function (line) {
            if (line.startsWith('m=')) {
                // modify m= line if SdpOptions#forceCodec specifies codec for current media type
                if (sdpOptions.forceCodec[mediaType]) {
                    var targetCodecPts = Object.keys(codecMap).filter(function (pt) {
                        return !sdpOptions._shouldDeleteCodec(mediaType, codecMap[pt].name);
                    });
                    return (/.*RTP\/S?AVPF? /.exec(line) + targetCodecPts.join(' ')
                    );
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtpmap:')) {
                var rtpMap = (0, _sdp.parseRtpMap)(line);
                var currentCodec = codecMap[rtpMap.payloadType];

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                // append a=fmtp line immediately if current codec is OPUS (to explicitly specify OPUS parameters)
                if (is_defined(currentCodec) && currentCodec.name.toUpperCase() === 'OPUS') {
                    currentCodec.parameters.usedtx = sdpOptions.enableOpusDtx ? "1" : "0";
                    // generate fmtp line immediately after rtpmap line, and remove original fmtp line once we see it
                    return (line + "\r\n" + (0, _sdp.writeFmtp)(currentCodec)).trim();
                } else {
                    return line;
                }
            } else if (line.startsWith('a=fmtp:')) {
                var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                if (is_defined(currentCodec) && currentCodec.name.toUpperCase() === 'OPUS') {
                    // this is a line for OPUS, remove it because FMTP line is already generated when rtpmap line is processed
                    return null;
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtcp-fb:')) {
                var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' ')); // eslint-disable-line no-redeclare
                if (pt === '*') {
                    //always allow wildcard in rtc-fb
                    return line;
                } else {
                    var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                    // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                    if (is_defined(currentCodec) && sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                        return null;
                    } else {
                        return line;
                    }
                }
            } else {
                return line;
            }
        }).filter(function (line) {
            return line !== null;
        }).join('\r\n');
    }
    return {
        sdp: sections.map(function (section) {
            return section.trim();
        }).join('\r\n') + '\r\n',
        mLines: sections.length - 1 // first section is session description, the rest are media descriptions
    };
}

function is_defined(v) {
    return typeof v !== 'undefined';
}

function when_defined(v, alternativeIn) {
    var alternative = is_defined(alternativeIn) ? alternativeIn : null;
    return is_defined(v) ? v : alternative;
}

/**
 * Check if the getStats API for retrieving legacy stats report is supported
 */
function isLegacyStatsReportSupported(pc) {
    return new Promise(function (resolve) {
        pc.getStats(function () {
            resolve(true);
        }).catch(function () {
            // Exception thrown if browser does not support legacy stats report
            resolve(false);
        });
    });
}

/**
 * Determine if the given value is a callable function type.
 * Borrowed from Underscore.js.
 */
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

/**
 * Asserts that a premise is true.
 */
function assertTrue(premise, message) {
    if (!premise) {
        throw new Error(message);
    }
}

function isChromeBrowser() {
    return navigator.userAgent.indexOf("Chrome") !== -1;
}

function getChromeBrowserVersion() {
    var userAgent = navigator.userAgent;
    var chromeVersion = userAgent.substring(userAgent.indexOf("Chrome") + 7);
    if (chromeVersion) {
        return parseFloat(chromeVersion);
    } else {
        return -1;
    }
}

function getRedactedSdp(sdp) {
    // pattern to find and redact the value after 'a=ice-pwd:'
    var pattern = /a=ice-pwd:[^\r\n]*/;

    // Use the replace method to redact the value with '[redacted]'
    return sdp.replace(pattern, 'a=ice-pwd:[redacted]');
}

},{"./exceptions":135,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12,"sdp":118}],146:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _rtc_const = require('./rtc_const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VirtualWssConnectionManager = function () {
    function VirtualWssConnectionManager(logger, connectionId, wssManager) {
        (0, _classCallCheck3.default)(this, VirtualWssConnectionManager);

        this._logger = logger;
        this._connectionId = connectionId;
        this._wssManager = wssManager;
        this._initializeWebSocketEventListeners();
    }

    (0, _createClass3.default)(VirtualWssConnectionManager, [{
        key: '_initializeWebSocketEventListeners',
        value: function _initializeWebSocketEventListeners() {
            var _this = this;

            this._wssManager.subscribeTopics([_rtc_const.SOFTPHONE_ROUTE_KEY]);
            this._unSubscribe = this._wssManager.onMessage(_rtc_const.SOFTPHONE_ROUTE_KEY, (0, _utils.hitch)(this, this._webSocketManagerOnMessage));
            setTimeout(function () {
                _this._onOpen();
            }, 0);
        }
    }, {
        key: '_webSocketManagerOnMessage',
        value: function _webSocketManagerOnMessage(event) {
            var content = void 0;
            if (event.content) {
                content = JSON.parse(event.content);
            }
            if (this._onMessage && content && this._connectionId === content.connectionId) {
                this._onMessage({ data: JSON.stringify(content.jsonRpcMsg) });
            }
        }
    }, {
        key: 'send',
        value: function send(webSocketPayload) {
            var payload = {};
            try {
                payload.topic = _rtc_const.SOFTPHONE_ROUTE_KEY;
                payload.connectionId = this._connectionId;
                payload.jsonRpcMsg = JSON.parse(webSocketPayload);
                this._wssManager.sendMessage(payload);
            } catch (error) {
                this._logger.error("Error in sendMessage ", error);
            }
        }
    }, {
        key: 'close',
        value: function close() {
            this._logger.info("closing virtual connection");
            this._unSubscribe();
        }
    }, {
        key: 'onmessage',
        set: function set(callBack) {
            this._onMessage = callBack;
        }
    }, {
        key: 'onopen',
        set: function set(callBack) {
            this._onOpen = callBack;
        }
    }]);
    return VirtualWssConnectionManager;
}();

exports.default = VirtualWssConnectionManager;

},{"./rtc_const":136,"./utils":145,"babel-runtime/helpers/classCallCheck":11,"babel-runtime/helpers/createClass":12}]},{},[134]);
