/****************************************************************/
/*                                                              */
/* Licensed Materials - Property of IBM                         */
/* 5725-F96 IBM MessageSight                                    */
/* (C) Copyright IBM Corp. 2012, 2013 All Rights Reserved.      */
/*                                                              */
/* US Government Users Restricted Rights - Use, duplication or  */
/* disclosure restricted by GSA ADP Schedule Contract with      */
/* IBM Corp.                                                    */
/*                                                              */
/****************************************************************/

//
// requires mqttws31.js
//

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}

var defaultServer = "222.73.204.54";
var defaultPort = 9001;
var defaultSubTopic = "#";
var defaultPubTopic = "alert";
var defaultPubMessage = "";

var server = (getUrlVars()["ip"] == null) ? defaultServer : getUrlVars()["ip"];
var port = parseFloat((getUrlVars()["port"] == null) ? defaultPort : parseFloat(getUrlVars()["port"]));

var subTopics = [];
var moreTopics = true;
var baseUrlVar = "subTopic";	
var urlVar = baseUrlVar;
var count = 1;
var hasSubTopics = false;
while (moreTopics) {
	if (getUrlVars()[urlVar] != null) {
		subTopics.push(decodeURI(getUrlVars()[urlVar]));
		hasSubTopics = true;
		count++;
		urlVar = baseUrlVar + count;
	} else {
		moreTopics = false;
	}
}
if (subTopics.length == 0) {
	subTopics.push(defaultSubTopic);
}
console.log("subTopics: ", subTopics);

var pubTopic = (getUrlVars()["pubTopic"] == null) ? defaultPubTopic : decodeURI(getUrlVars()["pubTopic"]);
var pubMessage = (getUrlVars()["pubMessage"] == null) ? defaultPubMessage : decodeURI(getUrlVars()["pubMessage"]);
var autoConnect = (getUrlVars()["autoConnect"] == null) ? false : getUrlVars()["autoConnect"];
var autoSubscribe = (getUrlVars()["autoSubscribe"] == null) ? false : getUrlVars()["autoSubscribe"];
var autoPublish = (getUrlVars()["autoPublish"] == null) ? false : getUrlVars()["autoPublish"];
var cid = (getUrlVars()["clientId"] == null) ? false : getUrlVars()["clientId"];
var un = (getUrlVars()["username"] == null) ? false : getUrlVars()["username"];
var pw = (getUrlVars()["password"] == null) ? false : getUrlVars()["password"];
var follow = (getUrlVars()["follow"] == null) ? false : getUrlVars()["follow"];
if (follow) { $("#stickyLog").prop("checked", true); }
var auto = (getUrlVars()["auto"] == null) ? false : getUrlVars()["auto"];
if (auto) { autoConnect = true; autoSubscribe = true; }

$("#connectServer").val(server);
$("#connectPort").val(port);
if (cid) { $("#connectClientID").val(cid); }
else { $("#connectClientID").val("MQTTHelper-" + Math.floor(10000 + Math.random() * 90000)); }
if (un) { $("#connectUsername").val(un); }
if (pw) { $("#connectPassword").val(pw); }
$("#subscribeTopic").val(subTopics[0]);
$("#publishTopic").val(pubTopic);
editor.setText(pubMessage);
//$("#publishMessage").val(pubMessage);

if (autoConnect) {
	setTimeout(function() {
		$("#connectButton").click();
	}, 500);
}

var client = null;

/*
$(".panel-heading").click(function(event) {
	if (event.target.tagName == "H3") {
		$(this).find("a").click();
	}
});
*/

function init() {
	$(window).resize(function() { resize(); });
	resize();
}

$("#publishPanelLink").click();
$("#subscribePanelLink").click();

$("#connectButton").click(function(event) {
	var server = $("#connectServer").val();
	var port = $("#connectPort").val();
	var clientId = $("#connectClientID").val();
	var username = $("#connectUsername").val();
	var password = $("#connectPassword").val();
	var noCleanSession = $("#connectCleanSessionOff").hasClass("active");
	var useSSL = $("#connectSSLOn").hasClass("active");
	connect(server, port, clientId, username, password, noCleanSession, useSSL);
});
$("#disconnectButton").click(function(event) {
	client.disconnect();
});

