<template>
    <div>
        <h1>{{msg}}</h1>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                reconnectTimeout: 2000,
                mqtt: {},
                msg:"",
            }
        },
        mounted() {
            this.MQTTconnect();
        },
        methods: {
            //实时货柜变化
            addtopic(msg) {
                this.msg = msg;
            },

            //实时通信
            MQTTconnect() {
                this.mqtt = new Paho.MQTT.Client(
                    host,
                    port,
                    "client" + this.getuuid(),
                );
                var options = {
                    timeout: 10,
                    useSSL: useTLS,
                    cleanSession: cleansession,
                    onSuccess: this.onConnect,
                    onFailure: function(message) {
                        //连接失败定时重连
                        setTimeout(this.MQTTconnect, this.reconnectTimeout);
                    }
                };
                this.mqtt.onConnectionLost = this.onConnectionLost;
                this.mqtt.onMessageArrived = this.onMessageArrived;
                if (username != null) {
                    options.userName = username;
                    options.password = password;
                }
                this.mqtt.connect(options);
            },
            //uuid随机生成
            getuuid() {
                var uid = [];
                var hexDigits = "0123456789abcdefghijklmnopqrst";
                for (var i = 0; i < 32; i++) {
                    uid[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                uid[6] = "4";
                uid[15] = hexDigits.substr((uid[15] & 0x3) | 0x8, 1);
                var uuid = uid.join("");
                return uuid;
            },
            //连接
            onConnect() {
                //连接成功，订阅主题
                this.mqtt.subscribe(addtopic, {
                    qos: 2
                });
               
                //发布一个消息 
                this.mqtt.send("login", "{\"command\":\"login\",\"clientId\":\"" + this.mqtt.clientId + "\"}", 0);
            },
            //连接丢失
            onConnectionLost(response) {
                //console.log("异常掉线，掉线信息为:" + response.errorMessage);
            },
    
            //接收到消息，处理
            onMessageArrived(message) {
                var topics = message.destinationName;
                var msg = $.parseJSON(message.payloadString);
                //判断主题
                if (topics == "add") {
                    //添加
                    this.addtopic(msg);
                }else {
                    return;
                }
            },
        },
    }
</script>

<style>
    .apps {
        width: 100%;
        overflow: hidden;
    }
</style>