$("#publishButton").click(function(event) {
	var topic = $("#publishTopic").val();
	var message=editor.getText();
	//var message = $("#publishMessage").val();
	var qos = parseFloat($("#publishQOS").val());
	retained = $("#publishRetainedOn").hasClass("btn-primary");
	publish(topic, message, qos, retained);
});

function resize() {
	//$("#publishMessage").width($("#publishTopic").width());
}

var subsList = {};
$("#subscribeButton").click(function(event) {
	var topic = $("#subscribeTopic").val();
	var qos = parseFloat($("#subscribeQOS").val());
	client.subscribe(topic, {
		qos: qos,
		onSuccess: function() {
			appendLog("Subscribed to [<span class='logTopic'>" + topic + "</span>][qos " + qos + "]");
			if (!subsList[topic]) {
				subsList[topic] = true;
				$("#subscribeList").append("<span id='"+topic+"' class='subscribeListItem'>"+topic+"&nbsp;<button class='close' onclick='unsubscribe(\""+topic+"\");'>&times;</button></span>");
			}
		},
		onFailure: function() {
			appendLog("Subscription failed: [" + topic + "][qos " + qos + "]");
		}
	});
});

$("#connectForm").submit(function() {
	return false;
});

$("#subscribeForm").submit(function() {
	return false;
});

$("#publishForm").submit(function() {
	return false;
});

$('.btn-toggle').click(function() {
	$(this).find('.btn').toggleClass('active');  
	if ($(this).find('.btn-primary').size()>0) {
		$(this).find('.btn').toggleClass('btn-primary');
	}
	if ($(this).find('.btn-danger').size()>0) {
		$(this).find('.btn').toggleClass('btn-danger');
	}
	if ($(this).find('.btn-success').size()>0) {
		$(this).find('.btn').toggleClass('btn-success');
	}
	if ($(this).find('.btn-info').size()>0) {
		$(this).find('.btn').toggleClass('btn-info');
	}
	$(this).find('.btn').toggleClass('btn-default');
});

$(".requiresConnect").attr("disabled", true);

function unsubscribe(topic) {
	client.unsubscribe(topic, {
		onSuccess: function() {
			subsList[topic] = null;
			var elem = document.getElementById(topic);
			elem.parentNode.removeChild(elem);
			appendLog("Unsubscribed from [<span class='logTopic'>" + topic + "</span>]");
		},
		onFailure: function() {
			appendLog("Unsubscribe failed: [<span class='logTopic'>" + topic + "</span>]");
		}
	});
}

function publish(topic, message, qos, retained) {
	var msgObj = new Paho.MQTT.Message(message);
	msgObj.destinationName = topic;
	if (qos) { msgObj.qos = qos; }
	if (retained) { msgObj.retained = retained; }
	client.send(msgObj);

	var qosStr = ((qos > 0) ? "[qos " + qos + "]" : "");
	var retainedStr = ((retained) ? "[retained]" : "");
	appendLog("<span class='logPUB'>PUB [<span class='logTopic'>" + topic + "</topic>]" + qosStr + retainedStr + " <span class='logPayload'>" + message + "</span></span>");
}

var Panel = {
	CONNECT: "connect",
	SUBSCRIBE: "subscribe",
	PUBLISH: "publish",
	LOG: "log"
};

function openPanel(type) {
	$("#collapse"+(type.charAt(0).toUpperCase() + type.substring(1))).collapse("show");
	resize();
}

function closePanel(type) {
	$("#collapse"+(type.charAt(0).toUpperCase() + type.substring(1))).collapse("hide");
}

function connect(server, port, clientId, username, password, noCleanSession, useSSL, willMessage) {
	try {
		client = new Paho.MQTT.Client(server, parseFloat(port), clientId);
	} catch (error) {
		alert("Error:"+error);
	}

	client.onMessageArrived = onMessage;
	client.onConnectionLost = function(error) { 
		$("#connectedAlert").fadeOut();
		$("#connectionStatus").html("disconnected!  Error: ");
		console.log(error);
		closePanel(Panel.SUBSCRIBE);
		closePanel(Panel.PUBLISH);
		$("body").addClass("bgRed");
		$("body").removeClass("bgGreen");
		$(".requiresConnect").attr("disabled",true);
		$(".requiresDisconnect").attr("disabled",false);
		appendLog("Disconnected from " + server + ":" + port + ".  Code: " + error.errorCode + ", Message: " + error.errorMessage);
		subsList = {};
		$("#subscribeList").html("");
	}

	var connectOptions = new Object();
	connectOptions.useSSL = false;
	connectOptions.cleanSession = true;
	if (username) {
		connectOptions.userName = username;
	}
	if (password) {
		connectOptions.password = password;
	}
	if (noCleanSession) {
		connectOptions.cleanSession = false;
	}
	if (useSSL) {
		connectOptions.useSSL = true;
	}
	if (willMessage) {
		connectOptions.willMessage = willMessage;
	}

	connectOptions.keepAliveInterval = 3600;  // if no activity after one hour, disconnect
	connectOptions.timeout = 5;  
	connectOptions.onSuccess = function() { 
		$("#connectionStatus").html("<i style='padding-right: 8px' class='glyphicon glyphicon-ok'></i>" + server + ":" + port);
		closePanel(Panel.CONNECT);
		openPanel(Panel.SUBSCRIBE);
		openPanel(Panel.PUBLISH);
		$("body").addClass("bgGreen");
		$("body").removeClass("bgRed");
		$(".requiresConnect").attr("disabled",false);
		$(".requiresDisconnect").attr("disabled",true);
		appendLog("Connected to " + server + ":" + port);

		if (autoSubscribe) {
			var time = 500;
			for (var i in subTopics) {
				setTimeout((function(topic) {
					return function() {
						$("#subscribeTopic").val(topic);
						$("#subscribeButton").click();
					}
				})(subTopics[i]), time);
				time += 100;
			}
		}
		if (autoPublish) {
			setTimeout(function() {
				$("#publishButton").click();
			}, 500);
		}
	}
	connectOptions.onFailure = function(error) { 
		$("#errorAlertText").html("Failed to connect!");
		$("#connectedAlert").fadeOut();
		$("#connectionStatus").html("connection failure!");
		$("body").addClass("bgRed");
		$("body").removeClass("bgGreen");
		$("#errorAlert").fadeIn();
		setTimeout(function() { $("#errorAlert").fadeOut(); }, 2000);
		$(".requiresConnect").attr("disabled",true);
		$(".requiresDisconnect").attr("disabled",false);
		appendLog("Failed to connect to " + server + ":" + port + ".  Code: " + error.errorCode + ", Message: " + error.errorMessage);
	}

	$("#connectionStatus").html("connecting...");

	client.connect(connectOptions);
}

// function called whenever our MQTT connection receives a message
function onMessage(msg) {
	var topic = msg.destinationName;
	var payload = msg.payloadString;
	var qos = msg._getQos();
	var retained = msg._getRetained();

	var qosStr = ((qos > 0) ? "[qos " + qos + "]" : "");
	var retainedStr = ((retained) ? "[retained]" : "");
	appendLog("<span class='logRCV'>RCV [<span class='logTopic'>" + topic + "</span>]" + qosStr + retainedStr + " <span class='logPayload'>" + payload + "</span></span>");
}

var logEntries = 0;
function appendLog(msg) {
	logEntries++;
	msg = "<div id='logLine-"+logEntries+"' class='logLine'><span class='logTime'>(" + (new Date().format("yyyy-MM-ddThh:mm:ss").split("T"))[1].substr(0, 12) + ")</span><span class='logMessage'>" + msg + "</span></div>";
	$("#logContents").append(msg + "\n");
	$("#logSize").html(logEntries);
	if ($("#stickyLog").prop("checked")) {
		$("#logContents").prop("scrollTop", $("#logContents").prop("scrollHeight") - $("#logContents").height());
	}
}

function clearLog() {
	logEntries = 0;
	$("#logContents").html("");
	$("#logSize").html("0");
}

Date.prototype.format = function(fmt)  
{ //author: meizz  
 var o = {  
  "M+" : this.getMonth()+1,         //月份  
  "d+" : this.getDate(),          //日  
  "h+" : this.getHours(),          //小时  
  "m+" : this.getMinutes(),         //分  
  "s+" : this.getSeconds(),         //秒  
  "q+" : Math.floor((this.getMonth()+3)/3), //季度  
  "S" : this.getMilliseconds()       //毫秒  
 };  
 if(/(y+)/.test(fmt))  
  fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));  
 for(var k in o)  
  if(new RegExp("("+ k +")").test(fmt))  
 fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
 return fmt;  
} 
